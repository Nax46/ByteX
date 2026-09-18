import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SkillModel } from '../src/models/Skill.js';
import { CareerModel } from '../src/models/Career.js';
import { AssessmentModel } from '../src/models/Assessment.js';
import { QuestionModel } from '../src/models/Question.js';
import { AssessmentAttemptModel } from '../src/models/AssessmentAttempt.js';
import {
  QuestionCreateZodSchema,
  AssessmentCreateZodSchema,
  AssessmentAttemptCreateZodSchema,
  toStudentFacingQuestionDTO,
} from '../src/schemas/assessmentValidation.js';
import { seedFoundationData } from '../src/seed/foundationSeed.js';
import { seedAssessmentData } from '../src/seed/assessmentSeed.js';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await SkillModel.deleteMany({});
  await CareerModel.deleteMany({});
  await AssessmentModel.deleteMany({});
  await QuestionModel.deleteMany({});
  await AssessmentAttemptModel.deleteMany({});
});

describe('Assessment Model & Validation', () => {
  it('should create a valid Assessment document', async () => {
    const skill = await SkillModel.create({ name: 'Node.js', slug: 'node-js', category: 'TECHNICAL' });

    const validAssessment = {
      title: 'Node.js Core Evaluation',
      slug: 'node-js-core-evaluation',
      type: 'SKILL_SPECIFIC' as const,
      description: 'Tests Node.js fundamentals',
      targetSkillIds: [skill._id.toString()],
      durationMinutes: 20,
      version: 1,
      isActive: true,
    };

    const zodParsed = AssessmentCreateZodSchema.parse(validAssessment);
    expect(zodParsed.title).toBe('Node.js Core Evaluation');

    const doc = await AssessmentModel.create({
      ...validAssessment,
      targetSkillIds: [skill._id],
    });

    expect(doc._id).toBeDefined();
    expect(doc.slug).toBe('node-js-core-evaluation');
    expect(doc.durationMinutes).toBe(20);
  });

  it('should enforce unique slug constraint on Assessment', async () => {
    await AssessmentModel.init();
    const skill = await SkillModel.create({ name: 'Git', slug: 'git', category: 'TOOL' });
    const assessmentData = {
      title: 'Git Assessment',
      slug: 'git-assessment',
      type: 'SKILL_SPECIFIC' as const,
      targetSkillIds: [skill._id],
    };

    await AssessmentModel.create(assessmentData);
    await expect(AssessmentModel.create(assessmentData)).rejects.toThrow();
  });
});

describe('Question Model & Security DTO', () => {
  it('should create a valid Question and enforce question security via toStudentFacingQuestionDTO', async () => {
    const skill = await SkillModel.create({ name: 'REST API', slug: 'rest-api', category: 'CORE_CS' });

    const questionData = {
      skillId: skill._id.toString(),
      text: 'Which HTTP method is used to create a resource?',
      options: [
        { optionId: 'a', text: 'GET' },
        { optionId: 'b', text: 'POST' },
      ],
      correctOptionId: 'b',
      difficulty: 'EASY' as const,
      points: 10,
      explanation: 'POST creates resources in REST APIs.',
      isActive: true,
    };

    const zodParsed = QuestionCreateZodSchema.parse(questionData);
    expect(zodParsed.correctOptionId).toBe('b');

    const doc = await QuestionModel.create({
      ...questionData,
      skillId: skill._id,
    });

    expect(doc._id).toBeDefined();
    expect(doc.correctOptionId).toBe('b');
    expect(doc.explanation).toBe('POST creates resources in REST APIs.');

    // Security Check: Student-facing DTO transformation
    const studentDTO = toStudentFacingQuestionDTO(doc);
    expect(studentDTO.text).toBe('Which HTTP method is used to create a resource?');
    expect(studentDTO.options.length).toBe(2);
    expect(studentDTO.difficulty).toBe('EASY');

    // Verify sensitive fields are stripped
    expect((studentDTO as any).correctOptionId).toBeUndefined();
    expect((studentDTO as any).explanation).toBeUndefined();
  });

  it('should reject Question when correctOptionId does not match any optionId', async () => {
    const skill = await SkillModel.create({ name: 'React', slug: 'react', category: 'FRAMEWORK' });

    const invalidQuestion = {
      skillId: skill._id.toString(),
      text: 'What hook handles side effects?',
      options: [
        { optionId: 'a', text: 'useState' },
        { optionId: 'b', text: 'useEffect' },
      ],
      correctOptionId: 'x', // Invalid: 'x' does not exist in options
      difficulty: 'EASY' as const,
    };

    expect(() => QuestionCreateZodSchema.parse(invalidQuestion)).toThrow();
  });

  it('should reject Question with fewer than 2 options', async () => {
    const skill = await SkillModel.create({ name: 'Express', slug: 'express', category: 'FRAMEWORK' });

    const invalidQuestion = {
      skillId: skill._id.toString(),
      text: 'Express middleware syntax?',
      options: [{ optionId: 'a', text: 'Only one option' }],
      correctOptionId: 'a',
      difficulty: 'EASY' as const,
    };

    expect(() => QuestionCreateZodSchema.parse(invalidQuestion)).toThrow();
  });
});

