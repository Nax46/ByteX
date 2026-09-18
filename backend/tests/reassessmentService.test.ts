import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { StudentProfile, IStudentProfileDocument } from '../src/models/StudentProfile.js';
import { SkillModel } from '../src/models/Skill.js';
import { AssessmentModel } from '../src/models/Assessment.js';
import { QuestionModel } from '../src/models/Question.js';
import { AssessmentAttemptModel } from '../src/models/AssessmentAttempt.js';
import {
  calculateScoreComparison,
  createReassessmentAttempt,
  getReassessmentSummary,
} from '../src/services/reassessmentService.js';
import { ReassessmentError } from '../src/types/reassessment.js';
import { IAssessmentAttemptSkillScore, StudentAnswerSubmissionDTO } from '../src/types/assessment.js';
import { ISkill } from '../src/types/intelligence.js';

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
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await SkillModel.deleteMany({});
  await AssessmentModel.deleteMany({});
  await QuestionModel.deleteMany({});
  await AssessmentAttemptModel.deleteMany({});
});

describe('Reassessment Engine Service (P2-ROAD-004)', () => {
  const setupTestEnvironment = async (): Promise<{
    user: InstanceType<typeof User>;
    studentProfile: IStudentProfileDocument;
    jsSkill: InstanceType<typeof SkillModel>;
    reactSkill: InstanceType<typeof SkillModel>;
    assessment: InstanceType<typeof AssessmentModel>;
    jsQuestion: InstanceType<typeof QuestionModel>;
    reactQuestion: InstanceType<typeof QuestionModel>;
  }> => {
    const user = await User.create({
      email: `reassess-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`,
      passwordHash: 'hashedpass123',
    });

    const studentProfile = await StudentProfile.create({
      userId: user._id,
      fullName: 'Reassessment Student',
    });

    const randomSuffix = Math.floor(Math.random() * 100000);
    const jsSkill = await SkillModel.create({
      name: 'JavaScript',
      slug: `javascript-${randomSuffix}`,
      category: 'TECHNICAL',
      maxLevel: 100,
    });

    const reactSkill = await SkillModel.create({
      name: 'React',
      slug: `react-${randomSuffix}`,
      category: 'FRAMEWORK',
      maxLevel: 100,
    });

    const assessment = await AssessmentModel.create({
      title: 'Full Stack Diagnostic Assessment',
      slug: `fs-diagnostic-${randomSuffix}`,
      type: 'DIAGNOSTIC',
      targetSkillIds: [jsSkill._id, reactSkill._id],
      durationMinutes: 30,
      version: 1,
      isActive: true,
    });

    const jsQuestion = await QuestionModel.create({
      skillId: jsSkill._id,
      assessmentId: assessment._id,
      text: 'What is a closure in JavaScript?',
      options: [
        { optionId: 'opt-a', text: 'A function bound to its lexical environment' },
        { optionId: 'opt-b', text: 'An HTML tag' },
      ],
      correctOptionId: 'opt-a',
      difficulty: 'MEDIUM',
      points: 10,
      isActive: true,
    });

    const reactQuestion = await QuestionModel.create({
      skillId: reactSkill._id,
      assessmentId: assessment._id,
      text: 'What hook manages local state in React?',
      options: [
        { optionId: 'opt-a', text: 'useState' },
        { optionId: 'opt-b', text: 'useEffect' },
      ],
      correctOptionId: 'opt-a',
      difficulty: 'EASY',
      points: 10,
      isActive: true,
    });

    return { user, studentProfile, jsSkill, reactSkill, assessment, jsQuestion, reactQuestion };
  };

  // Test 1 — Create reassessment attempt
  it('Test 1 — Creates a new reassessment attempt document', async () => {
    const { user, studentProfile, assessment, jsQuestion, reactQuestion } =
      await setupTestEnvironment();

    const answers: StudentAnswerSubmissionDTO[] = [
      { questionId: jsQuestion._id.toString(), selectedOptionId: 'opt-a' },
      { questionId: reactQuestion._id.toString(), selectedOptionId: 'opt-a' },
    ];

    const attempt = await createReassessmentAttempt(
      user._id.toString(),
      assessment._id.toString(),
      answers
    );

    expect(attempt).toBeDefined();
    expect(attempt._id).toBeDefined();
    expect(attempt.studentProfileId!.toString()).toBe(studentProfile._id.toString());
    expect(attempt.status).toBe('COMPLETED');
    expect(attempt.skillScores).toHaveLength(2);
  });

  // Test 2 & 3 & 4 — Old assessment attempt remains unchanged and new attempt gets new ObjectId
  it('Test 2 & 3 — Old assessment attempt is strictly preserved with distinct ObjectId', async () => {
    const { user, assessment, jsQuestion, reactQuestion } = await setupTestEnvironment();

    // Submit Attempt 1 (0% correct)
    const answers1: StudentAnswerSubmissionDTO[] = [
      { questionId: jsQuestion._id.toString(), selectedOptionId: 'opt-b' },
      { questionId: reactQuestion._id.toString(), selectedOptionId: 'opt-b' },
    ];
    const attempt1 = await createReassessmentAttempt(
      user._id.toString(),
      assessment._id.toString(),
      answers1
    );

    // Wait 20ms to differentiate completedAt timestamps
    await new Promise((r) => setTimeout(r, 20));

    // Submit Attempt 2 (100% correct)
    const answers2: StudentAnswerSubmissionDTO[] = [
      { questionId: jsQuestion._id.toString(), selectedOptionId: 'opt-a' },
      { questionId: reactQuestion._id.toString(), selectedOptionId: 'opt-a' },
    ];
    const attempt2 = await createReassessmentAttempt(
      user._id.toString(),
      assessment._id.toString(),
      answers2
    );

    // Verify distinct ObjectIds
    expect(attempt1._id.toString()).not.toBe(attempt2._id.toString());

    // Verify Attempt 1 remained unchanged in database
    const fetchedAttempt1 = await AssessmentAttemptModel.findById(attempt1._id);
    expect(fetchedAttempt1).toBeDefined();
    expect(fetchedAttempt1!.answers![0].isCorrect).toBe(false);

    // Verify Attempt 2 has correct answers
    expect(attempt2.answers![0].isCorrect).toBe(true);
  });

  // Test 5 & 6 — Latest completed attempt becomes current evidence & previous attempt remains available
  it('Test 5 & 6 — Reassessment summary selects latest completed attempt while preserving previous attempt', async () => {
    const { user, assessment, jsQuestion, reactQuestion } = await setupTestEnvironment();

    // Attempt 1: Incorrect JS, Correct React
    await createReassessmentAttempt(user._id.toString(), assessment._id.toString(), [
      { questionId: jsQuestion._id.toString(), selectedOptionId: 'opt-b' },
      { questionId: reactQuestion._id.toString(), selectedOptionId: 'opt-a' },
    ]);

    await new Promise((r) => setTimeout(r, 20));

    // Attempt 2: Correct JS, Correct React
    const attempt2 = await createReassessmentAttempt(user._id.toString(), assessment._id.toString(), [
      { questionId: jsQuestion._id.toString(), selectedOptionId: 'opt-a' },
      { questionId: reactQuestion._id.toString(), selectedOptionId: 'opt-a' },
    ]);

    const summary = await getReassessmentSummary(user._id.toString(), assessment._id.toString());

    expect(summary.latestAttemptId.toString()).toBe(attempt2._id.toString());
    expect(summary.previousAttemptId).toBeDefined();
    expect(summary.attemptCount).toBe(2);
  });

  // Test 7 — Skill score comparison: Improvement (e.g. 0 -> 100 = +100, IMPROVED)
  it('Test 7 — Calculates score improvement (+change, IMPROVED trend)', () => {
    const jsSkillId = new Types.ObjectId();
    const previousScores: IAssessmentAttemptSkillScore[] = [
      { skillId: jsSkillId, score: 55, totalQuestions: 2, correctCount: 1, earnedPoints: 10, maxPoints: 20 },
    ];
    const latestScores: IAssessmentAttemptSkillScore[] = [
      { skillId: jsSkillId, score: 72, totalQuestions: 2, correctCount: 2, earnedPoints: 20, maxPoints: 20 },
    ];

    const result = calculateScoreComparison(latestScores, previousScores);

    expect(result.skillComparisons).toHaveLength(1);
    expect(result.skillComparisons[0].previousScore).toBe(55);
    expect(result.skillComparisons[0].currentScore).toBe(72);
    expect(result.skillComparisons[0].change).toBe(17);
    expect(result.skillComparisons[0].trend).toBe('IMPROVED');
    expect(result.overallPreviousScore).toBe(55);
    expect(result.overallCurrentScore).toBe(72);
    expect(result.overallChange).toBe(17);
  });

  // Test 8 — Decline (e.g. 72 -> 65 = -7, DECLINED)
  it('Test 8 — Calculates score decline (-change, DECLINED trend)', () => {
    const jsSkillId = new Types.ObjectId();
    const previousScores: IAssessmentAttemptSkillScore[] = [
      { skillId: jsSkillId, score: 72, totalQuestions: 2, correctCount: 2, earnedPoints: 20, maxPoints: 20 },
    ];
    const latestScores: IAssessmentAttemptSkillScore[] = [
      { skillId: jsSkillId, score: 65, totalQuestions: 2, correctCount: 1, earnedPoints: 10, maxPoints: 20 },
    ];

    const result = calculateScoreComparison(latestScores, previousScores);

    expect(result.skillComparisons[0].change).toBe(-7);
    expect(result.skillComparisons[0].trend).toBe('DECLINED');
  });

  // Test 9 — Unchanged (e.g. 70 -> 70 = 0, UNCHANGED)
  it('Test 9 — Calculates unchanged score (0 change, UNCHANGED trend)', () => {
    const jsSkillId = new Types.ObjectId();
    const previousScores: IAssessmentAttemptSkillScore[] = [
      { skillId: jsSkillId, score: 70, totalQuestions: 2, correctCount: 1, earnedPoints: 10, maxPoints: 20 },
    ];
    const latestScores: IAssessmentAttemptSkillScore[] = [
      { skillId: jsSkillId, score: 70, totalQuestions: 2, correctCount: 1, earnedPoints: 10, maxPoints: 20 },
    ];

    const result = calculateScoreComparison(latestScores, previousScores);

    expect(result.skillComparisons[0].change).toBe(0);
    expect(result.skillComparisons[0].trend).toBe('UNCHANGED');
  });

  // Test 10 — Missing skill in previous attempt handled safely
  it('Test 10 — Handles skill present in latest attempt but missing in previous attempt', () => {
    const jsSkillId = new Types.ObjectId();
    const reactSkillId = new Types.ObjectId();

    const previousScores: IAssessmentAttemptSkillScore[] = [
      { skillId: jsSkillId, score: 50, totalQuestions: 1, correctCount: 1, earnedPoints: 10, maxPoints: 10 },
    ];
    const latestScores: IAssessmentAttemptSkillScore[] = [
      { skillId: jsSkillId, score: 60, totalQuestions: 1, correctCount: 1, earnedPoints: 10, maxPoints: 10 },
      { skillId: reactSkillId, score: 80, totalQuestions: 1, correctCount: 1, earnedPoints: 10, maxPoints: 10 },
    ];

    const result = calculateScoreComparison(latestScores, previousScores);

    const reactComparison = result.skillComparisons.find(
      (s) => s.skillId.toString() === reactSkillId.toString()
    )!;
    expect(reactComparison.previousScore).toBeNull();
    expect(reactComparison.change).toBeNull();
    expect(reactComparison.trend).toBe('NEW_EVIDENCE');
  });

  // Test 11 — Missing skill in latest attempt handled safely
  it('Test 11 — Handles case when previousScores is null (first completed attempt)', () => {
    const jsSkillId = new Types.ObjectId();
    const latestScores: IAssessmentAttemptSkillScore[] = [
      { skillId: jsSkillId, score: 85, totalQuestions: 1, correctCount: 1, earnedPoints: 10, maxPoints: 10 },
    ];

    const result = calculateScoreComparison(latestScores, null);

    expect(result.overallPreviousScore).toBeNull();
    expect(result.overallCurrentScore).toBe(85);
    expect(result.overallChange).toBeNull();
    expect(result.skillComparisons[0].trend).toBe('NEW_EVIDENCE');
  });

  // Test 12 — Unauthorized student cannot reassess another student's assessment
  it('Test 12 — Non-existent student identity throws ReassessmentError (404/400)', async () => {
    const fakeId = new Types.ObjectId().toString();

    await expect(
      getReassessmentSummary(fakeId)
    ).rejects.toThrow(ReassessmentError);
  });

  // Test 13 — Inactive/invalid assessment rejected
  it('Test 13 — Reassessment attempt on inactive assessment throws ReassessmentError (400)', async () => {
    const { user, assessment, jsQuestion } = await setupTestEnvironment();

    // Deactivate assessment
    assessment.isActive = false;
    await assessment.save();

    await expect(
      createReassessmentAttempt(user._id.toString(), assessment._id.toString(), [
        { questionId: jsQuestion._id.toString(), selectedOptionId: 'opt-a' },
      ])
    ).rejects.toThrow(ReassessmentError);
  });

  // Test 14 — No historical attempt mutation
  it('Test 14 — Multiple reassessments accumulate historical attempts without mutating prior records', async () => {
    const { user, assessment, jsQuestion } = await setupTestEnvironment();

    // Attempt 1
    const a1 = await createReassessmentAttempt(user._id.toString(), assessment._id.toString(), [
      { questionId: jsQuestion._id.toString(), selectedOptionId: 'opt-a' },
    ]);

    // Attempt 2
    const a2 = await createReassessmentAttempt(user._id.toString(), assessment._id.toString(), [
      { questionId: jsQuestion._id.toString(), selectedOptionId: 'opt-b' },
    ]);

    // Attempt 3
    const a3 = await createReassessmentAttempt(user._id.toString(), assessment._id.toString(), [
      { questionId: jsQuestion._id.toString(), selectedOptionId: 'opt-a' },
    ]);

    const totalCount = await AssessmentAttemptModel.countDocuments({
      studentProfileId: a1.studentProfileId,
    });

    expect(totalCount).toBe(3);
    expect(a1._id.toString()).not.toBe(a2._id.toString());
    expect(a2._id.toString()).not.toBe(a3._id.toString());
  });

  // Test 15 — Pure comparison engine does not mutate input
  it('Test 15 — Pure calculateScoreComparison does not mutate input arrays', () => {
    const jsSkillId = new Types.ObjectId();
    const prev: IAssessmentAttemptSkillScore[] = [
      { skillId: jsSkillId, score: 50, totalQuestions: 1, correctCount: 1, earnedPoints: 10, maxPoints: 10 },
    ];
    const curr: IAssessmentAttemptSkillScore[] = [
      { skillId: jsSkillId, score: 80, totalQuestions: 1, correctCount: 1, earnedPoints: 10, maxPoints: 10 },
    ];

    const frozenPrev = Object.freeze([...prev]);
    const frozenCurr = Object.freeze([...curr]);

    const result = calculateScoreComparison(frozenCurr as any, frozenPrev as any);

    expect(result.skillComparisons[0].change).toBe(30);
    expect(frozenPrev[0].score).toBe(50);
    expect(frozenCurr[0].score).toBe(80);
  });
});
