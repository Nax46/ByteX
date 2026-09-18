import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SkillModel } from '../src/models/Skill.js';
import { CareerModel } from '../src/models/Career.js';
import { CareerSkillModel } from '../src/models/CareerSkill.js';
import {
  calculateSkillGap,
  ProposedPriorityStrategy,
  buildSkillGapPrioritySnapshot,
} from '../src/services/skillGapPriorityEngine.js';
import { ICareerSkill, ISkill, IPriorityStrategy, IPriorityInput, IPriorityResult } from '../src/types/intelligence.js';

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
  vi.restoreAllMocks();
});

describe('Skill Gap Engine — Pure Deterministic Function', () => {
  it('should calculate correct gap for current 38 / target 75 -> gap 37', () => {
    const res = calculateSkillGap(38, 75);
    expect(res.gap).toBe(37);
    expect(res.currentLevel).toBe(38);
    expect(res.targetLevel).toBe(75);
    expect(res.hasEvidence).toBe(true);
    expect(res.status).toBe('MODERATE_GAP');
  });

  it('should calculate correct gap for current 0 / target 100 -> gap 100', () => {
    const res = calculateSkillGap(0, 100);
    expect(res.gap).toBe(100);
    expect(res.hasEvidence).toBe(true);
    expect(res.status).toBe('CRITICAL_GAP');
  });

  it('should calculate gap 0 when current matches target (75 / 75)', () => {
    const res = calculateSkillGap(75, 75);
    expect(res.gap).toBe(0);
    expect(res.status).toBe('TARGET_MET');
  });

  it('should normalize negative raw gap to 0 when student exceeds target (100 / 75)', () => {
    const res = calculateSkillGap(100, 75);
    expect(res.gap).toBe(0);
    expect(res.status).toBe('TARGET_MET');
  });

  it('should support boundary values (0 / 0, 100 / 100)', () => {
    const res1 = calculateSkillGap(0, 0);
    expect(res1.gap).toBe(0);
    expect(res1.status).toBe('TARGET_MET');

    const res2 = calculateSkillGap(100, 100);
    expect(res2.gap).toBe(0);
    expect(res2.status).toBe('TARGET_MET');
  });

  it('should handle missing skill evidence explicitly (current null / undefined)', () => {
    const resNull = calculateSkillGap(null, 75);
    expect(resNull.hasEvidence).toBe(false);
    expect(resNull.currentLevel).toBeNull();
    expect(resNull.gap).toBe(75);
    expect(resNull.status).toBe('NO_EVIDENCE');

    const resUndef = calculateSkillGap(undefined, 80);
    expect(resUndef.hasEvidence).toBe(false);
    expect(resUndef.currentLevel).toBeNull();
    expect(resUndef.gap).toBe(80);
    expect(resUndef.status).toBe('NO_EVIDENCE');
  });

  it('should distinguish NO_EVIDENCE from currentLevel = 0', () => {
    const noEvidence = calculateSkillGap(null, 50);
    const zeroEvidence = calculateSkillGap(0, 50);

    expect(noEvidence.hasEvidence).toBe(false);
    expect(noEvidence.currentLevel).toBeNull();
    expect(noEvidence.status).toBe('NO_EVIDENCE');

    expect(zeroEvidence.hasEvidence).toBe(true);
    expect(zeroEvidence.currentLevel).toBe(0);
    expect(zeroEvidence.status).toBe('CRITICAL_GAP');
  });

  it('should reject invalid level inputs (negative, > 100, NaN, Infinity)', () => {
    expect(() => calculateSkillGap(-5, 75)).toThrow('Current level must be between 0 and 100.');
    expect(() => calculateSkillGap(105, 75)).toThrow('Current level must be between 0 and 100.');
    expect(() => calculateSkillGap(50, -10)).toThrow('Target level must be between 0 and 100.');
    expect(() => calculateSkillGap(50, 150)).toThrow('Target level must be between 0 and 100.');
    expect(() => calculateSkillGap(NaN, 75)).toThrow('Current level must be a valid finite number.');
    expect(() => calculateSkillGap(50, Infinity)).toThrow('Target level must be a valid finite number.');
    expect(() => calculateSkillGap('invalid' as any, 75)).toThrow('Current level must be a valid finite number.');
  });
});

