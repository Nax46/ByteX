import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SkillModel } from '../src/models/Skill.js';
import { CareerModel } from '../src/models/Career.js';
import { AssessmentModel } from '../src/models/Assessment.js';
import { QuestionModel } from '../src/models/Question.js';
import { AssessmentAttemptModel } from '../src/models/AssessmentAttempt.js';
import {
  gradeSingleAnswer,
  calculateTotals,
  calculatePerSkillScores,
  calculateDeterministicScoring,
} from '../src/services/deterministicScoring.js';
import { AssessmentScoringService } from '../src/services/assessmentScoringService.js';
import { IQuestion } from '../src/types/assessment.js';

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
  vi.restoreAllMocks();
});

describe('Pure Deterministic Scoring Functions', () => {
  it('should grade correct answer with full points and incorrect answer with zero points', () => {
    const skillId = new Types.ObjectId();
    const question: IQuestion = {
      _id: new Types.ObjectId(),
      skillId,
      text: 'Sample Q',
      options: [
        { optionId: 'a', text: 'Opt A' },
        { optionId: 'b', text: 'Opt B' },
      ],
      correctOptionId: 'b',
      difficulty: 'MEDIUM',
      points: 20,
      isActive: true,
    };

    // Correct Submission
    const correctRes = gradeSingleAnswer(
      { questionId: question._id!.toString(), selectedOptionId: 'b' },
      question
    );
    expect(correctRes.isCorrect).toBe(true);
    expect(correctRes.pointsEarned).toBe(20);

    // Incorrect Submission
    const incorrectRes = gradeSingleAnswer(
      { questionId: question._id!.toString(), selectedOptionId: 'a' },
      question
    );
    expect(incorrectRes.isCorrect).toBe(false);
    expect(incorrectRes.pointsEarned).toBe(0);
  });

  it('should calculate totals and per-skill scores (0-100 normalization) deterministically', () => {
    const jsSkillId = new Types.ObjectId();
    const reactSkillId = new Types.ObjectId();

    const q1: IQuestion = {
      _id: new Types.ObjectId(),
      skillId: jsSkillId,
      text: 'JS Q1',
      options: [{ optionId: 'a', text: 'A' }, { optionId: 'b', text: 'B' }],
      correctOptionId: 'a',
      difficulty: 'EASY',
      points: 10,
      isActive: true,
    };

    const q2: IQuestion = {
      _id: new Types.ObjectId(),
      skillId: jsSkillId,
      text: 'JS Q2',
      options: [{ optionId: 'a', text: 'A' }, { optionId: 'b', text: 'B' }],
      correctOptionId: 'b',
      difficulty: 'HARD',
      points: 30,
      isActive: true,
    };

    const q3: IQuestion = {
      _id: new Types.ObjectId(),
      skillId: reactSkillId,
      text: 'React Q1',
      options: [{ optionId: 'a', text: 'A' }, { optionId: 'b', text: 'B' }],
      correctOptionId: 'a',
      difficulty: 'MEDIUM',
      points: 20,
      isActive: true,
    };

    const questionMap = new Map<string, IQuestion>([
      [q1._id!.toString(), q1],
      [q2._id!.toString(), q2],
      [q3._id!.toString(), q3],
    ]);

    const submissions = [
      { questionId: q1._id!.toString(), selectedOptionId: 'a' }, // JS: 10 / 10
      { questionId: q2._id!.toString(), selectedOptionId: 'a' }, // JS: 0 / 30 (incorrect)
      { questionId: q3._id!.toString(), selectedOptionId: 'a' }, // React: 20 / 20
    ];

    const result = calculateDeterministicScoring(submissions, questionMap);

    expect(result.totalEarnedPoints).toBe(30); // 10 + 0 + 20
    expect(result.totalMaxPoints).toBe(60);   // 10 + 30 + 20

    const jsScoreObj = result.skillScores.find((s) => s.skillId.toString() === jsSkillId.toString());
    const reactScoreObj = result.skillScores.find((s) => s.skillId.toString() === reactSkillId.toString());

    // JS: earned 10 out of 40 = 25%
    expect(jsScoreObj).toBeDefined();
    expect(jsScoreObj!.score).toBe(25);
    expect(jsScoreObj!.earnedPoints).toBe(10);
    expect(jsScoreObj!.maxPoints).toBe(40);

    // React: earned 20 out of 20 = 100%
    expect(reactScoreObj).toBeDefined();
    expect(reactScoreObj!.score).toBe(100);
    expect(reactScoreObj!.earnedPoints).toBe(20);
    expect(reactScoreObj!.maxPoints).toBe(20);
  });
});

