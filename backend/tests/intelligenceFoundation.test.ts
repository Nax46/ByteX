import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SkillModel } from '../src/models/Skill.js';
import { CareerModel } from '../src/models/Career.js';
import { CareerSkillModel } from '../src/models/CareerSkill.js';
import { SkillCreateZodSchema, CareerCreateZodSchema, CareerSkillCreateZodSchema } from '../src/schemas/intelligenceValidation.js';
import { seedFoundationData } from '../src/seed/foundationSeed.js';

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
  await CareerSkillModel.deleteMany({});
});

describe('Skill Domain Model & Validation', () => {
  it('should create a valid Skill document', async () => {
    const validSkill = {
      name: 'JavaScript',
      slug: 'javascript',
      category: 'TECHNICAL' as const,
      description: 'Programming language',
      maxLevel: 100,
    };

    // Zod Validation
    const zodParsed = SkillCreateZodSchema.parse(validSkill);
    expect(zodParsed.name).toBe('JavaScript');

    // Mongoose Save
    const doc = await SkillModel.create(validSkill);
    expect(doc._id).toBeDefined();
    expect(doc.name).toBe('JavaScript');
    expect(doc.slug).toBe('javascript');
    expect(doc.category).toBe('TECHNICAL');
  });

  it('should reject invalid skill parameters (empty name, invalid category)', async () => {
    const invalidSkill = {
      name: '',
      slug: 'invalid-skill',
      category: 'INVALID_CATEGORY',
    };

    // Zod Validation failure
    expect(() => SkillCreateZodSchema.parse(invalidSkill)).toThrow();

    // Mongoose Validation failure
    await expect(SkillModel.create(invalidSkill as any)).rejects.toThrow();
  });

  it('should enforce uniqueness on skill slug', async () => {
    const skillData = {
      name: 'React',
      slug: 'react',
      category: 'FRAMEWORK' as const,
    };

    await SkillModel.create(skillData);
    await expect(SkillModel.create({ ...skillData, name: 'React Duplicate' })).rejects.toThrow();
  });
});

describe('Career Domain Model & Validation', () => {
  it('should create a valid Career document', async () => {
    const validCareer = {
      title: 'Full Stack Developer',
      slug: 'full-stack-developer',
      description: 'Web development role',
      category: 'Software Engineering',
      isActive: true,
    };

    const zodParsed = CareerCreateZodSchema.parse(validCareer);
    expect(zodParsed.title).toBe('Full Stack Developer');

    const doc = await CareerModel.create(validCareer);
    expect(doc._id).toBeDefined();
    expect(doc.slug).toBe('full-stack-developer');
  });

  it('should reject invalid career title and duplicate slug', async () => {
    const invalidCareer = { title: '', slug: 'bad-career' };
    expect(() => CareerCreateZodSchema.parse(invalidCareer)).toThrow();

    const careerData = { title: 'Backend Developer', slug: 'backend-developer' };
    await CareerModel.create(careerData);
    await expect(CareerModel.create(careerData)).rejects.toThrow();
  });
});

describe('CareerSkill Junction Model & Uniqueness', () => {
  it('should create a valid CareerSkill mapping', async () => {
    const skill = await SkillModel.create({ name: 'Node.js', slug: 'node-js', category: 'TECHNICAL' });
    const career = await CareerModel.create({ title: 'Backend Engineer', slug: 'backend-engineer' });

    const mappingData = {
      careerId: career._id,
      skillId: skill._id,
      requiredLevel: 75,
      importance: 'CRITICAL' as const,
      weight: 1.0,
    };

    const doc = await CareerSkillModel.create(mappingData);
    expect(doc._id).toBeDefined();
    expect(doc.careerId.toString()).toBe(career._id.toString());
    expect(doc.skillId.toString()).toBe(skill._id.toString());
    expect(doc.requiredLevel).toBe(75);
  });

  it('should reject duplicate Career + Skill mapping', async () => {
    const skill = await SkillModel.create({ name: 'Express', slug: 'express', category: 'FRAMEWORK' });
    const career = await CareerModel.create({ title: 'Node Developer', slug: 'node-developer' });

    const mappingData = {
      careerId: career._id,
      skillId: skill._id,
      requiredLevel: 70,
      importance: 'HIGH' as const,
    };

    await CareerSkillModel.create(mappingData);
    await expect(CareerSkillModel.create(mappingData)).rejects.toThrow();
  });

  it('should reject out-of-range requiredLevel', async () => {
    const skill = await SkillModel.create({ name: 'MongoDB', slug: 'mongodb', category: 'TOOL' });
    const career = await CareerModel.create({ title: 'Database Admin', slug: 'database-admin' });

    await expect(
      CareerSkillModel.create({
        careerId: career._id,
        skillId: skill._id,
        requiredLevel: 150, // Invalid: max 100
        importance: 'HIGH',
      })
    ).rejects.toThrow();
  });
});

describe('Foundation Seed Idempotency', () => {
  it('should execute seed idempotently without throwing errors or duplicating data', async () => {
    const firstRun = await seedFoundationData();
    expect(firstRun.skillsProcessed).toBe(9);
    expect(firstRun.careersProcessed).toBe(1);
    expect(firstRun.careerSkillsProcessed).toBe(9);

    const initialSkillCount = await SkillModel.countDocuments();
    const initialCareerCount = await CareerModel.countDocuments();
    const initialCareerSkillCount = await CareerSkillModel.countDocuments();

    expect(initialSkillCount).toBe(9);
    expect(initialCareerCount).toBe(1);
    expect(initialCareerSkillCount).toBe(9);

    // Second run
    const secondRun = await seedFoundationData();
    expect(secondRun.skillsProcessed).toBe(9);

    const postSkillCount = await SkillModel.countDocuments();
    const postCareerCount = await CareerModel.countDocuments();
    const postCareerSkillCount = await CareerSkillModel.countDocuments();

    expect(postSkillCount).toBe(initialSkillCount);
    expect(postCareerCount).toBe(initialCareerCount);
    expect(postCareerSkillCount).toBe(initialCareerSkillCount);
  });
});
