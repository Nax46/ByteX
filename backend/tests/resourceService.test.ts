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
import { ResourceModel } from '../src/models/Resource.js';
import { ResourceCreateZodSchema } from '../src/schemas/intelligenceValidation.js';
import {
  getAllResources,
  getResourceById,
  getResourcesForSkill,
  getRecommendedResourcesForStudent,
} from '../src/services/resourceRecommendationService.js';
import {
  getResourcesHandler,
  getResourceByIdHandler,
  getRecommendedResourcesHandler,
} from '../src/controllers/resource.controller.js';
import { seedFoundationData } from '../src/seed/foundationSeed.js';
import { seedResourceData } from '../src/seed/resourceSeed.js';

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
  await ResourceModel.deleteMany({});
  await ResourceModel.syncIndexes();
  vi.restoreAllMocks();
});

describe('P13 — Resources Domain, Service & Controller Tests', () => {
  it('Test 1 — Resource Model validation & Zod parsing', async () => {
    const skill = await SkillModel.create({ name: 'React', slug: 'react', category: 'FRAMEWORK' });

    const validResource = {
      title: 'React 19 Hooks Masterclass',
      slug: 'react-19-hooks-masterclass',
      description: 'Comprehensive guide to custom React hooks',
      url: 'https://react.dev/learn',
      type: 'COURSE' as const,
      provider: 'Official Docs',
      skillId: skill._id.toString(),
      skillTag: 'react',
      difficulty: 'INTERMEDIATE' as const,
      estimatedDuration: '2 hours',
      rating: 4.8,
      authorOrInstructor: 'Dan Abramov',
      isPaid: false,
      tags: ['react', 'hooks'],
    };

    const parsed = ResourceCreateZodSchema.parse(validResource);
    expect(parsed.title).toBe('React 19 Hooks Masterclass');

    const created = await ResourceModel.create({
      ...validResource,
      skillId: skill._id,
    });

    expect(created._id).toBeDefined();
    expect(created.slug).toBe('react-19-hooks-masterclass');
    expect(created.rating).toBe(4.8);
  });

  it('Test 2 — Rejects duplicate resource slug with unique index error', async () => {
    const skill = await SkillModel.create({ name: 'React', slug: 'react', category: 'FRAMEWORK' });

    await ResourceModel.create({
      title: 'Resource One',
      slug: 'duplicate-resource-slug',
      description: 'First resource',
      url: 'https://example.com/1',
      type: 'ARTICLE',
      provider: 'Provider 1',
      skillId: skill._id,
      difficulty: 'BEGINNER',
      estimatedDuration: '1 hour',
    });

    await expect(
      ResourceModel.create({
        title: 'Resource Two',
        slug: 'duplicate-resource-slug',
        description: 'Second resource',
        url: 'https://example.com/2',
        type: 'ARTICLE',
        provider: 'Provider 2',
        skillId: skill._id,
        difficulty: 'BEGINNER',
        estimatedDuration: '1 hour',
      })
    ).rejects.toThrow();
  });

  it('Test 3 — Resource Catalog retrieval and filtering', async () => {
    const skill1 = await SkillModel.create({ name: 'React', slug: 'react', category: 'FRAMEWORK' });
    const skill2 = await SkillModel.create({ name: 'Node.js', slug: 'node-js', category: 'TECHNICAL' });

    await ResourceModel.create([
      {
        title: 'React Basics',
        slug: 'react-basics',
        description: 'React intro',
        url: 'https://example.com/react',
        type: 'COURSE',
        provider: 'Provider R',
        skillId: skill1._id,
        skillTag: 'react',
        difficulty: 'BEGINNER',
        estimatedDuration: '1 hour',
        rating: 4.5,
      },
      {
        title: 'Node Async',
        slug: 'node-async',
        description: 'Node async intro',
        url: 'https://example.com/node',
        type: 'ARTICLE',
        provider: 'Provider N',
        skillId: skill2._id,
        skillTag: 'node-js',
        difficulty: 'INTERMEDIATE',
        estimatedDuration: '2 hours',
        rating: 4.9,
      },
    ]);

    const all = await getAllResources();
    expect(all.length).toBe(2);

    const reactOnly = await getAllResources({ skillId: skill1._id.toString() });
    expect(reactOnly.length).toBe(1);
    expect(reactOnly[0].title).toBe('React Basics');

    const byDifficulty = await getAllResources({ difficulty: 'INTERMEDIATE' });
    expect(byDifficulty.length).toBe(1);
    expect(byDifficulty[0].title).toBe('Node Async');
  });

  it('Test 4 — Resource Recommendation Engine ranks gap skills deterministically', async () => {
    const user = await User.create({ email: 'student-res@example.com', passwordHash: 'hash123' });
    const profile = await StudentProfile.create({
      userId: user._id,
      fullName: 'Bob Student',
      targetCareer: 'Full Stack Developer',
    });

    const jsSkill = await SkillModel.create({ name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' });
    const reactSkill = await SkillModel.create({ name: 'React', slug: 'react', category: 'FRAMEWORK' });
    const career = await CareerModel.create({ title: 'Full Stack Developer', slug: 'full-stack-developer' });

    await CareerSkillModel.create({
      careerId: career._id,
      skillId: jsSkill._id,
      requiredLevel: 90,
      importance: 'CRITICAL',
      weight: 1.0,
    });
    await CareerSkillModel.create({
      careerId: career._id,
      skillId: reactSkill._id,
      requiredLevel: 80,
      importance: 'HIGH',
      weight: 1.0,
    });

    const assessment = await AssessmentModel.create({
      title: 'Full Stack Test',
      slug: 'full-stack-test',
      type: 'DIAGNOSTIC',
    });

    // Student scored low on JS (large gap = 90 - 30 = 60), high on React (small gap = 80 - 70 = 10)
    await AssessmentAttemptModel.create({
      userId: user._id,
      studentProfileId: profile._id,
      assessmentId: assessment._id,
      status: 'COMPLETED',
      completedAt: new Date(),
      skillScores: [
        { skillId: jsSkill._id, score: 30, totalQuestions: 10, correctCount: 3, earnedPoints: 30, maxPoints: 100 },
        { skillId: reactSkill._id, score: 70, totalQuestions: 10, correctCount: 7, earnedPoints: 70, maxPoints: 100 },
      ],
    });

    await ResourceModel.create({
      title: 'JavaScript Masterclass',
      slug: 'js-masterclass',
      description: 'Master JS fundamentals',
      url: 'https://example.com/js',
      type: 'COURSE',
      provider: 'JS Academy',
      skillId: jsSkill._id,
      skillTag: 'javascript',
      difficulty: 'BEGINNER',
      estimatedDuration: '3 hours',
      rating: 4.9,
    });

    await ResourceModel.create({
      title: 'React Patterns',
      slug: 'react-patterns',
      description: 'Master React patterns',
      url: 'https://example.com/react',
      type: 'ARTICLE',
      provider: 'React Hub',
      skillId: reactSkill._id,
      skillTag: 'react',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '1 hour',
      rating: 4.5,
    });

    const recs = await getRecommendedResourcesForStudent(user._id.toString());
    expect(recs.length).toBeGreaterThan(0);

    // JS resource should be ranked higher due to higher priority score & gap magnitude
    expect(recs[0].resource.title).toBe('JavaScript Masterclass');
    expect(recs[0].targetSkillGap).toBe(60);
    expect(recs[0].recommendationReason).toContain('CRITICAL priority skill gap in JavaScript');
  });

  it('Test 5 — Idempotent Resource Seed script execution', async () => {
    await seedFoundationData();
    const result1 = await seedResourceData();
    expect(result1.resourcesProcessed).toBeGreaterThan(15);

    const countAfterFirst = await ResourceModel.countDocuments();

    // Re-run seed
    const result2 = await seedResourceData();
    expect(result2.resourcesProcessed).toBe(result1.resourcesProcessed);

    const countAfterSecond = await ResourceModel.countDocuments();
    expect(countAfterSecond).toBe(countAfterFirst);
  });

  it('Test 6 — Resource Controller getRecommendedResourcesHandler integration', async () => {
    const user = await User.create({ email: 'http-student@example.com', passwordHash: 'hash123' });
    await StudentProfile.create({
      userId: user._id,
      fullName: 'HTTP Student',
      targetCareer: 'Full Stack Developer',
    });

    await seedFoundationData();
    await seedResourceData();

    const req: any = { user: { userId: user._id.toString() } };
    const res = createMockRes();
    const next = vi.fn();

    await getRecommendedResourcesHandler(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
    expect(res.body.data.recommendations.length).toBeGreaterThan(0);
  });

  it('Test 7 — Resource Controller getResourceByIdHandler 404 for missing resource', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const req: any = { params: { id: fakeId }, user: { userId: new mongoose.Types.ObjectId().toString() } };
    const res = createMockRes();
    const next = vi.fn();

    await getResourceByIdHandler(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