describe('AssessmentScoringService Integration & Validation', () => {
  let jsSkill: any;
  let reactSkill: any;
  let assessment: any;
  let q1: any;
  let q2: any;
  const studentProfileId = new Types.ObjectId().toString();

  beforeEach(async () => {
    jsSkill = await SkillModel.create({ name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' });
    reactSkill = await SkillModel.create({ name: 'React', slug: 'react', category: 'FRAMEWORK' });

    assessment = await AssessmentModel.create({
      title: 'Web Dev Assessment',
      slug: 'web-dev-assessment',
      type: 'DIAGNOSTIC',
      targetSkillIds: [jsSkill._id, reactSkill._id],
    });

    q1 = await QuestionModel.create({
      skillId: jsSkill._id,
      assessmentId: assessment._id,
      text: 'JS strict equality?',
      options: [
        { optionId: 'a', text: '==' },
        { optionId: 'b', text: '===' },
      ],
      correctOptionId: 'b',
      difficulty: 'EASY',
      points: 10,
    });

    q2 = await QuestionModel.create({
      skillId: reactSkill._id,
      assessmentId: assessment._id,
      text: 'React effect hook?',
      options: [
        { optionId: 'a', text: 'useEffect' },
        { optionId: 'b', text: 'useState' },
      ],
      correctOptionId: 'a',
      difficulty: 'MEDIUM',
      points: 20,
    });
  });

  it('should evaluate submission and save completed AssessmentAttempt', async () => {
    const payload = {
      studentProfileId,
      assessmentId: assessment._id.toString(),
      answers: [
        { questionId: q1._id.toString(), selectedOptionId: 'b' },
        { questionId: q2._id.toString(), selectedOptionId: 'a' },
      ],
    };

    const attempt = await AssessmentScoringService.evaluateAndSaveAttempt(payload);

    expect(attempt._id).toBeDefined();
    expect(attempt.status).toBe('COMPLETED');
    expect(attempt.totalEarnedPoints).toBe(30);
    expect(attempt.totalMaxPoints).toBe(30);
    expect(attempt.skillScores?.length).toBe(2);

    const jsScore = attempt.skillScores?.find((s) => s.skillId.toString() === jsSkill._id.toString());
    expect(jsScore?.score).toBe(100);
  });

  it('should reject empty answer submissions', async () => {
    const payload = {
      studentProfileId,
      assessmentId: assessment._id.toString(),
      answers: [],
    };

    await expect(AssessmentScoringService.evaluateAndSaveAttempt(payload)).rejects.toThrow(
      'Assessment submission must contain at least one answer.'
    );
  });

  it('should reject duplicate question submissions', async () => {
    const payload = {
      studentProfileId,
      assessmentId: assessment._id.toString(),
      answers: [
        { questionId: q1._id.toString(), selectedOptionId: 'b' },
        { questionId: q1._id.toString(), selectedOptionId: 'a' },
      ],
    };

    await expect(AssessmentScoringService.evaluateAndSaveAttempt(payload)).rejects.toThrow(
      'Duplicate question submission detected'
    );
  });

  it('should reject non-existent question submissions', async () => {
    const fakeQId = new Types.ObjectId().toString();
    const payload = {
      studentProfileId,
      assessmentId: assessment._id.toString(),
      answers: [{ questionId: fakeQId, selectedOptionId: 'a' }],
    };

    await expect(AssessmentScoringService.evaluateAndSaveAttempt(payload)).rejects.toThrow(
      'One or more submitted questions do not exist.'
    );
  });

  it('should reject cross-assessment question submissions', async () => {
    const otherAssessment = await AssessmentModel.create({
      title: 'Other Assessment',
      slug: 'other-assessment',
      type: 'SKILL_SPECIFIC',
      targetSkillIds: [jsSkill._id],
    });

    const otherQuestion = await QuestionModel.create({
      skillId: jsSkill._id,
      assessmentId: otherAssessment._id,
      text: 'Other Q',
      options: [{ optionId: 'a', text: 'A' }, { optionId: 'b', text: 'B' }],
      correctOptionId: 'a',
      difficulty: 'EASY',
    });

    const payload = {
      studentProfileId,
      assessmentId: assessment._id.toString(), // Submitting for first assessment
      answers: [{ questionId: otherQuestion._id.toString(), selectedOptionId: 'a' }],
    };

    await expect(AssessmentScoringService.evaluateAndSaveAttempt(payload)).rejects.toThrow(
      'does not belong to assessment'
    );
  });

  it('should reject invalid selectedOptionId submissions', async () => {
    const payload = {
      studentProfileId,
      assessmentId: assessment._id.toString(),
      answers: [{ questionId: q1._id.toString(), selectedOptionId: 'z' }], // 'z' does not exist in options
    };

    await expect(AssessmentScoringService.evaluateAndSaveAttempt(payload)).rejects.toThrow(
      'Invalid selectedOptionId "z"'
    );
  });

  it('should preserve historical attempt records when a student submits multiple attempts', async () => {
    const payload1 = {
      studentProfileId,
      assessmentId: assessment._id.toString(),
      answers: [
        { questionId: q1._id.toString(), selectedOptionId: 'a' }, // Incorrect
        { questionId: q2._id.toString(), selectedOptionId: 'b' }, // Incorrect
      ],
    };

    const attempt1 = await AssessmentScoringService.evaluateAndSaveAttempt(payload1);
    expect(attempt1.totalEarnedPoints).toBe(0);

    const payload2 = {
      studentProfileId,
      assessmentId: assessment._id.toString(),
      answers: [
        { questionId: q1._id.toString(), selectedOptionId: 'b' }, // Correct
        { questionId: q2._id.toString(), selectedOptionId: 'a' }, // Correct
      ],
    };

    const attempt2 = await AssessmentScoringService.evaluateAndSaveAttempt(payload2);
    expect(attempt2.totalEarnedPoints).toBe(30);

    // Verify historical preservation
    const attempts = await AssessmentAttemptModel.find({ studentProfileId }).sort({ completedAt: 1 });
    expect(attempts.length).toBe(2);
    expect(attempts[0].totalEarnedPoints).toBe(0);
    expect(attempts[1].totalEarnedPoints).toBe(30);
  });

  it('should batch fetch questions in a single MongoDB query to prevent N+1 queries', async () => {
    const spy = vi.spyOn(QuestionModel, 'find');

    const payload = {
      studentProfileId,
      assessmentId: assessment._id.toString(),
      answers: [
        { questionId: q1._id.toString(), selectedOptionId: 'b' },
        { questionId: q2._id.toString(), selectedOptionId: 'a' },
      ],
    };

    await AssessmentScoringService.evaluateAndSaveAttempt(payload);

    // Verify QuestionModel.find was called exactly ONCE for all questions
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      _id: { $in: [q1._id, q2._id] },
    });
  });
});
