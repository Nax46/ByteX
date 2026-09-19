import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { StudentProfile } from '../src/models/StudentProfile.js';
import { SkillModel } from '../src/models/Skill.js';
import { CareerModel } from '../src/models/Career.js';
import { CareerSkillModel } from '../src/models/CareerSkill.js';
import { AssessmentModel } from '../src/models/Assessment.js';
import { QuestionModel } from '../src/models/Question.js';
import { AssessmentAttemptModel, AssessmentStatus } from '../src/models/AssessmentAttempt.js';
import { createReassessmentAttempt, getReassessmentSummary } from '../src/services/reassessmentService.js';
import { getDashboardSummary } from '../src/services/dashboard.service.js';
import { getAssessmentHistory, getAttemptById } from '../src/services/assessment.service.js';
import { generateAdaptiveRoadmapForStudent } from '../src/services/adaptiveRoadmapService.js';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
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
  await CareerModel.deleteMany({});
  await CareerSkillModel.deleteMany({});
  await AssessmentModel.deleteMany({});
  await QuestionModel.deleteMany({});
  await AssessmentAttemptModel.deleteMany({});
});

describe('Reassessment Integration & Cross-Engine Synchronization', () => {
  it('E2E Reassessment: Evaluates answers, records trends, updates dashboard, and adapts roadmap', async () => {
    // 1. Setup Student Persona
    const studentUser = await User.create({
      email: `student-${Date.now()}@skillpath.dev`,
      passwordHash: 'argon2-hashed-pass',
    });

    const studentProfile = await StudentProfile.create({
      userId: studentUser._id,
      fullName: 'Dev Student',
      targetCareer: 'Full Stack Engineer',
    });

    // 2. Setup Skills & Career
    const jsSkill = await SkillModel.create({
      name: 'JavaScript',
      slug: 'javascript',
      category: 'TECHNICAL',
      maxLevel: 100,
    });

    const reactSkill = await SkillModel.create({
      name: 'React',
      slug: 'react',
      category: 'FRAMEWORK',
      maxLevel: 100,
    });

    const career = await CareerModel.create({
      title: 'Full Stack Engineer',
      slug: 'full-stack-engineer',
      description: 'End to end web application development',
    });

    await CareerSkillModel.create([
      { careerId: career._id, skillId: jsSkill._id, requiredLevel: 80, importance: 'CRITICAL' },
      { careerId: career._id, skillId: reactSkill._id, requiredLevel: 80, importance: 'HIGH' },
    ]);

    // 3. Setup Assessment & Questions
    const assessment = await AssessmentModel.create({
      title: 'Full Stack Diagnostic',
      slug: 'full-stack-diagnostic',
      type: 'DIAGNOSTIC',
      targetSkillIds: [jsSkill._id, reactSkill._id],
      durationMinutes: 30,
      version: 1,
      isActive: true,
    });

    const q1 = await QuestionModel.create({
      skillId: jsSkill._id,
      assessmentId: assessment._id,
      text: 'What is event bubbling?',
      options: [
        { optionId: 'opt-correct', text: 'Events propagate up the DOM tree' },
        { optionId: 'opt-wrong', text: 'Events are cancelled' },
      ],
      correctOptionId: 'opt-correct',
      difficulty: 'MEDIUM',
      points: 10,
      isActive: true,
    });

    const q2 = await QuestionModel.create({
      skillId: reactSkill._id,
      assessmentId: assessment._id,
      text: 'What does useEffect do?',
      options: [
        { optionId: 'opt-correct', text: 'Performs side effects in components' },
        { optionId: 'opt-wrong', text: 'Renders DOM elements' },
      ],
      correctOptionId: 'opt-correct',
      difficulty: 'MEDIUM',
      points: 10,
      isActive: true,
    });

    // 4. Initial Attempt: 1 correct, 1 wrong (50% score)
    const initialAttempt = await createReassessmentAttempt(
      studentUser._id.toString(),
      assessment._id.toString(),
      [
        { questionId: q1._id.toString(), selectedOptionId: 'opt-correct', timeTakenSeconds: 20 },
        { questionId: q2._id.toString(), selectedOptionId: 'opt-wrong', timeTakenSeconds: 25 },
      ]
    );

    expect(initialAttempt).toBeDefined();
    expect(initialAttempt.status).toBe(AssessmentStatus.COMPLETED);
    expect(initialAttempt.totalEarnedPoints).toBe(10);
    expect(initialAttempt.totalMaxPoints).toBe(20);

    // Initial summary has attemptCount 1
    const summary1 = await getReassessmentSummary(studentUser._id.toString(), assessment._id.toString());
    expect(summary1.attemptCount).toBe(1);
    expect(summary1.overallPreviousScore).toBeNull();
    expect(summary1.overallChange).toBeNull();
    expect(summary1.overallCurrentScore).toBe(50);
    expect(summary1.skillComparisons[0].trend).toBe('NEW_EVIDENCE');

    // 5. Reassessment Attempt: 2 correct (100% score)
    const reassessmentAttempt = await createReassessmentAttempt(
      studentUser._id.toString(),
      assessment._id.toString(),
      [
        { questionId: q1._id.toString(), selectedOptionId: 'opt-correct', timeTakenSeconds: 15 },
        { questionId: q2._id.toString(), selectedOptionId: 'opt-correct', timeTakenSeconds: 18 },
      ]
    );

    // Link userId if Person 1 controller does so
    reassessmentAttempt.userId = studentUser._id;
    await reassessmentAttempt.save();

    expect(reassessmentAttempt._id.toString()).not.toBe(initialAttempt._id.toString());
    expect(reassessmentAttempt.totalEarnedPoints).toBe(20);

    // 6. Verify Prior Attempt remains untouched (immutability rule)
    const freshInitial = await AssessmentAttemptModel.findById(initialAttempt._id).lean();
    expect(freshInitial?.totalEarnedPoints).toBe(10);

    // 7. Verify Reassessment Summary demonstrates score improvement
    const summary2 = await getReassessmentSummary(studentUser._id.toString(), assessment._id.toString());
    expect(summary2.attemptCount).toBe(2);
    expect(summary2.overallPreviousScore).toBe(50);
    expect(summary2.overallCurrentScore).toBe(100);
    expect(summary2.overallChange).toBe(50);

    const reactComparison = summary2.skillComparisons.find(
      (s) => s.skillId.toString() === reactSkill._id.toString()
    );
    expect(reactComparison).toBeDefined();
    expect(reactComparison?.previousScore).toBe(0);
    expect(reactComparison?.currentScore).toBe(100);
    expect(reactComparison?.change).toBe(100);
    expect(reactComparison?.trend).toBe('IMPROVED');

    // 8. Verify Dashboard Service reflects latest reassessment attempt
    const dashboard = await getDashboardSummary(studentUser._id.toString());
    expect(dashboard.assessment.latestAttempt).toBeDefined();
    expect(dashboard.assessment.latestAttempt?.id).toBe(reassessmentAttempt._id.toString());
    expect(dashboard.assessment.latestAttempt?.status).toBe(AssessmentStatus.COMPLETED);

    // 9. Verify Assessment History returns both attempts
    const history = await getAssessmentHistory(studentUser._id.toString(), 1, 10);
    expect(history.pagination.total).toBe(2);
    expect(history.attempts.length).toBe(2);

    // 10. Verify Attempt Ownership security
    const loadedAttempt = await getAttemptById(reassessmentAttempt._id.toString(), studentUser._id.toString());
    expect(loadedAttempt.id).toBe(reassessmentAttempt._id.toString());

    // Block cross-student access
    const anotherUser = await User.create({
      email: `intruder-${Date.now()}@hack.dev`,
      passwordHash: 'fakehash',
    });
    await expect(
      getAttemptById(reassessmentAttempt._id.toString(), anotherUser._id.toString())
    ).rejects.toThrow('Forbidden');

    // 11. Verify Adaptive Roadmap generation consumes the reassessment
    const adaptiveRoadmap = await generateAdaptiveRoadmapForStudent(
      studentUser._id.toString(),
      career._id.toString(),
      { force: true }
    );
    expect(adaptiveRoadmap).toBeDefined();
    expect(adaptiveRoadmap.version).toBeGreaterThanOrEqual(1);
  });
});
