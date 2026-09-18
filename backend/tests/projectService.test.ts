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
import { ProjectModel } from '../src/models/Project.js';
import { ProjectCreateZodSchema } from '../src/schemas/intelligenceValidation.js';
import {
  getAllProjects,
  getProjectById,
  getProjectsForSkill,
  getRecommendedProjectsForStudent,
} from '../src/services/projectRecommendationService.js';
import {
  getProjectsHandler,
  getProjectByIdHandler,
  getRecommendedProjectsHandler,
} from '../src/controllers/project.controller.js';
import { seedFoundationData } from '../src/seed/foundationSeed.js';
import { seedProjectData } from '../src/seed/projectSeed.js';

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
  await ProjectModel.deleteMany({});
  await ProjectModel.syncIndexes();
  vi.restoreAllMocks();
});

describe('P14 — Projects Domain, Service & Controller Tests', () => {
  it('Test 1 — Project Model validation & Zod parsing', async () => {
    const skill = await SkillModel.create({ name: 'Node.js', slug: 'node-js', category: 'TECHNICAL' });

    const validProject = {
      title: 'REST Micro-Service API',
      slug: 'rest-micro-service-api',
      description: 'Build a production Express REST API with Zod validation',
      difficulty: 'INTERMEDIATE' as const,
      skillId: skill._id.toString(),
      skillsReinforced: [skill._id.toString()],
      technologies: ['Node.js', 'Express', 'TypeScript'],
      estimatedHours: 8,
      githubStarterUrl: 'https://github.com/example/starter',
      architectureOverview: '3-tier architecture',
      learningObjectives: ['Build routes', 'Validate inputs'],
    };

    const parsed = ProjectCreateZodSchema.parse(validProject);
    expect(parsed.title).toBe('REST Micro-Service API');

    const created = await ProjectModel.create({
      ...validProject,
      skillId: skill._id,
      skillsReinforced: [skill._id],
    });

    expect(created._id).toBeDefined();
    expect(created.slug).toBe('rest-micro-service-api');
    expect(created.estimatedHours).toBe(8);
  });

  it('Test 2 — Rejects duplicate project slug with unique index error', async () => {
    const skill = await SkillModel.create({ name: 'Node.js', slug: 'node-js', category: 'TECHNICAL' });

    await ProjectModel.create({
      title: 'Project Alpha',
      slug: 'duplicate-project-slug',
      description: 'First project',
      difficulty: 'BEGINNER',
      skillId: skill._id,
      estimatedHours: 5,
    });

    await expect(
      ProjectModel.create({
        title: 'Project Beta',
        slug: 'duplicate-project-slug',
        description: 'Second project',
        difficulty: 'BEGINNER',
        skillId: skill._id,
        estimatedHours: 5,
      })
    ).rejects.toThrow();
  });

  it('Test 3 — Project Catalog retrieval and filtering', async () => {
    const skill1 = await SkillModel.create({ name: 'React', slug: 'react', category: 'FRAMEWORK' });
    const skill2 = await SkillModel.create({ name: 'MongoDB', slug: 'mongodb', category: 'TOOL' });

    await ProjectModel.create([
      {
        title: 'React Kanban Board',
        slug: 'react-kanban-board',
        description: 'Kanban board UI',
        difficulty: 'BEGINNER',
        skillId: skill1._id,
        skillsReinforced: [skill1._id],
        technologies: ['React'],
        estimatedHours: 6,
      },
      {
        title: 'MongoDB Analytics Pipeline',
        slug: 'mongodb-analytics-pipeline',
        description: 'Analytics engine',
        difficulty: 'ADVANCED',
        skillId: skill2._id,
        skillsReinforced: [skill2._id],
        technologies: ['MongoDB', 'Mongoose'],
        estimatedHours: 14,
      },
    ]);

    const all = await getAllProjects();
    expect(all.length).toBe(2);

    const reactProjects = await getProjectsForSkill(skill1._id.toString());
    expect(reactProjects.length).toBe(1);
    expect(reactProjects[0].title).toBe('React Kanban Board');

    const byDifficulty = await getAllProjects({ difficulty: 'ADVANCED' });
    expect(byDifficulty.length).toBe(1);
    expect(byDifficulty[0].title).toBe('MongoDB Analytics Pipeline');
  });

  it('Test 4 — Project Recommendation Engine ranks projects deterministically based on skill gap and multi-gap bonus', async () => {
    const user = await User.create({ email: 'proj-student@example.com', passwordHash: 'hash123' });
    const profile = await StudentProfile.create({
      userId: user._id,
      fullName: 'Alice Developer',
      targetCareer: 'Full Stack Developer',
    });

    const jsSkill = await SkillModel.create({ name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' });
    const expressSkill = await SkillModel.create({ name: 'Express', slug: 'express', category: 'FRAMEWORK' });
    const mongoSkill = await SkillModel.create({ name: 'MongoDB', slug: 'mongodb', category: 'TOOL' });
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
      skillId: expressSkill._id,
      requiredLevel: 80,
      importance: 'HIGH',
      weight: 1.0,
    });
    await CareerSkillModel.create({
      careerId: career._id,
      skillId: mongoSkill._id,
      requiredLevel: 75,
      importance: 'HIGH',
      weight: 1.0,
    });

    const assessment = await AssessmentModel.create({
      title: 'Full Stack Diagnostic',
      slug: 'fs-diagnostic',
      type: 'DIAGNOSTIC',
    });

    // Student has gaps in JS (gap: 60), Express (gap: 40), MongoDB (gap: 35)
    await AssessmentAttemptModel.create({
      userId: user._id,
      studentProfileId: profile._id,
      assessmentId: assessment._id,
      status: 'COMPLETED',
      completedAt: new Date(),
      skillScores: [
        { skillId: jsSkill._id, score: 30, totalQuestions: 10, correctCount: 3, earnedPoints: 30, maxPoints: 100 },
        { skillId: expressSkill._id, score: 40, totalQuestions: 10, correctCount: 4, earnedPoints: 40, maxPoints: 100 },
        { skillId: mongoSkill._id, score: 40, totalQuestions: 10, correctCount: 4, earnedPoints: 40, maxPoints: 100 },
      ],
    });

    // Project 1 addresses JS only
    await ProjectModel.create({
      title: 'JS Utility Library',
      slug: 'js-utility-library',
      description: 'JS utils',
      difficulty: 'BEGINNER',
      skillId: jsSkill._id,
      skillsReinforced: [jsSkill._id],
      technologies: ['JavaScript'],
      estimatedHours: 4,
    });

    // Project 2 addresses Express + JS + MongoDB (multi-gap coverage bonus!)
    await ProjectModel.create({
      title: 'Full Stack API Server',
      slug: 'full-stack-api-server',
      description: 'Multi-skill project',
      difficulty: 'ADVANCED',
      skillId: jsSkill._id,
      skillsReinforced: [jsSkill._id, expressSkill._id, mongoSkill._id],
      technologies: ['JavaScript', 'Express', 'MongoDB'],
      estimatedHours: 16,
    });

    const recs = await getRecommendedProjectsForStudent(user._id.toString());
    expect(recs.length).toBe(2);

    // Full Stack API Server should be top ranked due to multi-gap reinforcement bonus
    expect(recs[0].project.title).toBe('Full Stack API Server');
    expect(recs[0].reinforcedSkillNames.length).toBe(3);
  });

  it('Test 5 — Idempotent Project Seed script execution', async () => {
    await seedFoundationData();
    const result1 = await seedProjectData();
    expect(result1.projectsProcessed).toBeGreaterThan(10);

    const countAfterFirst = await ProjectModel.countDocuments();

    // Re-run seed
    const result2 = await seedProjectData();
    expect(result2.projectsProcessed).toBe(result1.projectsProcessed);

    const countAfterSecond = await ProjectModel.countDocuments();
    expect(countAfterSecond).toBe(countAfterFirst);
  });

  it('Test 6 — Project Controller getRecommendedProjectsHandler integration', async () => {
    const user = await User.create({ email: 'http-proj-student@example.com', passwordHash: 'hash123' });
    await StudentProfile.create({
      userId: user._id,
      fullName: 'HTTP Proj Student',
      targetCareer: 'Full Stack Developer',
    });

    await seedFoundationData();
    await seedProjectData();

    const req: any = { user: { userId: user._id.toString() } };
    const res = createMockRes();
    const next = vi.fn();

    await getRecommendedProjectsHandler(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
    expect(res.body.data.recommendations.length).toBeGreaterThan(0);
  });

  it('Test 7 — Project Controller getProjectByIdHandler 404 for missing project', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const req: any = { params: { id: fakeId }, user: { userId: new mongoose.Types.ObjectId().toString() } };
    const res = createMockRes();
    const next = vi.fn();

    await getProjectByIdHandler(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
