import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SkillModel } from '../src/models/Skill.js';
import { CareerModel } from '../src/models/Career.js';
import { CareerSkillModel } from '../src/models/CareerSkill.js';
import { AssessmentModel } from '../src/models/Assessment.js';
import { QuestionModel } from '../src/models/Question.js';
import { ResourceModel } from '../src/models/Resource.js';
import { ProjectModel } from '../src/models/Project.js';
import { User, UserRole } from '../src/models/User.js';
import { StudentProfile } from '../src/models/StudentProfile.js';
import { seedMaster } from '../src/seed/seedMaster.js';
import {
  getCareersListService,
  getCareerDetailsService,
  getCareerSkillsService,
  getStudentCareerReadinessService,
} from '../src/services/career.service.js';

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
  await seedMaster();
});

describe('Database-Driven Career Intelligence Test Suite', () => {
  it('1. Career Catalog Retrieval: Should return all 7 core careers from MongoDB', async () => {
    const careers = await getCareersListService();
    expect(careers.length).toBe(7);

    const slugs = careers.map((c) => c.slug);
    expect(slugs).toContain('full-stack-developer');
    expect(slugs).toContain('frontend-developer');
    expect(slugs).toContain('backend-developer');
    expect(slugs).toContain('data-analyst');
    expect(slugs).toContain('ai-ml-engineer');
    expect(slugs).toContain('cybersecurity-analyst');
    expect(slugs).toContain('cloud-devops-engineer');
  });

  it('2. Career Details & Skill Mappings: Should return populated required skills for Full Stack Developer', async () => {
    const details = await getCareerDetailsService('full-stack-developer');
    expect(details.career.title).toBe('Full Stack Developer');
    expect(details.requiredSkills.length).toBeGreaterThan(0);

    const jsSkill = details.requiredSkills.find((s) => s.slug === 'javascript');
    expect(jsSkill).toBeDefined();
    expect(jsSkill?.requiredLevel).toBe(85);
    expect(jsSkill?.importance).toBe('CRITICAL');
  });

  it('3. Prerequisites DAG Validation: Ensures zero circular prerequisites across all 7 careers', async () => {
    const careers = await CareerModel.find({}).lean();
    for (const career of careers) {
      const mappings = await CareerSkillModel.find({ careerId: career._id })
        .populate('skillId', 'slug')
        .populate('prerequisites', 'slug')
        .lean();

      // Build dependency graph for career skills
      const adjList = new Map<string, string[]>();
      for (const m of mappings) {
        const sSlug = (m.skillId as any)?.slug;
        const prereqSlugs = (m.prerequisites || []).map((p: any) => p.slug);
        if (sSlug) {
          adjList.set(sSlug, prereqSlugs);
        }
      }

      // Cycle detection using DFS (visiting state: 0 = unvisited, 1 = visiting, 2 = visited)
      const state = new Map<string, number>();

      const hasCycle = (node: string): boolean => {
        state.set(node, 1);
        const neighbors = adjList.get(node) || [];
        for (const neighbor of neighbors) {
          const neighborState = state.get(neighbor) || 0;
          if (neighborState === 1) return true; // Cycle found!
          if (neighborState === 0 && hasCycle(neighbor)) return true;
        }
        state.set(node, 2);
        return false;
      };

      for (const node of adjList.keys()) {
        if ((state.get(node) || 0) === 0) {
          expect(hasCycle(node)).toBe(false);
        }
      }
    }
  });

  it('4. Assessment & Question Coverage: Every career diagnostic assessment maps to real targetSkillIds and questions', async () => {
    const assessments = await AssessmentModel.find({ type: 'DIAGNOSTIC' }).lean();
    expect(assessments.length).toBe(7);

    for (const assessment of assessments) {
      expect(assessment.targetSkillIds.length).toBeGreaterThan(0);

      // Verify associated questions reference valid skill IDs
      const questions = await QuestionModel.find({ assessmentId: assessment._id }).lean();
      for (const q of questions) {
        expect(q.skillId).toBeDefined();
        const skillExists = await SkillModel.exists({ _id: q.skillId });
        expect(skillExists).toBeTruthy();
      }
    }
  });

  it('5. Resource & Project Mappings: All resources and projects map to real Skill and Career IDs with valid URLs', async () => {
    const resources = await ResourceModel.find({}).lean();
    expect(resources.length).toBeGreaterThan(0);

    for (const r of resources) {
      expect(r.skillId).toBeDefined();
      const skillExists = await SkillModel.exists({ _id: r.skillId });
      expect(skillExists).toBeTruthy();
      expect(r.url).toMatch(/^https?:\/\//); // Verified valid URL
    }

    const projects = await ProjectModel.find({}).lean();
    expect(projects.length).toBeGreaterThan(0);

    for (const p of projects) {
      expect(p.skillId).toBeDefined();
      const skillExists = await SkillModel.exists({ _id: p.skillId });
      expect(skillExists).toBeTruthy();
      if (p.careerId) {
        const careerExists = await CareerModel.exists({ _id: p.careerId });
        expect(careerExists).toBeTruthy();
      }
    }
  });

  it('6. Seed Idempotency & Data Integrity: Re-running seed creates 0 duplicate records or dangling references', async () => {
    const skillsCountInitial = await SkillModel.countDocuments();
    const careersCountInitial = await CareerModel.countDocuments();
    const careerSkillsCountInitial = await CareerSkillModel.countDocuments();

    // Re-run seed
    await seedMaster();

    expect(await SkillModel.countDocuments()).toBe(skillsCountInitial);
    expect(await CareerModel.countDocuments()).toBe(careersCountInitial);
    expect(await CareerSkillModel.countDocuments()).toBe(careerSkillsCountInitial);
  });

  it('7. Student Career Readiness Integration: Returns deterministic readiness breakdown without Gemini AI', async () => {
    // Create student profile
    const user = await User.create({
      email: 'teststudent@example.com',
      passwordHash: 'hashedpassword',
      role: UserRole.STUDENT,
    });

    const profile = await StudentProfile.create({
      userId: user._id,
      fullName: 'Test Student',
      interests: ['coding'],
      targetCareer: 'Full Stack Developer',
    });

    const readiness = await getStudentCareerReadinessService((user._id as any).toString(), 'full-stack-developer');
    expect(readiness.career.slug).toBe('full-stack-developer');
    expect(readiness.readinessMetrics.formulaStatus).toBe('TO BE AGREED');
    expect(readiness.readinessMetrics.totalRequiredSkills).toBeGreaterThan(0);
    expect(readiness.skillBreakdown.length).toBeGreaterThan(0);
  });

});