describe('Priority Engine & Strategy Pluggability', () => {
  it('should verify ProposedPriorityStrategy is explicitly marked provisional', () => {
    const strategy = new ProposedPriorityStrategy();
    expect(strategy.name).toBe('PROPOSED_WEIGHTED_HYBRID');
    expect(strategy.isProvisional).toBe(true);
  });

  it('should assign higher priority score to critical gaps and prerequisite skills', () => {
    const strategy = new ProposedPriorityStrategy();

    const criticalPrereqInput: IPriorityInput = {
      gapResult: calculateSkillGap(30, 80), // gap = 50
      importance: 'CRITICAL',
      weight: 1.0,
      prerequisites: [],
      isPrerequisiteForOthers: true,
    };

    const lowNonPrereqInput: IPriorityInput = {
      gapResult: calculateSkillGap(70, 80), // gap = 10
      importance: 'LOW',
      weight: 1.0,
      prerequisites: [],
      isPrerequisiteForOthers: false,
    };

    const critRes = strategy.calculatePriority(criticalPrereqInput);
    const lowRes = strategy.calculatePriority(lowNonPrereqInput);

    expect(critRes.priorityScore).toBeGreaterThan(lowRes.priorityScore);
    expect(critRes.isProvisional).toBe(true);
    expect(critRes.explanation).toContain('has a 50-point skill gap');
  });

  it('should set priorityScore to 0 when status is TARGET_MET', () => {
    const strategy = new ProposedPriorityStrategy();

    const targetMetInput: IPriorityInput = {
      gapResult: calculateSkillGap(85, 80), // gap = 0
      importance: 'CRITICAL',
      weight: 1.0,
      prerequisites: [],
      isPrerequisiteForOthers: false,
    };

    const res = strategy.calculatePriority(targetMetInput);
    expect(res.priorityScore).toBe(0);
    expect(res.priorityStatus).toBe('TARGET_MET');
    expect(res.explanation).toContain('is already met');
  });

  it('should support custom priority strategy pluggability', () => {
    class CustomMockStrategy implements IPriorityStrategy {
      public name = 'CUSTOM_TEST_STRATEGY';
      public isProvisional = false;

      public calculatePriority(input: IPriorityInput): IPriorityResult {
        return {
          priorityScore: input.gapResult.gap * 2,
          strategyName: this.name,
          isProvisional: this.isProvisional,
          priorityStatus: input.gapResult.status,
          explanation: 'Custom test explanation',
        };
      }
    }

    const customStrategy = new CustomMockStrategy();
    const input: IPriorityInput = {
      gapResult: calculateSkillGap(40, 90), // gap = 50
      importance: 'HIGH',
      weight: 1.0,
      prerequisites: [],
      isPrerequisiteForOthers: false,
    };

    const res = customStrategy.calculatePriority(input);
    expect(res.priorityScore).toBe(100); // 50 * 2
    expect(res.strategyName).toBe('CUSTOM_TEST_STRATEGY');
    expect(res.isProvisional).toBe(false);
  });
});

