import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, UserRole } from '../src/models/User.js';
import { StudentProfile } from '../src/models/StudentProfile.js';
import { SkillModel } from '../src/models/Skill.js';
import { CareerModel } from '../src/models/Career.js';
import { CareerSkillModel } from '../src/models/CareerSkill.js';
import { AssessmentModel } from '../src/models/Assessment.js';
import { AssessmentAttemptModel } from '../src/models/AssessmentAttempt.js';
import { RoadmapModel } from '../src/models/Roadmap.js';
import {
  getPersonalizedSummaryHandler,
  getSkillExplanationHandler,
  askAIMentorHandler,
} from '../src/controllers/aiPersonalization.controller.js';
import { getSkillGapPriorityHandler } from '../src/controllers/intelligence.controller.js';

let mongoServer: MongoMemoryServer;

const createMockRes = () => {
  const res: any = {};
  res.statusCode = 200;
  res.body = null;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    res.body = data;
    return res;
  };
  return res;
};

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
  await CareerModel.deleteMany({});
  await CareerSkillModel.deleteMany({});
  await AssessmentModel.deleteMany({});
  await AssessmentAttemptModel.deleteMany({});
  await RoadmapModel.deleteMany({});
});

describe('AI Career Recommendation Integration & Personalization Pipeline', () => {
  it('Executes full AI Career Recommendation journey from assessment evidence to personalized career guidance', async () => {
    // 1. Setup Student Account & Profile
    const studentUser = await User.create({
      email: 'career.student@skillpath.dev',
      passwordHash: 'hashedSecretPass123',
      role: UserRole.STUDENT,
    });

    const studentProfile = await StudentProfile.create({
      userId: studentUser._id,
      fullName: 'Career Explorer Student',
      targetCareer: 'Full Stack Developer',
    });

    // 2. Setup Skills & Career Requirements
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
      title: 'Full Stack Developer',
      slug: 'full-stack-developer',
      description: 'Designs and builds full stack web applications.',
      category: 'Web Development',
      isActive: true,
    });

    await CareerSkillModel.create({
      careerId: career._id,
      skillId: jsSkill._id,
      requiredLevel: 85,
      importance: 'CRITICAL',
      weight: 1.0,
      prerequisites: [],
    });

    await CareerSkillModel.create({
      careerId: career._id,
      skillId: reactSkill._id,
      requiredLevel: 80,
      importance: 'HIGH',
      weight: 1.0,
      prerequisites: [jsSkill._id],
    });

    // 3. Setup Assessment & Completed Attempt
    const assessment = await AssessmentModel.create({
      title: 'Full Stack Diagnostic',
      slug: 'full-stack-diagnostic',
      type: 'DIAGNOSTIC',
    });

    await AssessmentAttemptModel.create({
      userId: studentUser._id,
      studentProfileId: studentProfile._id,
      assessmentId: assessment._id,
      status: 'COMPLETED',
      completedAt: new Date(),
      totalEarnedPoints: 60,
      totalMaxPoints: 100,
      skillScores: [
        {
          skillId: jsSkill._id,
          score: 60,
          totalQuestions: 5,
          correctCount: 3,
          earnedPoints: 60,
          maxPoints: 100,
        },
        {
          skillId: reactSkill._id,
          score: 40,
          totalQuestions: 5,
          correctCount: 2,
          earnedPoints: 40,
          maxPoints: 100,
        },
      ],
    });

    // 4. Verify GET /api/v1/intelligence/ai/personalized-summary
    const summaryReq: any = { user: { userId: studentUser._id.toString() } };
    const summaryRes = createMockRes();
    const nextSummary = (err?: any) => { if (err) throw err; };

    await getPersonalizedSummaryHandler(summaryReq, summaryRes, nextSummary);

    expect(summaryRes.statusCode).toBe(200);
    expect(summaryRes.body.success).toBe(true);
    expect(summaryRes.body.data.personalizedSummary).toBeDefined();

    const { personalizedSummary, context } = summaryRes.body.data;
    expect(personalizedSummary.headline).toBeDefined();
    expect(personalizedSummary.summaryText).toBeDefined();
    expect(personalizedSummary.nextBestAction).toBeDefined();
    expect(Array.isArray(personalizedSummary.topFocusSkills)).toBe(true);

    // Verify Context values
    expect(context.targetCareer).toBe('Full Stack Developer');
    expect(context.careerSlug).toBe('full-stack-developer');
    expect(context.skillGaps.length).toBe(2);

    // Verify JavaScript gap: 85 target - 60 current = 25 gap
    const jsGap = context.skillGaps.find((g: any) => g.skillSlug === 'javascript');
    expect(jsGap).toBeDefined();
    expect(jsGap.currentLevel).toBe(60);
    expect(jsGap.targetLevel).toBe(85);
    expect(jsGap.gap).toBe(25);

    // Verify React gap: 80 target - 40 current = 40 gap
    const reactGap = context.skillGaps.find((g: any) => g.skillSlug === 'react');
    expect(reactGap).toBeDefined();
    expect(reactGap.currentLevel).toBe(40);
    expect(reactGap.targetLevel).toBe(80);
    expect(reactGap.gap).toBe(40);

    // 5. Verify GET /api/v1/intelligence/ai/explain-skill/:skillSlug
    const explainReq: any = {
      params: { skillSlug: 'javascript' },
      user: { userId: studentUser._id.toString() },
    };
    const explainRes = createMockRes();
    const nextExplain = (err?: any) => { if (err) throw err; };

    await getSkillExplanationHandler(explainReq, explainRes, nextExplain);

    expect(explainRes.statusCode).toBe(200);
    expect(explainRes.body.success).toBe(true);
    expect(explainRes.body.data.explanation).toBeDefined();

    const { explanation } = explainRes.body.data;
    expect(explanation.skillName).toBe('JavaScript');
    expect(explanation.currentLevel).toBe(60);
    expect(explanation.targetLevel).toBe(85);
    expect(explanation.gap).toBe(25);
    expect(explanation.recommendedActionPlan.length).toBeGreaterThan(0);
    expect(explanation.keyTopicsToMaster.length).toBeGreaterThan(0);

    // 6. Verify POST /api/v1/intelligence/ai/mentor-ask
    const mentorReq: any = {
      body: { query: 'How do I bridge my gap in React components?' },
      user: { userId: studentUser._id.toString() },
    };
    const mentorRes = createMockRes();
    const nextMentor = (err?: any) => { if (err) throw err; };

    await askAIMentorHandler(mentorReq, mentorRes, nextMentor);

    expect(mentorRes.statusCode).toBe(200);
    expect(mentorRes.body.success).toBe(true);
    expect(mentorRes.body.data.mentorResponse).toBeDefined();
    expect(mentorRes.body.data.mentorResponse.answer).toBeDefined();
    expect(mentorRes.body.data.mentorResponse.suggestedFollowUpQuestions.length).toBeGreaterThan(0);

    // 7. Verify GET /api/v1/intelligence/skill-gap-priority
    const priorityReq: any = { user: { userId: studentUser._id.toString() } };
    const priorityRes = createMockRes();
    const nextPriority = (err?: any) => { if (err) throw err; };

    await getSkillGapPriorityHandler(priorityReq, priorityRes, nextPriority);

    expect(priorityRes.statusCode).toBe(200);
    expect(priorityRes.body.success).toBe(true);
    expect(priorityRes.body.data.snapshots.length).toBe(2);

    // 8. Multi-Tenant Isolation: Another student cannot access student A's AI context
    const studentB = await User.create({
      email: 'studentB@skillpath.dev',
      passwordHash: 'hashB456',
      role: UserRole.STUDENT,
    });
    // Student B has not onboarded yet
    const studentBReq: any = { user: { userId: studentB._id.toString() } };
    const studentBRes = createMockRes();
    let caughtError: any = null;
    await getPersonalizedSummaryHandler(studentBReq, studentBRes, (err: any) => {
      caughtError = err;
    });

    expect(studentBRes.statusCode).toBe(404);
    expect(studentBRes.body.success).toBe(false);

    // 9. Security Check: Verify sensitive secrets never leak into AI responses
    const serialized = JSON.stringify({
      summary: summaryRes.body,
      explanation: explainRes.body,
      mentor: mentorRes.body,
    });

    expect(serialized).not.toContain('hashedSecretPass123');
    expect(serialized).not.toContain('passwordHash');
    expect(serialized).not.toContain('GEMINI_API_KEY');
    expect(serialized).not.toContain('JWT_SECRET');
  });
});
