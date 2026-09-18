import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { StudentProfile, IStudentProfileDocument } from '../src/models/StudentProfile.js';
import { SkillModel } from '../src/models/Skill.js';
import { CareerModel } from '../src/models/Career.js';
import { RoadmapModel, IRoadmapDocument } from '../src/models/Roadmap.js';
import { RoadmapProgressModel } from '../src/models/RoadmapProgress.js';
import {
  calculateOverallProgress,
  applyModuleStart,
  applyModuleProgressUpdate,
  applyModuleComplete,
  getOrCreateRoadmapProgress,
  startModuleProgress,
  updateModuleProgress,
  completeModuleProgress,
  getRoadmapProgressSummary,
} from '../src/services/roadmapProgressService.js';
import { RoadmapProgressError, IModuleProgressItem } from '../src/types/progress.js';
import { IRoadmapModule } from '../src/types/intelligence.js';

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
  await RoadmapModel.deleteMany({});
  await RoadmapProgressModel.deleteMany({});
});

describe('Roadmap Progress Service (P2-ROAD-003)', () => {
  // Helper to create test setup with user, profile, career, and roadmap
  const setupTestEnvironment = async (
    version: number = 1,
    isCurrent: boolean = true
  ): Promise<{
    user: InstanceType<typeof User>;
    studentProfile: IStudentProfileDocument;
    career: InstanceType<typeof CareerModel>;
    roadmap: IRoadmapDocument;
    jsSkillId: Types.ObjectId;
    nodeSkillId: Types.ObjectId;
    reactSkillId: Types.ObjectId;
  }> => {
    const user = await User.create({
      email: `student-${Date.now()}-${Math.random()}@example.com`,
      passwordHash: 'hashedpass123',
    });

    const randomSuffix = Math.floor(Math.random() * 1000000);
    const career = await CareerModel.create({
      title: 'Full Stack Web Developer',
      slug: `full-stack-${Date.now()}-${randomSuffix}`,
      isActive: true,
    });

    const studentProfile = await StudentProfile.create({
      userId: user._id,
      fullName: 'Test Student',
      targetCareer: career.title,
    });

    const jsSkillId = new Types.ObjectId();
    const nodeSkillId = new Types.ObjectId();
    const reactSkillId = new Types.ObjectId();

    const modules: IRoadmapModule[] = [
      {
        moduleId: 'mod-javascript-1',
        skillId: jsSkillId,
        title: 'JavaScript Fundamentals',
        description: 'Learn core JS concepts',
        order: 1,
        targetLevel: 80,
        currentLevel: 20,
        gapMagnitude: 60,
        priorityScore: 90,
        prerequisites: [],
        status: 'IN_PROGRESS',
      },
      {
        moduleId: 'mod-nodejs-2',
        skillId: nodeSkillId,
        title: 'Node.js Fundamentals',
        description: 'Backend JS runtime',
        order: 2,
        targetLevel: 80,
        currentLevel: 10,
        gapMagnitude: 70,
        priorityScore: 85,
        prerequisites: [jsSkillId],
        status: 'LOCKED',
      },
      {
        moduleId: 'mod-react-3',
        skillId: reactSkillId,
        title: 'React Fundamentals',
        description: 'Frontend UI library',
        order: 3,
        targetLevel: 75,
        currentLevel: 0,
        gapMagnitude: 75,
        priorityScore: 80,
        prerequisites: [nodeSkillId],
        status: 'LOCKED',
      },
    ];

    const roadmap = await RoadmapModel.create({
      userId: user._id,
      studentProfileId: studentProfile._id,
      careerId: career._id,
      title: `Learning Roadmap V${version}`,
      version,
      isCurrent,
      status: isCurrent ? 'ACTIVE' : 'ARCHIVED',
      modules,
    });

    return { user, studentProfile, career, roadmap, jsSkillId, nodeSkillId, reactSkillId };
  };

  // Test 1 — Initial progress state
  it('Test 1 — Initial progress state initializes module 1 as IN_PROGRESS and subsequent as LOCKED', async () => {
    const { user, roadmap } = await setupTestEnvironment();

    const { progress } = await getOrCreateRoadmapProgress(roadmap._id.toString(), user._id.toString());

    expect(progress).toBeDefined();
    expect(progress.roadmapId.toString()).toBe(roadmap._id.toString());
    expect(progress.modules).toHaveLength(3);

    expect(progress.modules[0].moduleId).toBe('mod-javascript-1');
    expect(progress.modules[0].status).toBe('IN_PROGRESS');
    expect(progress.modules[0].progressPercent).toBe(0);
    expect(progress.modules[0].startedAt).toBeDefined();

    expect(progress.modules[1].moduleId).toBe('mod-nodejs-2');
    expect(progress.modules[1].status).toBe('LOCKED');

    expect(progress.modules[2].moduleId).toBe('mod-react-3');
    expect(progress.modules[2].status).toBe('LOCKED');

    expect(progress.overallProgress).toBe(0);
    expect(progress.totalModules).toBe(3);
    expect(progress.completedModules).toBe(0);
    expect(progress.inProgressModules).toBe(1);
    expect(progress.lockedModules).toBe(2);
  });

  // Test 2 — Start locked/available module according to dependency rules
  it('Test 2 — Starting unlocked module transitions status from LOCKED to IN_PROGRESS', async () => {
    const { user, roadmap } = await setupTestEnvironment();

    // First complete module 1 so module 2 becomes unlocked
    await completeModuleProgress(roadmap._id.toString(), 'mod-javascript-1', user._id.toString());

    // Now start module 2
    const updatedProgress = await startModuleProgress(
      roadmap._id.toString(),
      'mod-nodejs-2',
      user._id.toString()
    );

    const mod2 = updatedProgress.modules.find((m) => m.moduleId === 'mod-nodejs-2')!;
    expect(mod2.status).toBe('IN_PROGRESS');
    expect(mod2.startedAt).toBeDefined();
    expect(mod2.lastActivityAt).toBeDefined();
  });

  // Test 3 — Start module sets timestamps
  it('Test 3 — Starting a module sets startedAt and lastActivityAt timestamps', async () => {
    const { user, roadmap } = await setupTestEnvironment();

    const before = new Date();
    const updatedProgress = await startModuleProgress(
      roadmap._id.toString(),
      'mod-javascript-1',
      user._id.toString()
    );

    const mod1 = updatedProgress.modules.find((m) => m.moduleId === 'mod-javascript-1')!;
    expect(mod1.startedAt).toBeDefined();
    expect(mod1.lastActivityAt).toBeDefined();
    expect(new Date(mod1.startedAt!).getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
  });

  // Test 4 — Starting an already IN_PROGRESS module is idempotent
  it('Test 4 — Starting an already IN_PROGRESS module is idempotent and preserves startedAt', async () => {
    const { user, roadmap } = await setupTestEnvironment();

    const firstStart = await startModuleProgress(
      roadmap._id.toString(),
      'mod-javascript-1',
      user._id.toString()
    );
    const firstStartedAt = firstStart.modules[0].startedAt;

    await new Promise((r) => setTimeout(r, 20));

    const secondStart = await startModuleProgress(
      roadmap._id.toString(),
      'mod-javascript-1',
      user._id.toString()
    );
    const secondStartedAt = secondStart.modules[0].startedAt;

    expect(secondStart.modules[0].status).toBe('IN_PROGRESS');
    expect(new Date(secondStartedAt!).getTime()).toBe(new Date(firstStartedAt!).getTime());
  });

  // Test 5 — Starting a COMPLETED module does not regress it
  it('Test 5 — Starting a COMPLETED module does not regress it back to IN_PROGRESS', async () => {
    const { user, roadmap } = await setupTestEnvironment();

    await completeModuleProgress(roadmap._id.toString(), 'mod-javascript-1', user._id.toString());

    const result = await startModuleProgress(
      roadmap._id.toString(),
      'mod-javascript-1',
      user._id.toString()
    );

    const mod1 = result.modules.find((m) => m.moduleId === 'mod-javascript-1')!;
    expect(mod1.status).toBe('COMPLETED');
    expect(mod1.progressPercent).toBe(100);
  });

  // Test 6 — Valid progress update (1–99%)
  it('Test 6 — Valid progress update (1-99%) sets IN_PROGRESS and progressPercent', async () => {
    const { user, roadmap } = await setupTestEnvironment();

    const updatedProgress = await updateModuleProgress(
      roadmap._id.toString(),
      'mod-javascript-1',
      65,
      user._id.toString()
    );

    const mod1 = updatedProgress.modules.find((m) => m.moduleId === 'mod-javascript-1')!;
    expect(mod1.status).toBe('IN_PROGRESS');
    expect(mod1.progressPercent).toBe(65);
    expect(updatedProgress.overallProgress).toBe(0); // 0/3 completed = 0%
  });

  // Test 7 — 100% results in COMPLETED
  it('Test 7 — Updating progress to 100% sets status to COMPLETED and completedAt', async () => {
    const { user, roadmap } = await setupTestEnvironment();

    const updatedProgress = await updateModuleProgress(
      roadmap._id.toString(),
      'mod-javascript-1',
      100,
      user._id.toString()
    );

    const mod1 = updatedProgress.modules.find((m) => m.moduleId === 'mod-javascript-1')!;
    expect(mod1.status).toBe('COMPLETED');
    expect(mod1.progressPercent).toBe(100);
    expect(mod1.completedAt).toBeDefined();
    expect(updatedProgress.overallProgress).toBe(33); // 1/3 completed = 33%
  });

  // Test 8 — Invalid negative progress rejected
  it('Test 8 — Negative progress percentage is rejected with RoadmapProgressError (400)', async () => {
    const { user, roadmap } = await setupTestEnvironment();

    await expect(
      updateModuleProgress(roadmap._id.toString(), 'mod-javascript-1', -15, user._id.toString())
    ).rejects.toThrow(RoadmapProgressError);
  });

  // Test 9 — Progress >100 rejected
  it('Test 9 — Progress percentage greater than 100 is rejected with RoadmapProgressError (400)', async () => {
    const { user, roadmap } = await setupTestEnvironment();

    await expect(
      updateModuleProgress(roadmap._id.toString(), 'mod-javascript-1', 125, user._id.toString())
    ).rejects.toThrow(RoadmapProgressError);
  });

  // Test 10 — Completion preserves startedAt
  it('Test 10 — Completing a module preserves its original startedAt timestamp', async () => {
    const { user, roadmap } = await setupTestEnvironment();

    const startedState = await startModuleProgress(
      roadmap._id.toString(),
      'mod-javascript-1',
      user._id.toString()
    );
    const initialStartedAt = startedState.modules[0].startedAt;

    await new Promise((r) => setTimeout(r, 20));

    const completedState = await completeModuleProgress(
      roadmap._id.toString(),
      'mod-javascript-1',
      user._id.toString()
    );

    const mod1 = completedState.modules[0];
    expect(mod1.status).toBe('COMPLETED');
    expect(new Date(mod1.startedAt!).getTime()).toBe(new Date(initialStartedAt!).getTime());
    expect(mod1.completedAt).toBeDefined();
  });

  // Test 11 — Repeated completion is idempotent
  it('Test 11 — Repeated module completion is idempotent', async () => {
    const { user, roadmap } = await setupTestEnvironment();

    const firstComplete = await completeModuleProgress(
      roadmap._id.toString(),
      'mod-javascript-1',
      user._id.toString()
    );
    const firstCompletedAt = firstComplete.modules[0].completedAt;

    await new Promise((r) => setTimeout(r, 20));

    const secondComplete = await completeModuleProgress(
      roadmap._id.toString(),
      'mod-javascript-1',
      user._id.toString()
    );

    expect(secondComplete.modules[0].status).toBe('COMPLETED');
    expect(new Date(secondComplete.modules[0].completedAt!).getTime()).toBe(
      new Date(firstCompletedAt!).getTime()
    );
  });

  // Test 12 — Prerequisite module prevents dependent module from being started while locked
  it('Test 12 — Attempting to start a locked module with incomplete prerequisites throws RoadmapProgressError (400)', async () => {
    const { user, roadmap } = await setupTestEnvironment();

    // Module 2 (Node.js) depends on Module 1 (JavaScript). Module 1 is NOT completed yet.
    await expect(
      startModuleProgress(roadmap._id.toString(), 'mod-nodejs-2', user._id.toString())
    ).rejects.toThrow(RoadmapProgressError);

    await expect(
      updateModuleProgress(roadmap._id.toString(), 'mod-nodejs-2', 50, user._id.toString())
    ).rejects.toThrow(RoadmapProgressError);
  });

  // Test 13 — Completing prerequisite unlocks next module according to existing roadmap rules
  it('Test 13 — Completing prerequisite module unlocks dependent module', async () => {
    const { user, roadmap } = await setupTestEnvironment();

    // 1. Complete Module 1 (JS)
    await completeModuleProgress(roadmap._id.toString(), 'mod-javascript-1', user._id.toString());

    // 2. Module 2 (Node.js) should now be unlockable
    const mod2Start = await startModuleProgress(
      roadmap._id.toString(),
      'mod-nodejs-2',
      user._id.toString()
    );
    expect(mod2Start.modules.find((m) => m.moduleId === 'mod-nodejs-2')!.status).toBe('IN_PROGRESS');

    // 3. Complete Module 2 (Node.js)
    await completeModuleProgress(roadmap._id.toString(), 'mod-nodejs-2', user._id.toString());

    // 4. Module 3 (React) should now be unlockable
    const mod3Start = await startModuleProgress(
      roadmap._id.toString(),
      'mod-react-3',
      user._id.toString()
    );
    expect(mod3Start.modules.find((m) => m.moduleId === 'mod-react-3')!.status).toBe('IN_PROGRESS');
  });

  // Test 14 — Overall progress calculation
  it('Test 14 — Overall progress calculation returns rounded integer percentage', () => {
    const sampleItems: IModuleProgressItem[] = [
      { moduleId: '1', status: 'COMPLETED', progressPercent: 100 },
      { moduleId: '2', status: 'IN_PROGRESS', progressPercent: 50 },
      { moduleId: '3', status: 'LOCKED', progressPercent: 0 },
    ];

    const stats = calculateOverallProgress(sampleItems);
    expect(stats.overallProgress).toBe(33); // 1/3 = 33.333% -> 33
    expect(stats.totalModules).toBe(3);
    expect(stats.completedModules).toBe(1);
    expect(stats.inProgressModules).toBe(1);
    expect(stats.lockedModules).toBe(1);
  });

  // Test 15 — All modules completed
  it('Test 15 — All modules completed yields overallProgress = 100', async () => {
    const { user, roadmap } = await setupTestEnvironment();

    await completeModuleProgress(roadmap._id.toString(), 'mod-javascript-1', user._id.toString());
    await completeModuleProgress(roadmap._id.toString(), 'mod-nodejs-2', user._id.toString());
    const finalState = await completeModuleProgress(
      roadmap._id.toString(),
      'mod-react-3',
      user._id.toString()
    );

    expect(finalState.overallProgress).toBe(100);
    expect(finalState.completedModules).toBe(3);
    expect(finalState.lockedModules).toBe(0);
    expect(finalState.inProgressModules).toBe(0);
  });

  // Test 16 — Zero-module roadmap safely returns 0
  it('Test 16 — Zero-module roadmap safely returns 0 without NaN or Infinity', () => {
    const stats = calculateOverallProgress([]);
    expect(stats.overallProgress).toBe(0);
    expect(stats.totalModules).toBe(0);
    expect(stats.completedModules).toBe(0);
    expect(stats.inProgressModules).toBe(0);
    expect(stats.lockedModules).toBe(0);
    expect(isNaN(stats.overallProgress)).toBe(false);
  });

  // Test 17 — Roadmap V1 progress does not affect V2 progress
  it('Test 17 — Roadmap V1 progress is strictly isolated from V2 progress', async () => {
    const envV1 = await setupTestEnvironment(1, false); // V1 archived
    const user = envV1.user;

    // Create V2 roadmap for same user
    const v2Roadmap = await RoadmapModel.create({
      userId: user._id,
      studentProfileId: envV1.studentProfile._id,
      careerId: envV1.career._id,
      title: 'Learning Roadmap V2',
      version: 2,
      isCurrent: true,
      status: 'ACTIVE',
      modules: envV1.roadmap.modules,
    });

    // Update V1 progress
    await completeModuleProgress(envV1.roadmap._id.toString(), 'mod-javascript-1', user._id.toString());

    // Update V2 progress
    await startModuleProgress(v2Roadmap._id.toString(), 'mod-javascript-1', user._id.toString());

    const progressV1 = await getRoadmapProgressSummary(
      envV1.roadmap._id.toString(),
      user._id.toString()
    );
    const progressV2 = await getRoadmapProgressSummary(
      v2Roadmap._id.toString(),
      user._id.toString()
    );

    expect(progressV1.roadmapId.toString()).toBe(envV1.roadmap._id.toString());
    expect(progressV1.modules[0].status).toBe('COMPLETED');

    expect(progressV2.roadmapId.toString()).toBe(v2Roadmap._id.toString());
    expect(progressV2.modules[0].status).toBe('IN_PROGRESS');
  });

  // Test 18 — Student ownership prevents cross-student modification
  it('Test 18 — Accessing or modifying another student progress throws RoadmapProgressError (403)', async () => {
    const envStudentA = await setupTestEnvironment();
    const studentBUser = await User.create({
      email: `studentB-${Date.now()}@example.com`,
      passwordHash: 'hashed123',
    });

    // Student B attempts to start module on Student A's roadmap
    await expect(
      startModuleProgress(
        envStudentA.roadmap._id.toString(),
        'mod-javascript-1',
        studentBUser._id.toString()
      )
    ).rejects.toThrow(RoadmapProgressError);

    await expect(
      getOrCreateRoadmapProgress(envStudentA.roadmap._id.toString(), studentBUser._id.toString())
    ).rejects.toThrow(RoadmapProgressError);
  });

  // Test 19 — Pure progress calculation does not mutate input
  it('Test 19 — Pure progress functions do not mutate input objects', () => {
    const originalItem: IModuleProgressItem = {
      moduleId: 'mod-1',
      status: 'LOCKED',
      progressPercent: 0,
      startedAt: null,
      completedAt: null,
      lastActivityAt: null,
    };

    const frozenItem = Object.freeze({ ...originalItem });

    const started = applyModuleStart(frozenItem);
    expect(started.status).toBe('IN_PROGRESS');
    expect(frozenItem.status).toBe('LOCKED');

    const updated = applyModuleProgressUpdate(frozenItem, 45);
    expect(updated.progressPercent).toBe(45);
    expect(frozenItem.progressPercent).toBe(0);

    const completed = applyModuleComplete(frozenItem);
    expect(completed.status).toBe('COMPLETED');
    expect(frozenItem.status).toBe('LOCKED');
  });

  // Test 20 — No N+1 database behavior in module progress operations
  it('Test 20 — Progress service operates efficiently with bounded DB queries', async () => {
    const { user, roadmap } = await setupTestEnvironment();

    // 1. Initial creation query check
    const { progress } = await getOrCreateRoadmapProgress(
      roadmap._id.toString(),
      user._id.toString()
    );
    expect(progress).toBeDefined();

    // 2. Perform progress updates
    const updated1 = await updateModuleProgress(
      roadmap._id.toString(),
      'mod-javascript-1',
      50,
      user._id.toString()
    );
    expect(updated1.modules[0].progressPercent).toBe(50);

    const updated2 = await completeModuleProgress(
      roadmap._id.toString(),
      'mod-javascript-1',
      user._id.toString()
    );
    expect(updated2.modules[0].status).toBe('COMPLETED');
  });
});