describe('Skill Gap & Priority Snapshot Orchestration', () => {
  it('should build a sorted snapshot array with prerequisites and missing scores correctly handled', () => {
    const jsId = new Types.ObjectId();
    const nodeId = new Types.ObjectId();
    const expressId = new Types.ObjectId();

    const careerSkills: ICareerSkill[] = [
      {
        careerId: new Types.ObjectId(),
        skillId: jsId,
        requiredLevel: 85,
        importance: 'CRITICAL',
        weight: 1.0,
        prerequisites: [],
      },
      {
        careerId: new Types.ObjectId(),
        skillId: nodeId,
        requiredLevel: 75,
        importance: 'HIGH',
        weight: 1.0,
        prerequisites: [jsId], // Node requires JS
      },
      {
        careerId: new Types.ObjectId(),
        skillId: expressId,
        requiredLevel: 70,
        importance: 'MEDIUM',
        weight: 1.0,
        prerequisites: [nodeId], // Express requires Node
      },
    ];

    const currentScoresMap = new Map<string, number>([
      [jsId.toString(), 85], // JS: Target Met
      [nodeId.toString(), 38], // Node: Gap = 37
      // Express has no score entry (NO_EVIDENCE)
    ]);

    const skillsMap = new Map<string, ISkill>([
      [jsId.toString(), { name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL', maxLevel: 100 }],
      [nodeId.toString(), { name: 'Node.js', slug: 'node-js', category: 'TECHNICAL', maxLevel: 100 }],
      [expressId.toString(), { name: 'Express', slug: 'express', category: 'FRAMEWORK', maxLevel: 100 }],
    ]);

    const snapshots = buildSkillGapPrioritySnapshot(careerSkills, currentScoresMap, skillsMap);

    expect(snapshots.length).toBe(3);

    // Verify Prerequisite Detection
    const jsSnapshot = snapshots.find((s) => s.skillId.toString() === jsId.toString());
    const nodeSnapshot = snapshots.find((s) => s.skillId.toString() === nodeId.toString());
    const expressSnapshot = snapshots.find((s) => s.skillId.toString() === expressId.toString());

    expect(jsSnapshot?.isPrerequisiteForOthers).toBe(true); // JS is required by Node
    expect(nodeSnapshot?.isPrerequisiteForOthers).toBe(true); // Node is required by Express
    expect(expressSnapshot?.isPrerequisiteForOthers).toBe(false);

    // Verify Gap & Evidence
    expect(jsSnapshot?.gap).toBe(0);
    expect(jsSnapshot?.priority.priorityStatus).toBe('TARGET_MET');

    expect(nodeSnapshot?.gap).toBe(37);
    expect(nodeSnapshot?.hasEvidence).toBe(true);

    expect(expressSnapshot?.gap).toBe(70);
    expect(expressSnapshot?.hasEvidence).toBe(false);
    expect(expressSnapshot?.priority.priorityStatus).toBe('NO_EVIDENCE');

    // Verify Descending Priority Sorting
    expect(snapshots[0].priority.priorityScore).toBeGreaterThanOrEqual(snapshots[1].priority.priorityScore);
    expect(snapshots[1].priority.priorityScore).toBeGreaterThanOrEqual(snapshots[2].priority.priorityScore);
    expect(snapshots[2].priority.priorityScore).toBe(0); // JS target met = 0 priority
  });

  it('should batch database queries when querying CareerSkills and Skills', async () => {
    const jsSkill = await SkillModel.create({ name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' });
    const reactSkill = await SkillModel.create({ name: 'React', slug: 'react', category: 'FRAMEWORK' });
    const career = await CareerModel.create({ title: 'Frontend Developer', slug: 'frontend-developer' });

    await CareerSkillModel.create({ careerId: career._id, skillId: jsSkill._id, requiredLevel: 80, importance: 'CRITICAL' });
    await CareerSkillModel.create({ careerId: career._id, skillId: reactSkill._id, requiredLevel: 75, importance: 'HIGH' });

    const careerSkillsSpy = vi.spyOn(CareerSkillModel, 'find');
    const skillsSpy = vi.spyOn(SkillModel, 'find');

    // Perform batched DB retrieval
    const dbCareerSkills = await CareerSkillModel.find({ careerId: career._id });
    const skillIds = dbCareerSkills.map((cs) => cs.skillId);
    const dbSkills = await SkillModel.find({ _id: { $in: skillIds } });

    expect(careerSkillsSpy).toHaveBeenCalledTimes(1);
    expect(skillsSpy).toHaveBeenCalledTimes(1);

    const skillsMap = new Map<string, ISkill>();
    dbSkills.forEach((s) => skillsMap.set(s._id.toString(), s.toObject()));

    const currentScoresMap = new Map<string, number>([
      [jsSkill._id.toString(), 60],
      [reactSkill._id.toString(), 40],
    ]);

    const snapshots = buildSkillGapPrioritySnapshot(dbCareerSkills, currentScoresMap, skillsMap);
    expect(snapshots.length).toBe(2);
  });
});
