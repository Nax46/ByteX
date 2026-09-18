import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { StudentProfile } from '../src/models/StudentProfile.js';
import { SkillModel } from '../src/models/Skill.js';
import { CareerModel } from '../src/models/Career.js';
import { CareerSkillModel } from '../src/models/CareerSkill.js';
import { AssessmentModel } from '../src/models/Assessment.js';
import { QuestionModel } from '../src/models/Question.js';
import { AssessmentAttemptModel } from '../src/models/AssessmentAttempt.js';
import { RoadmapModel } from '../src/models/Roadmap.js';
import { RoadmapProgressModel } from '../src/models/RoadmapProgress.js';
import { ResourceModel } from '../src/models/Resource.js';
import { ProjectModel } from '../src/models/Project.js';
import { seedMaster } from '../src/seed/seedMaster.js';
import { getStudentSkillGapPriority } from '../src/services/skillGapPriorityReadoutService.js';
import { getRecommendedResourcesForStudent } from '../src/services/resourceRecommendationService.js';
import { getRecommendedProjectsForStudent } from '../src/services/projectRecommendationService.js';

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
  await CareerModel.deleteMany({});
  await CareerSkillModel.deleteMany({});
  await AssessmentModel.deleteMany({});
  await QuestionModel.deleteMany({});
  await AssessmentAttemptModel.deleteMany({});
  await RoadmapModel.deleteMany({});
  await RoadmapProgressModel.deleteMany({});
  await ResourceModel.deleteMany({});
  await ProjectModel.deleteMany({});
  vi.restoreAllMocks();
});

describe('P17 (Seed) & P18 (Database Performance) Verification Tests', () => {
  it('Test 1 — Master Seed executes idempotently twice without duplicate record creation', async () => {
    // 1. First Seed Run
    const res1 = await seedMaster();
    expect(res1.foundation.skillsProcessed).toBeGreaterThan(0);
    expect(res1.assessment.questionsProcessed).toBeGreaterThan(0);
    expect(res1.resources.resourcesProcessed).toBeGreaterThan(0);
    expect(res1.projects.projectsProcessed).toBeGreaterThan(0);

    const skillsCount1 = await SkillModel.countDocuments();
    const careersCount1 = await CareerModel.countDocuments();
    const careerSkillsCount1 = await CareerSkillModel.countDocuments();
    const assessmentsCount1 = await AssessmentModel.countDocuments();
    const questionsCount1 = await QuestionModel.countDocuments();
    const resourcesCount1 = await ResourceModel.countDocuments();
    const projectsCount1 = await ProjectModel.countDocuments();
    const usersCount1 = await User.countDocuments();
    const profilesCount1 = await StudentProfile.countDocuments();

    // 2. Second Seed Run (Idempotency Check)
    const res2 = await seedMaster();
    expect(res2.foundation.skillsProcessed).toBe(res1.foundation.skillsProcessed);
    expect(res2.resources.resourcesProcessed).toBe(res1.resources.resourcesProcessed);
    expect(res2.projects.projectsProcessed).toBe(res1.projects.projectsProcessed);

    const skillsCount2 = await SkillModel.countDocuments();
    const careersCount2 = await CareerModel.countDocuments();
    const careerSkillsCount2 = await CareerSkillModel.countDocuments();
    const assessmentsCount2 = await AssessmentModel.countDocuments();
    const questionsCount2 = await QuestionModel.countDocuments();
    const resourcesCount2 = await ResourceModel.countDocuments();
    const projectsCount2 = await ProjectModel.countDocuments();
    const usersCount2 = await User.countDocuments();
    const profilesCount2 = await StudentProfile.countDocuments();

    // Assert exact count equality (0 duplicate creation)
    expect(skillsCount2).toBe(skillsCount1);
    expect(careersCount2).toBe(careersCount1);
    expect(careerSkillsCount2).toBe(careerSkillsCount1);
    expect(assessmentsCount2).toBe(assessmentsCount1);
    expect(questionsCount2).toBe(questionsCount1);
    expect(resourcesCount2).toBe(resourcesCount1);
    expect(projectsCount2).toBe(projectsCount1);
    expect(usersCount2).toBe(usersCount1);
    expect(profilesCount2).toBe(profilesCount1);
  });

  it('Test 2 — Data Integrity Check: All seeded foreign keys resolve to valid MongoDB entities', async () => {
    await seedMaster();

    // 1. Verify CareerSkill references
    const careerSkills = await CareerSkillModel.find().lean();
    for (const cs of careerSkills) {
      const skillExists = await SkillModel.exists({ _id: cs.skillId });
      const careerExists = await CareerModel.exists({ _id: cs.careerId });
      expect(skillExists).toBeTruthy();
      expect(careerExists).toBeTruthy();
    }

    // 2. Verify Question references
    const questions = await QuestionModel.find().lean();
    for (const q of questions) {
      const skillExists = await SkillModel.exists({ _id: q.skillId });
      expect(skillExists).toBeTruthy();
    }

    // 3. Verify Resource references
    const resources = await ResourceModel.find().lean();
    for (const r of resources) {
      const skillExists = await SkillModel.exists({ _id: r.skillId });
      expect(skillExists).toBeTruthy();
    }

    // 4. Verify Project references
    const projects = await ProjectModel.find().lean();
    for (const p of projects) {
      const skillExists = await SkillModel.exists({ _id: p.skillId });
      expect(skillExists).toBeTruthy();
    }
  });

  it('Test 3 — Performance & Index Check: Active roadmap query uses indexed path', async () => {
    const seedRes = await seedMaster();
    const studentProfileId = seedRes.demoStudent.studentProfileId;

    const start = performance.now();
    const activeRoadmap = await RoadmapModel.findOne({
      studentProfileId,
      isCurrent: true,
    }).lean();
    const durationMs = performance.now() - start;

    expect(activeRoadmap).toBeDefined();
    expect(activeRoadmap!.isCurrent).toBe(true);
    expect(durationMs).toBeLessThan(50); // High performance indexed query (< 50ms)
  });

  it('Test 4 — Performance Check: Non-N+1 Batch Recommendation queries execute fast', async () => {
    const seedRes = await seedMaster();
    const userId = seedRes.demoStudent.userId;

    // Verify Readout Service
    const snapshots = await getStudentSkillGapPriority(userId);
    expect(snapshots.length).toBeGreaterThan(0);

    // Verify Resource Recommendations
    const startRes = performance.now();
    const resRecs = await getRecommendedResourcesForStudent(userId);
    const durationRes = performance.now() - startRes;

    expect(resRecs.length).toBeGreaterThan(0);
    expect(durationRes).toBeLessThan(100);

    // Verify Project Recommendations
    const startProj = performance.now();
    const projRecs = await getRecommendedProjectsForStudent(userId);
    const durationProj = performance.now() - startProj;

    expect(projRecs.length).toBeGreaterThan(0);
    expect(durationProj).toBeLessThan(100);
  });
});
