import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { StudentProfile } from '../src/models/StudentProfile.js';
import { SkillModel } from '../src/models/Skill.js';
import { CareerModel } from '../src/models/Career.js';
import { CareerSkillModel } from '../src/models/CareerSkill.js';
import { AssessmentModel } from '../src/models/Assessment.js';
import { AssessmentAttemptModel } from '../src/models/AssessmentAttempt.js';
import { RoadmapModel } from '../src/models/Roadmap.js';
import {
  generateDeterministicRoadmapModules,
  generateRoadmapForStudent,
  RoadmapGenerationError,
} from '../src/services/roadmapGenerationService.js';
import { ISkillGapPrioritySnapshot, ISkill } from '../src/types/intelligence.js';

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
  await AssessmentAttemptModel.deleteMany({});
  await RoadmapModel.deleteMany({});
  vi.restoreAllMocks();
});

describe('Roadmap Generation Engine & Topological Sorting', () => {
  it('Test 1 — Basic roadmap generation', () => {
    const jsId = new Types.ObjectId();
    const nodeIds = new Types.ObjectId();

    const snapshots: ISkillGapPrioritySnapshot[] = [
      {
        skillId: jsId,
        skillName: 'JavaScript',
        skillSlug: 'javascript',
        currentLevel: 40,
        targetLevel: 85,
        gap: 45,
        hasEvidence: true,
        importance: 'CRITICAL',
        weight: 1.0,
        prerequisites: [],
        isPrerequisiteForOthers: false,
        priority: {
          priorityScore: 75,
          strategyName: 'PROPOSED_WEIGHTED_HYBRID',
          isProvisional: true,
          priorityStatus: 'CRITICAL_GAP',
          explanation: 'JavaScript gap 45',
        },
      },
      {
        skillId: nodeIds,
        skillName: 'Node.js',
        skillSlug: 'node-js',
        currentLevel: 30,
        targetLevel: 75,
        gap: 45,
        hasEvidence: true,
        importance: 'HIGH',
        weight: 1.0,
        prerequisites: [],
        isPrerequisiteForOthers: false,
        priority: {
          priorityScore: 65,
          strategyName: 'PROPOSED_WEIGHTED_HYBRID',
          isProvisional: true,
          priorityStatus: 'CRITICAL_GAP',
          explanation: 'Node.js gap 45',
        },
      },
    ];

    const modules = generateDeterministicRoadmapModules(snapshots);

    expect(modules.length).toBe(2);
    expect(modules[0].skillId.toString()).toBe(jsId.toString());
    expect(modules[0].order).toBe(1);
    expect(modules[0].status).toBe('IN_PROGRESS');
    expect(modules[1].skillId.toString()).toBe(nodeIds.toString());
    expect(modules[1].order).toBe(2);
    expect(modules[1].status).toBe('LOCKED');
  });

  it('Test 2 — Target-met filtering (TARGET_MET skills not generated as active modules)', () => {
    const jsId = new Types.ObjectId();
    const reactId = new Types.ObjectId();

    const snapshots: ISkillGapPrioritySnapshot[] = [
      {
        skillId: jsId,
        skillName: 'JavaScript',
        skillSlug: 'javascript',
        currentLevel: 85,
        targetLevel: 85,
        gap: 0,
        hasEvidence: true,
        importance: 'CRITICAL',
        weight: 1.0,
        prerequisites: [],
        isPrerequisiteForOthers: false,
        priority: {
          priorityScore: 0,
          strategyName: 'PROPOSED_WEIGHTED_HYBRID',
          isProvisional: true,
          priorityStatus: 'TARGET_MET',
          explanation: 'Target met',
        },
      },
      {
        skillId: reactId,
        skillName: 'React',
        skillSlug: 'react',
        currentLevel: 30,
        targetLevel: 80,
        gap: 50,
        hasEvidence: true,
        importance: 'HIGH',
        weight: 1.0,
        prerequisites: [],
        isPrerequisiteForOthers: false,
        priority: {
          priorityScore: 70,
          strategyName: 'PROPOSED_WEIGHTED_HYBRID',
          isProvisional: true,
          priorityStatus: 'CRITICAL_GAP',
          explanation: 'React gap 50',
        },
      },
    ];

    const modules = generateDeterministicRoadmapModules(snapshots);

    expect(modules.length).toBe(1);
    expect(modules[0].skillId.toString()).toBe(reactId.toString());
  });

  it('Test 3 — Priority ordering for independent skills', () => {
    const skillAId = new Types.ObjectId();
    const skillBId = new Types.ObjectId();

    const snapshots: ISkillGapPrioritySnapshot[] = [
      {
        skillId: skillAId,
        skillName: 'Skill A',
        skillSlug: 'skill-a',
        currentLevel: 50,
        targetLevel: 80,
        gap: 30,
        hasEvidence: true,
        importance: 'MEDIUM',
        weight: 1.0,
        prerequisites: [],
        isPrerequisiteForOthers: false,
        priority: { priorityScore: 50, strategyName: 'PROPOSED', isProvisional: true, priorityStatus: 'MODERATE_GAP', explanation: '' },
      },
      {
        skillId: skillBId,
        skillName: 'Skill B',
        skillSlug: 'skill-b',
        currentLevel: 20,
        targetLevel: 80,
        gap: 60,
        hasEvidence: true,
        importance: 'HIGH',
        weight: 1.0,
        prerequisites: [],
        isPrerequisiteForOthers: false,
        priority: { priorityScore: 90, strategyName: 'PROPOSED', isProvisional: true, priorityStatus: 'CRITICAL_GAP', explanation: '' },
      },
    ];

    const modules = generateDeterministicRoadmapModules(snapshots);

    expect(modules[0].skillId.toString()).toBe(skillBId.toString()); // Higher priority (90) comes first
    expect(modules[1].skillId.toString()).toBe(skillAId.toString());
  });

  it('Test 4 — Prerequisite ordering overrides higher priority score', () => {
    const jsId = new Types.ObjectId();
    const authId = new Types.ObjectId();

    // Auth has priority 95, but requires JS which has priority 50
    const snapshots: ISkillGapPrioritySnapshot[] = [
      {
        skillId: authId,
        skillName: 'Authentication',
        skillSlug: 'authentication',
        currentLevel: 10,
        targetLevel: 90,
        gap: 80,
        hasEvidence: true,
        importance: 'CRITICAL',
        weight: 1.0,
        prerequisites: [jsId], // Auth depends on JS
        isPrerequisiteForOthers: false,
        priority: { priorityScore: 95, strategyName: 'PROPOSED', isProvisional: true, priorityStatus: 'CRITICAL_GAP', explanation: '' },
      },
      {
        skillId: jsId,
        skillName: 'JavaScript',
        skillSlug: 'javascript',
        currentLevel: 50,
        targetLevel: 80,
        gap: 30,
        hasEvidence: true,
        importance: 'HIGH',
        weight: 1.0,
        prerequisites: [],
        isPrerequisiteForOthers: true,
        priority: { priorityScore: 50, strategyName: 'PROPOSED', isProvisional: true, priorityStatus: 'MODERATE_GAP', explanation: '' },
      },
    ];

    const modules = generateDeterministicRoadmapModules(snapshots);

    expect(modules[0].skillId.toString()).toBe(jsId.toString()); // JS (Prerequisite) MUST come before Auth
    expect(modules[1].skillId.toString()).toBe(authId.toString());
  });

  it('Test 5 — Multi-level dependency topological sequence (A -> B -> C)', () => {
    const aId = new Types.ObjectId();
    const bId = new Types.ObjectId();
    const cId = new Types.ObjectId();

    const snapshots: ISkillGapPrioritySnapshot[] = [
      {
        skillId: cId,
        skillName: 'Skill C',
        skillSlug: 'skill-c',
        currentLevel: 0,
        targetLevel: 80,
        gap: 80,
        hasEvidence: false,
        importance: 'CRITICAL',
        weight: 1.0,
        prerequisites: [bId], // C requires B
        isPrerequisiteForOthers: false,
        priority: { priorityScore: 99, strategyName: 'P', isProvisional: true, priorityStatus: 'NO_EVIDENCE', explanation: '' },
      },
      {
        skillId: bId,
        skillName: 'Skill B',
        skillSlug: 'skill-b',
        currentLevel: 0,
        targetLevel: 80,
        gap: 80,
        hasEvidence: false,
        importance: 'HIGH',
        weight: 1.0,
        prerequisites: [aId], // B requires A
        isPrerequisiteForOthers: true,
        priority: { priorityScore: 80, strategyName: 'P', isProvisional: true, priorityStatus: 'NO_EVIDENCE', explanation: '' },
      },
      {
        skillId: aId,
        skillName: 'Skill A',
        skillSlug: 'skill-a',
        currentLevel: 0,
        targetLevel: 80,
        gap: 80,
        hasEvidence: false,
        importance: 'MEDIUM',
        weight: 1.0,
        prerequisites: [],
        isPrerequisiteForOthers: true,
        priority: { priorityScore: 50, strategyName: 'P', isProvisional: true, priorityStatus: 'NO_EVIDENCE', explanation: '' },
      },
    ];

    const modules = generateDeterministicRoadmapModules(snapshots);

    expect(modules[0].skillId.toString()).toBe(aId.toString());
    expect(modules[1].skillId.toString()).toBe(bId.toString());
    expect(modules[2].skillId.toString()).toBe(cId.toString());
  });

  it('Test 6 — Target-met prerequisite allows dependent skill without generating extra module', () => {
    const jsId = new Types.ObjectId();
    const nodeSkillId = new Types.ObjectId();

    // JS is TARGET_MET. Node depends on JS and has a 40-point gap.
    const snapshots: ISkillGapPrioritySnapshot[] = [
      {
        skillId: jsId,
        skillName: 'JavaScript',
        skillSlug: 'javascript',
        currentLevel: 85,
        targetLevel: 85,
        gap: 0,
        hasEvidence: true,
        importance: 'CRITICAL',
        weight: 1.0,
        prerequisites: [],
        isPrerequisiteForOthers: true,
        priority: { priorityScore: 0, strategyName: 'P', isProvisional: true, priorityStatus: 'TARGET_MET', explanation: '' },
      },
      {
        skillId: nodeSkillId,
        skillName: 'Node.js',
        skillSlug: 'node-js',
        currentLevel: 35,
        targetLevel: 75,
        gap: 40,
        hasEvidence: true,
        importance: 'HIGH',
        weight: 1.0,
        prerequisites: [jsId], // Node depends on JS (which is TARGET_MET)
        isPrerequisiteForOthers: false,
        priority: { priorityScore: 65, strategyName: 'P', isProvisional: true, priorityStatus: 'CRITICAL_GAP', explanation: '' },
      },
    ];

    const modules = generateDeterministicRoadmapModules(snapshots);

    expect(modules.length).toBe(1); // JS module is skipped because target is met
    expect(modules[0].skillId.toString()).toBe(nodeSkillId.toString());
    expect(modules[0].order).toBe(1);
    expect(modules[0].status).toBe('IN_PROGRESS');
  });

  it('Test 7 — Cycle detection throws RoadmapGenerationError safely', () => {
    const aId = new Types.ObjectId();
    const bId = new Types.ObjectId();

    // Circular dependency: A depends on B, and B depends on A
    const snapshots: ISkillGapPrioritySnapshot[] = [
      {
        skillId: aId,
        skillName: 'Skill A',
        skillSlug: 'skill-a',
        currentLevel: 10,
        targetLevel: 80,
        gap: 70,
        hasEvidence: true,
        importance: 'HIGH',
        weight: 1.0,
        prerequisites: [bId],
        isPrerequisiteForOthers: true,
        priority: { priorityScore: 80, strategyName: 'P', isProvisional: true, priorityStatus: 'CRITICAL_GAP', explanation: '' },
      },
      {
        skillId: bId,
        skillName: 'Skill B',
        skillSlug: 'skill-b',
        currentLevel: 10,
        targetLevel: 80,
        gap: 70,
        hasEvidence: true,
        importance: 'HIGH',
        weight: 1.0,
        prerequisites: [aId],
        isPrerequisiteForOthers: true,
        priority: { priorityScore: 80, strategyName: 'P', isProvisional: true, priorityStatus: 'CRITICAL_GAP', explanation: '' },
      },
    ];

    expect(() => generateDeterministicRoadmapModules(snapshots)).toThrow(RoadmapGenerationError);
    expect(() => generateDeterministicRoadmapModules(snapshots)).toThrow(
      'Prerequisite cycle detected in skill requirements graph.'
    );
  });

  it('Test 8 — Determinism check (identical input produces 100% identical output)', () => {
    const s1 = new Types.ObjectId();
    const s2 = new Types.ObjectId();

    const snapshots: ISkillGapPrioritySnapshot[] = [
      {
        skillId: s1,
        skillName: 'Skill 1',
        skillSlug: 'skill-1',
        currentLevel: 20,
        targetLevel: 80,
        gap: 60,
        hasEvidence: true,
        importance: 'HIGH',
        weight: 1.0,
        prerequisites: [],
        isPrerequisiteForOthers: false,
        priority: { priorityScore: 70, strategyName: 'P', isProvisional: true, priorityStatus: 'CRITICAL_GAP', explanation: '' },
      },
      {
        skillId: s2,
        skillName: 'Skill 2',
        skillSlug: 'skill-2',
        currentLevel: 30,
        targetLevel: 80,
        gap: 50,
        hasEvidence: true,
        importance: 'MEDIUM',
        weight: 1.0,
        prerequisites: [],
        isPrerequisiteForOthers: false,
        priority: { priorityScore: 60, strategyName: 'P', isProvisional: true, priorityStatus: 'CRITICAL_GAP', explanation: '' },
      },
    ];

    const run1 = generateDeterministicRoadmapModules(snapshots);
    const run2 = generateDeterministicRoadmapModules(snapshots);

    expect(run1).toEqual(run2);
  });

  it('Test 9 — Tie-breaking stability for equal priority skills', () => {
    const s1 = new Types.ObjectId();
    const s2 = new Types.ObjectId();

    const snapshots: ISkillGapPrioritySnapshot[] = [
      {
        skillId: s1,
        skillName: 'Beta Skill',
        skillSlug: 'beta-skill',
        currentLevel: 40,
        targetLevel: 80,
        gap: 40,
        hasEvidence: true,
        importance: 'HIGH',
        weight: 1.0,
        prerequisites: [],
        isPrerequisiteForOthers: false,
        priority: { priorityScore: 70, strategyName: 'P', isProvisional: true, priorityStatus: 'CRITICAL_GAP', explanation: '' },
      },
      {
        skillId: s2,
        skillName: 'Alpha Skill',
        skillSlug: 'alpha-skill',
        currentLevel: 40,
        targetLevel: 80,
        gap: 40,
        hasEvidence: true,
        importance: 'HIGH',
        weight: 1.0,
        prerequisites: [],
        isPrerequisiteForOthers: false,
        priority: { priorityScore: 70, strategyName: 'P', isProvisional: true, priorityStatus: 'CRITICAL_GAP', explanation: '' },
      },
    ];

    const modules = generateDeterministicRoadmapModules(snapshots);

    // Tied priority and importance -> stable tie-break by slug ascending ('alpha-skill' before 'beta-skill')
    expect(modules[0].skillId.toString()).toBe(s2.toString());
    expect(modules[1].skillId.toString()).toBe(s1.toString());
  });

  it('Test 10 — Historical roadmap versioning & preservation (V1 -> V2)', async () => {
    const user = await User.create({ email: 'roadmap_user@example.com', passwordHash: 'hash123' });
    const profile = await StudentProfile.create({
      userId: user._id,
      fullName: 'Roadmap Version Student',
      targetCareer: 'Full Stack Developer',
    });

    const jsSkill = await SkillModel.create({ name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' });
    const career = await CareerModel.create({ title: 'Full Stack Developer', slug: 'full-stack-developer' });

    await CareerSkillModel.create({ careerId: career._id, skillId: jsSkill._id, requiredLevel: 85, importance: 'CRITICAL' });

    // Generate V1 Roadmap
    const r1 = await generateRoadmapForStudent(user._id.toString(), career._id.toString());
    expect(r1.version).toBe(1);
    expect(r1.isCurrent).toBe(true);
    expect(r1.status).toBe('ACTIVE');

    // Generate V2 Roadmap (e.g. after reassessment)
    const r2 = await generateRoadmapForStudent(user._id.toString(), career._id.toString());
    expect(r2.version).toBe(2);
    expect(r2.isCurrent).toBe(true);
    expect(r2.status).toBe('ACTIVE');

    // Check V1 state in DB: V1 must be preserved with isCurrent = false and status = ARCHIVED
    const r1Updated = await RoadmapModel.findById(r1._id);
    expect(r1Updated?.version).toBe(1);
    expect(r1Updated?.isCurrent).toBe(false);
    expect(r1Updated?.status).toBe('ARCHIVED');

    const totalRoadmaps = await RoadmapModel.countDocuments({ studentProfileId: profile._id });
    expect(totalRoadmaps).toBe(2);
  });

  it('Test 11 — No mutation of input objects', () => {
    const sId = new Types.ObjectId();
    const originalSnapshot: ISkillGapPrioritySnapshot = {
      skillId: sId,
      skillName: 'JavaScript',
      skillSlug: 'javascript',
      currentLevel: 40,
      targetLevel: 85,
      gap: 45,
      hasEvidence: true,
      importance: 'CRITICAL',
      weight: 1.0,
      prerequisites: [],
      isPrerequisiteForOthers: false,
      priority: { priorityScore: 75, strategyName: 'P', isProvisional: true, priorityStatus: 'CRITICAL_GAP', explanation: '' },
    };

    const clone = JSON.parse(JSON.stringify(originalSnapshot));

    generateDeterministicRoadmapModules([originalSnapshot]);

    expect(originalSnapshot.skillId.toString()).toBe(clone.skillId);
    expect(originalSnapshot.gap).toBe(clone.gap);
  });

  it('Test 12 — Batched queries during roadmap generation service', async () => {
    const user = await User.create({ email: 'roadmap_batch@example.com', passwordHash: 'hash123' });
    await StudentProfile.create({
      userId: user._id,
      fullName: 'Batch Student',
      targetCareer: 'Full Stack Developer',
    });

    const jsSkill = await SkillModel.create({ name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' });
    const reactSkill = await SkillModel.create({ name: 'React', slug: 'react', category: 'FRAMEWORK' });
    const career = await CareerModel.create({ title: 'Full Stack Developer', slug: 'full-stack-developer' });

    await CareerSkillModel.create({ careerId: career._id, skillId: jsSkill._id, requiredLevel: 85, importance: 'CRITICAL' });
    await CareerSkillModel.create({ careerId: career._id, skillId: reactSkill._id, requiredLevel: 80, importance: 'HIGH' });

    const careerSkillsSpy = vi.spyOn(CareerSkillModel, 'find');
    const skillsSpy = vi.spyOn(SkillModel, 'find');

    const roadmap = await generateRoadmapForStudent(user._id.toString(), career._id.toString());

    expect(careerSkillsSpy).toHaveBeenCalledTimes(1);
    expect(skillsSpy).toHaveBeenCalledTimes(1);
    expect(roadmap.modules.length).toBe(2);
  });
});
