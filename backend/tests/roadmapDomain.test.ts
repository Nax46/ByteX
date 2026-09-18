import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { RoadmapModel } from '../src/models/Roadmap.js';
import { SkillModel } from '../src/models/Skill.js';
import { CareerModel } from '../src/models/Career.js';
import { StudentProfile } from '../src/models/StudentProfile.js';
import { User } from '../src/models/User.js';
import {
  RoadmapCreateZodSchema,
  RoadmapModuleZodSchema,
} from '../src/schemas/intelligenceValidation.js';

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
  await RoadmapModel.deleteMany({});
  await SkillModel.deleteMany({});
  await CareerModel.deleteMany({});
  await StudentProfile.deleteMany({});
  await User.deleteMany({});
});

describe('Roadmap Domain Model & Database Architecture', () => {
  it('should create a valid Roadmap document with embedded modules', async () => {
    const user = await User.create({ email: 'roadmap1@example.com', passwordHash: 'hash123' });
    const profile = await StudentProfile.create({
      userId: user._id,
      fullName: 'Roadmap Student',
      targetCareer: 'Full Stack Developer',
    });
    const career = await CareerModel.create({ title: 'Full Stack Developer', slug: 'full-stack-developer' });
    const jsSkill = await SkillModel.create({ name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' });

    const roadmap = await RoadmapModel.create({
      userId: user._id,
      studentProfileId: profile._id,
      careerId: career._id,
      title: 'Full Stack Developer Learning Roadmap',
      version: 1,
      isCurrent: true,
      status: 'ACTIVE',
      modules: [
        {
          moduleId: 'mod-javascript-1',
          skillId: jsSkill._id,
          title: 'JavaScript Fundamentals',
          order: 1,
          targetLevel: 85,
          currentLevel: 50,
          gapMagnitude: 35,
          priorityScore: 82.5,
          prerequisites: [],
          status: 'IN_PROGRESS',
        },
      ],
    });

    expect(roadmap._id).toBeDefined();
    expect(roadmap.version).toBe(1);
    expect(roadmap.isCurrent).toBe(true);
    expect(roadmap.status).toBe('ACTIVE');
    expect(roadmap.modules.length).toBe(1);
    expect(roadmap.modules[0].moduleId).toBe('mod-javascript-1');
    expect(roadmap.modules[0].status).toBe('IN_PROGRESS');
  });

  it('should support compound query indexing for current active roadmap', async () => {
    const profileId = new Types.ObjectId();
    const careerId = new Types.ObjectId();
    const jsSkillId = new Types.ObjectId();

    await RoadmapModel.create({
      studentProfileId: profileId,
      careerId,
      version: 1,
      isCurrent: true,
      status: 'ACTIVE',
      modules: [
        {
          moduleId: 'mod-js',
          skillId: jsSkillId,
          title: 'JS Module',
          order: 1,
          targetLevel: 80,
          gapMagnitude: 40,
          priorityScore: 70,
          status: 'LOCKED',
        },
      ],
    });

    const activeRoadmap = await RoadmapModel.findOne({
      studentProfileId: profileId,
      isCurrent: true,
    });

    expect(activeRoadmap).toBeDefined();
    expect(activeRoadmap?.isCurrent).toBe(true);
  });

  it('should preserve historical roadmap versions (V1, V2) without deletion', async () => {
    const profileId = new Types.ObjectId();
    const careerId = new Types.ObjectId();
    const jsSkillId = new Types.ObjectId();

    // V1 Roadmap (Archived)
    const v1 = await RoadmapModel.create({
      studentProfileId: profileId,
      careerId,
      version: 1,
      isCurrent: false,
      status: 'ARCHIVED',
      modules: [
        {
          moduleId: 'mod-v1',
          skillId: jsSkillId,
          title: 'V1 JS Module',
          order: 1,
          targetLevel: 80,
          gapMagnitude: 50,
          priorityScore: 90,
          status: 'COMPLETED',
        },
      ],
    });

    // V2 Roadmap (Current Active)
    const v2 = await RoadmapModel.create({
      studentProfileId: profileId,
      careerId,
      version: 2,
      isCurrent: true,
      status: 'ACTIVE',
      modules: [
        {
          moduleId: 'mod-v2',
          skillId: jsSkillId,
          title: 'V2 JS Advanced',
          order: 1,
          targetLevel: 80,
          gapMagnitude: 20,
          priorityScore: 40,
          status: 'IN_PROGRESS',
        },
      ],
    });

    const allRoadmaps = await RoadmapModel.find({ studentProfileId: profileId }).sort({ version: -1 });
    expect(allRoadmaps.length).toBe(2);
    expect(allRoadmaps[0].version).toBe(2);
    expect(allRoadmaps[0].isCurrent).toBe(true);
    expect(allRoadmaps[1].version).toBe(1);
    expect(allRoadmaps[1].isCurrent).toBe(false);
  });

  it('should validate RoadmapModuleZodSchema and RoadmapCreateZodSchema', () => {
    const validModule = {
      moduleId: 'mod-1',
      skillId: new Types.ObjectId().toString(),
      title: 'Module Title',
      order: 1,
      targetLevel: 80,
      currentLevel: 40,
      gapMagnitude: 40,
      priorityScore: 75,
      status: 'LOCKED',
    };

    const modResult = RoadmapModuleZodSchema.safeParse(validModule);
    expect(modResult.success).toBe(true);

    const validRoadmap = {
      careerId: new Types.ObjectId().toString(),
      title: 'Roadmap Title',
      version: 1,
      isCurrent: true,
      status: 'ACTIVE',
      modules: [validModule],
    };

    const roadmapResult = RoadmapCreateZodSchema.safeParse(validRoadmap);
    expect(roadmapResult.success).toBe(true);

    const invalidRoadmap = {
      careerId: 'invalid-id',
      version: 0, // Must be >= 1
    };

    const invalidResult = RoadmapCreateZodSchema.safeParse(invalidRoadmap);
    expect(invalidResult.success).toBe(false);
  });
});