describe('AssessmentAttempt Model & Historical Preservation', () => {
  it('should create an AssessmentAttempt and preserve multiple attempt records for a student', async () => {
    const skill = await SkillModel.create({ name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' });
    const assessment = await AssessmentModel.create({
      title: 'JS Diagnostic',
      slug: 'js-diagnostic',
      type: 'DIAGNOSTIC',
      targetSkillIds: [skill._id],
    });
    const question = await QuestionModel.create({
      skillId: skill._id,
      text: 'JS equality operator?',
      options: [
        { optionId: 'a', text: '==' },
        { optionId: 'b', text: '===' },
      ],
      correctOptionId: 'b',
      difficulty: 'EASY',
    });

    const studentProfileId = new mongoose.Types.ObjectId();

    // First Attempt
    const attempt1Data = {
      studentProfileId: studentProfileId.toString(),
      assessmentId: assessment._id.toString(),
      answers: [{ questionId: question._id.toString(), selectedOptionId: 'a' }],
    };
    AssessmentAttemptCreateZodSchema.parse(attempt1Data);

    const attempt1 = await AssessmentAttemptModel.create({
      studentProfileId,
      assessmentId: assessment._id,
      status: 'COMPLETED',
      answers: [{ questionId: question._id, selectedOptionId: 'a', isCorrect: false, pointsEarned: 0 }],
      totalEarnedPoints: 0,
      totalMaxPoints: 10,
    });

    // Second Attempt (Reassessment)
    const attempt2 = await AssessmentAttemptModel.create({
      studentProfileId,
      assessmentId: assessment._id,
      status: 'COMPLETED',
      answers: [{ questionId: question._id, selectedOptionId: 'b', isCorrect: true, pointsEarned: 10 }],
      totalEarnedPoints: 10,
      totalMaxPoints: 10,
    });

    expect(attempt1._id).toBeDefined();
    expect(attempt2._id).toBeDefined();
    expect(attempt1._id.toString()).not.toBe(attempt2._id.toString());

    // Historical Preservation Check: Both attempts exist in DB
    const studentAttempts = await AssessmentAttemptModel.find({ studentProfileId }).sort({ completedAt: 1 });
    expect(studentAttempts.length).toBe(2);
    expect(studentAttempts[0].totalEarnedPoints).toBe(0);
    expect(studentAttempts[1].totalEarnedPoints).toBe(10);
  });

  it('should reject invalid studentProfileId or assessmentId format in Zod schema', () => {
    const invalidAttempt = {
      studentProfileId: 'invalid-id',
      assessmentId: 'invalid-id',
      answers: [],
    };

    expect(() => AssessmentAttemptCreateZodSchema.parse(invalidAttempt)).toThrow();
  });
});

describe('Assessment Seed Idempotency', () => {
  it('should execute foundation and assessment seeds idempotently across multiple runs', async () => {
    await seedFoundationData();
    const firstRun = await seedAssessmentData();

    expect(firstRun.assessmentsProcessed).toBe(1);
    expect(firstRun.questionsProcessed).toBe(27); // 9 skills x 3 difficulty questions
    expect(firstRun.skillsCoveredCount).toBe(9);

    const initialAssessmentCount = await AssessmentModel.countDocuments();
    const initialQuestionCount = await QuestionModel.countDocuments();

    expect(initialAssessmentCount).toBe(1);
    expect(initialQuestionCount).toBe(27);

    // Second Run
    const secondRun = await seedAssessmentData();
    expect(secondRun.questionsProcessed).toBe(27);

    const postAssessmentCount = await AssessmentModel.countDocuments();
    const postQuestionCount = await QuestionModel.countDocuments();

    expect(postAssessmentCount).toBe(initialAssessmentCount);
    expect(postQuestionCount).toBe(initialQuestionCount);
  });
});
