import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { StudentProfile } from '../src/models/StudentProfile.js';
import { SkillModel } from '../src/models/Skill.js';
import { CareerModel } from '../src/models/Career.js';
import { CareerSkillModel } from '../src/models/CareerSkill.js';
import { AssessmentModel } from '../src/models/Assessment.js';
import { AssessmentAttemptModel } from '../src/models/AssessmentAttempt.js';
import { RoadmapModel } from '../src/models/Roadmap.js';
import { buildStudentAIContext } from '../src/services/ai/personalizationContextBuilder.js';
import {
  getPersonalizedSummaryHandler,
  getSkillExplanationHandler,
  askAIMentorHandler,
} from '../src/controllers/aiPersonalization.controller.js';
import { getStudentSkillGapPriority } from '../src/services/skillGapPriorityReadoutService.js';

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
  vi.restoreAllMocks();
});

describe('P16 — AI Personalization Domain, Context Builder & Controller Tests', () => {
  it('Test 1 — buildStudentAIContext derives real context from MongoDB student data', async () => {
    const user = await User.create({ email: 'ai.student@example.com', passwordHash: 'secretHash123' });
    const profile = await StudentProfile.create({
      userId: user._id,
      fullName: 'Carol AI Student',
      targetCareer: 'Full Stack Developer',
    });

    const jsSkill = await SkillModel.create({ name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' });
    const career = await CareerModel.create({ title: 'Full Stack Developer', slug: 'full-stack-developer' });

    await CareerSkillModel.create({
      careerId: career._id,
      skillId: jsSkill._id,
      requiredLevel: 85,
      importance: 'CRITICAL',
      weight: 1.0,
    });

    const assessment = await AssessmentModel.create({
      title: 'Full Stack Test',
      slug: 'full-stack-test',
      type: 'DIAGNOSTIC',
    });

    await AssessmentAttemptModel.create({
      userId: user._id,
      studentProfileId: profile._id,
      assessmentId: assessment._id,
      status: 'COMPLETED',
      completedAt: new Date(),
      skillScores: [
        { skillId: jsSkill._id, score: 40, totalQuestions: 10, correctCount: 4, earnedPoints: 40, maxPoints: 100 },
      ],
    });

    const context = await buildStudentAIContext(user._id.toString());

    expect(context).toBeDefined();
    expect(context.studentName).toBe('Carol AI Student');
    expect(context.targetCareer).toBe('Full Stack Developer');
    expect(context.topPrioritySkill).toBe('JavaScript');
    expect(context.topPriorityGap).toBe(45);

    // Security check: Verify no private credentials in context
    const jsonStr = JSON.stringify(context);
    expect(jsonStr).not.toContain('secretHash123');
    expect(jsonStr).not.toContain('password');
  });

  it('Test 2 — Controller getPersonalizedSummaryHandler returns structured AI summary', async () => {
    const user = await User.create({ email: 'summary.student@example.com', passwordHash: 'hash123' });
    await StudentProfile.create({
      userId: user._id,
      fullName: 'Summary Student',
      targetCareer: 'Full Stack Developer',
    });

    const req: any = { user: { userId: user._id.toString() } };
    const res = createMockRes();
    const next = vi.fn();

    await getPersonalizedSummaryHandler(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.personalizedSummary).toBeDefined();
    expect(res.body.data.personalizedSummary.headline).toBeDefined();
  });

  it('Test 3 — Controller getSkillExplanationHandler returns structured skill breakdown', async () => {
    const user = await User.create({ email: 'explain.student@example.com', passwordHash: 'hash123' });
    await StudentProfile.create({
      userId: user._id,
      fullName: 'Explain Student',
      targetCareer: 'Full Stack Developer',
    });

    const req: any = { params: { skillSlug: 'javascript' }, user: { userId: user._id.toString() } };
    const res = createMockRes();
    const next = vi.fn();

    await getSkillExplanationHandler(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.explanation).toBeDefined();
    expect(res.body.data.explanation.skillName).toBe('javascript');
  });

  it('Test 4 — Controller askAIMentorHandler responds to mentor query', async () => {
    const user = await User.create({ email: 'mentor.student@example.com', passwordHash: 'hash123' });
    await StudentProfile.create({
      userId: user._id,
      fullName: 'Mentor Student',
      targetCareer: 'Full Stack Developer',
    });

    const req: any = {
      body: { query: 'What is the best way to learn REST API design?' },
      user: { userId: user._id.toString() },
    };
    const res = createMockRes();
    const next = vi.fn();

    await askAIMentorHandler(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mentorResponse).toBeDefined();
    expect(res.body.data.mentorResponse.query).toContain('REST API design');
  });

  it('Test 5 — Controller rejects empty mentor query with 400 Bad Request', async () => {
    const user = await User.create({ email: 'badquery.student@example.com', passwordHash: 'hash123' });

    const req: any = {
      body: { query: '' },
      user: { userId: user._id.toString() },
    };
    const res = createMockRes();
    const next = vi.fn();

    await askAIMentorHandler(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('Test 6 — Deterministic Rulebook Verification: Skill Gap readout remains 100% deterministic even with AI configured', async () => {
    const user = await User.create({ email: 'determ.student@example.com', passwordHash: 'hash123' });
    const profile = await StudentProfile.create({
      userId: user._id,
      fullName: 'Determ Student',
      targetCareer: 'Full Stack Developer',
    });

    const jsSkill = await SkillModel.create({ name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' });
    const career = await CareerModel.create({ title: 'Full Stack Developer', slug: 'full-stack-developer' });

    await CareerSkillModel.create({
      careerId: career._id,
      skillId: jsSkill._id,
      requiredLevel: 90,
      importance: 'CRITICAL',
      weight: 1.0,
    });

    const assessment = await AssessmentModel.create({
      title: 'Full Stack Test',
      slug: 'full-stack-test',
      type: 'DIAGNOSTIC',
    });

    await AssessmentAttemptModel.create({
      userId: user._id,
      studentProfileId: profile._id,
      assessmentId: assessment._id,
      status: 'COMPLETED',
      completedAt: new Date(),
      skillScores: [
        { skillId: jsSkill._id, score: 50, totalQuestions: 10, correctCount: 5, earnedPoints: 50, maxPoints: 100 },
      ],
    });

    // Invoke deterministic readout service directly
    const snapshots = await getStudentSkillGapPriority(user._id.toString());

    expect(snapshots.length).toBe(1);
    expect(snapshots[0].currentLevel).toBe(50);
    expect(snapshots[0].targetLevel).toBe(90);
    expect(snapshots[0].gap).toBe(40); // Exactly 90 - 50 = 40 (Deterministic)
  });
});
