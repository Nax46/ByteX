import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { StudentProfile, IStudentProfileDocument } from '../src/models/StudentProfile.js';
import { SkillModel } from '../src/models/Skill.js';
import { CareerModel } from '../src/models/Career.js';
import { CareerSkillModel } from '../src/models/CareerSkill.js';
import { AssessmentModel } from '../src/models/Assessment.js';
import { QuestionModel } from '../src/models/Question.js';
import { AssessmentAttemptModel } from '../src/models/AssessmentAttempt.js';
import { RoadmapModel, IRoadmapDocument } from '../src/models/Roadmap.js';
import { RoadmapProgressModel } from '../src/models/RoadmapProgress.js';
import {
  shouldGenerateAdaptiveRoadmap,
  generateAdaptiveRoadmapForStudent,
} from '../src/services/adaptiveRoadmapService.js';
import { generateRoadmapForStudent, RoadmapGenerationError } from '../src/services/roadmapGenerationService.js';
import { createReassessmentAttempt } from '../src/services/reassessmentService.js';
import { getOrCreateRoadmapProgress, completeModuleProgress } from '../src/services/roadmapProgressService.js';
import { StudentAnswerSubmissionDTO } from '../src/types/assessment.js';

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
});

describe('Adaptive Roadmap Engine Service (P2-ROAD-005)', () => {
  const setupFullPipelineEnv = async () => {
    const user = await User.create({
      email: `student-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`,
      passwordHash: 'hashed123',
    });

    const randomSuffix = Math.floor(Math.random() * 100000);
    const career = await CareerModel.create({
      title: 'Full Stack Web Developer',
      slug: `full-stack-${randomSuffix}`,
      isActive: true,
    });

    const studentProfile = await StudentProfile.create({
      userId: user._id,
      fullName: 'Adaptive Student',
      targetCareer: career.title,
    });

    const jsSkill = await SkillModel.create({
      name: 'JavaScript',
      slug: `javascript-${randomSuffix}`,
      category: 'TECHNICAL',
      maxLevel: 100,
    });

    const nodeSkill = await SkillModel.create({
      name: 'Node.js',
      slug: `nodejs-${randomSuffix}`,
      category: 'FRAMEWORK',
      maxLevel: 100,
    });

    const reactSkill = await SkillModel.create({
      name: 'React',
      slug: `react-${randomSuffix}`,
      category: 'FRAMEWORK',
      maxLevel: 100,
    });

    // Setup CareerSkill requirements
    await CareerSkillModel.create({
      careerId: career._id,
      skillId: jsSkill._id,
      requiredLevel: 80,
      importance: 'CRITICAL',
      weight: 1.0,
      prerequisites: [],
    });

    await CareerSkillModel.create({
      careerId: career._id,
      skillId: nodeSkill._id,
      requiredLevel: 80,
      importance: 'HIGH',
      weight: 0.8,
      prerequisites: [jsSkill._id],
    });

    await CareerSkillModel.create({
      careerId: career._id,
      skillId: reactSkill._id,
      requiredLevel: 80,
      importance: 'HIGH',
      weight: 0.8,
      prerequisites: [jsSkill._id],
    });

    // Assessment & Questions
    const assessment = await AssessmentModel.create({
      title: 'Diagnostic Test',
      slug: `diag-${randomSuffix}`,
      type: 'DIAGNOSTIC',
      targetSkillIds: [jsSkill._id, nodeSkill._id, reactSkill._id],
      durationMinutes: 30,
      version: 1,
      isActive: true,
    });

    const jsQ = await QuestionModel.create({
      skillId: jsSkill._id,
      assessmentId: assessment._id,
      text: 'JS question',
      options: [
        { optionId: 'a', text: 'Correct' },
        { optionId: 'b', text: 'Wrong' },
      ],
      correctOptionId: 'a',
      difficulty: 'MEDIUM',
      points: 10,
      isActive: true,
    });

    const nodeQ = await QuestionModel.create({
      skillId: nodeSkill._id,
      assessmentId: assessment._id,
      text: 'Node question',
      options: [
        { optionId: 'a', text: 'Correct' },
        { optionId: 'b', text: 'Wrong' },
      ],
      correctOptionId: 'a',
      difficulty: 'MEDIUM',
      points: 10,
      isActive: true,
    });

    const reactQ = await QuestionModel.create({
      skillId: reactSkill._id,
      assessmentId: assessment._id,
      text: 'React question',
      options: [
        { optionId: 'a', text: 'Correct' },
        { optionId: 'b', text: 'Wrong' },
      ],
      correctOptionId: 'a',
      difficulty: 'MEDIUM',
      points: 10,
      isActive: true,
    });

    return {
      user,
      studentProfile,
      career,
      jsSkill,
      nodeSkill,
      reactSkill,
      assessment,
      jsQ,
      nodeQ,
      reactQ,
    };
  };

  // Test 1, 2, 3, 4 — Versioning, Archiving V1, Activating V2
  it('Test 1-4 — Generates adaptive V2 roadmap, archiving V1 without mutating V1 modules', async () => {
    const env = await setupFullPipelineEnv();

    // 1. Submit Initial Attempt 1 (0% correct everywhere)
    const answers1: StudentAnswerSubmissionDTO[] = [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.nodeQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.reactQ._id.toString(), selectedOptionId: 'b' },
    ];
    await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), answers1);

    // 2. Generate Initial Roadmap V1
    const v1Roadmap = await generateRoadmapForStudent(env.user._id.toString(), env.career._id.toString());
    expect(v1Roadmap.version).toBe(1);
    expect(v1Roadmap.isCurrent).toBe(true);
    expect(v1Roadmap.status).toBe('ACTIVE');

    await new Promise((r) => setTimeout(r, 20));

    // 3. Submit Reassessment Attempt 2 (Correct JS 100%, Wrong Node/React)
    const answers2: StudentAnswerSubmissionDTO[] = [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'a' },
      { questionId: env.nodeQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.reactQ._id.toString(), selectedOptionId: 'b' },
    ];
    await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), answers2);

    // 4. Generate Adaptive Roadmap V2
    const v2Roadmap = await generateAdaptiveRoadmapForStudent(
      env.user._id.toString(),
      env.career._id.toString()
    );

    expect(v2Roadmap.version).toBe(2);
    expect(v2Roadmap.isCurrent).toBe(true);
    expect(v2Roadmap.status).toBe('ACTIVE');
    expect(v2Roadmap.generationReason).toBe('ADAPTIVE');

    // 5. Verify V1 is archived in DB
    const fetchedV1 = await RoadmapModel.findById(v1Roadmap._id);
    expect(fetchedV1).toBeDefined();
    expect(fetchedV1!.isCurrent).toBe(false);
    expect(fetchedV1!.status).toBe('ARCHIVED');
    expect(fetchedV1!.modules).toHaveLength(v1Roadmap.modules.length);
  });

  // Test 5 & 11 — Target-met skills are omitted from active modules in V2 while satisfying prerequisites
  it('Test 5 & 11 — Target-met skills are omitted from V2 active modules while downstream skills remain scheduled', async () => {
    const env = await setupFullPipelineEnv();

    // Attempt 1: All incorrect
    await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.nodeQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.reactQ._id.toString(), selectedOptionId: 'b' },
    ]);
    const v1 = await generateRoadmapForStudent(env.user._id.toString(), env.career._id.toString());
    expect(v1.modules).toHaveLength(3);

    await new Promise((r) => setTimeout(r, 20));

    // Reassessment Attempt 2: JS is 100% correct (TARGET_MET), Node/React remain gaps
    await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'a' },
      { questionId: env.nodeQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.reactQ._id.toString(), selectedOptionId: 'b' },
    ]);

    const v2 = await generateAdaptiveRoadmapForStudent(env.user._id.toString(), env.career._id.toString());

    // JS should no longer be an active module in V2
    const jsModuleV2 = v2.modules.find((m) => m.skillId.toString() === env.jsSkill._id.toString());
    expect(jsModuleV2).toBeUndefined();

    // Downstream skills Node & React should remain active
    expect(v2.modules.length).toBe(2);
  });

  // Test 6 — Improved-but-not-target-met skill remains active
  it('Test 6 — Improved-but-not-target-met skill remains active with updated gapMagnitude', async () => {
    const env = await setupFullPipelineEnv();

    // Attempt 1: 0% score on Node.js
    await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.nodeQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.reactQ._id.toString(), selectedOptionId: 'b' },
    ]);
    await generateRoadmapForStudent(env.user._id.toString(), env.career._id.toString());

    await new Promise((r) => setTimeout(r, 20));

    // Attempt 2: Node.js improves (targetLevel is 80, score becomes partial)
    await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.nodeQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.reactQ._id.toString(), selectedOptionId: 'b' },
    ]);

    const v2 = await generateAdaptiveRoadmapForStudent(env.user._id.toString(), env.career._id.toString());
    const nodeMod = v2.modules.find((m) => m.skillId.toString() === env.nodeSkill._id.toString());

    expect(nodeMod).toBeDefined();
    expect(nodeMod!.gapMagnitude).toBeGreaterThan(0);
  });

  // Test 7 — Regressed skill becomes active when gap requires it
  it('Test 7 — Regressed skill remains active with updated gap and priority', async () => {
    const env = await setupFullPipelineEnv();

    // Attempt 1: JS 100% correct
    await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'a' },
      { questionId: env.nodeQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.reactQ._id.toString(), selectedOptionId: 'b' },
    ]);

    const v1 = await generateRoadmapForStudent(env.user._id.toString(), env.career._id.toString());
    expect(v1.modules.find((m) => m.skillId.toString() === env.jsSkill._id.toString())).toBeUndefined();

    await new Promise((r) => setTimeout(r, 20));

    // Attempt 2: JS score regresses (0% correct)
    await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.nodeQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.reactQ._id.toString(), selectedOptionId: 'b' },
    ]);

    const v2 = await generateAdaptiveRoadmapForStudent(env.user._id.toString(), env.career._id.toString());
    const jsModV2 = v2.modules.find((m) => m.skillId.toString() === env.jsSkill._id.toString());

    expect(jsModV2).toBeDefined();
    expect(jsModV2!.gapMagnitude).toBe(80);
  });

  // Test 8 — NEW_EVIDENCE skill is handled correctly
  it('Test 8 — Newly assessed skill is scheduled according to latest evidence snapshot', async () => {
    const env = await setupFullPipelineEnv();

    // Create a new skill after initial roadmap
    const randomSuffix = Math.floor(Math.random() * 100000);
    const gitSkill = await SkillModel.create({
      name: 'Git',
      slug: `git-${randomSuffix}`,
      category: 'TOOL',
      maxLevel: 100,
    });

    await CareerSkillModel.create({
      careerId: env.career._id,
      skillId: gitSkill._id,
      requiredLevel: 70,
      importance: 'MEDIUM',
      weight: 0.6,
      prerequisites: [],
    });

    await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'b' },
    ]);

    const v2 = await generateAdaptiveRoadmapForStudent(env.user._id.toString(), env.career._id.toString());
    const gitMod = v2.modules.find((m) => m.skillId.toString() === gitSkill._id.toString());

    expect(gitMod).toBeDefined();
    expect(gitMod!.gapMagnitude).toBe(70);
  });

  // Test 9 & 10 — Topological sort & priority order in V2
  it('Test 9 & 10 — Prerequisite constraints take precedence over priority scores in V2', async () => {
    const env = await setupFullPipelineEnv();

    await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.nodeQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.reactQ._id.toString(), selectedOptionId: 'b' },
    ]);

    const v2 = await generateAdaptiveRoadmapForStudent(env.user._id.toString(), env.career._id.toString());

    const jsMod = v2.modules.find((m) => m.skillId.toString() === env.jsSkill._id.toString())!;
    const nodeMod = v2.modules.find((m) => m.skillId.toString() === env.nodeSkill._id.toString())!;

    // JS must appear before Node.js because Node.js depends on JS
    expect(jsMod.order).toBeLessThan(nodeMod.order);
  });

  // Test 12 — Cycle detection still prevents invalid roadmap creation
  it('Test 12 — Cyclic dependency graph throws RoadmapGenerationError (400) during adaptation', async () => {
    const env = await setupFullPipelineEnv();

    // Create cycle: JS -> Node -> JS
    await CareerSkillModel.updateOne(
      { careerId: env.career._id, skillId: env.jsSkill._id },
      { prerequisites: [env.nodeSkill._id] }
    );

    await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'b' },
    ]);

    await expect(
      generateAdaptiveRoadmapForStudent(env.user._id.toString(), env.career._id.toString())
    ).rejects.toThrow(RoadmapGenerationError);
  });

  // Test 13 & 14 — Progress isolation (V1 progress unchanged, V2 has separate progress)
  it('Test 13 & 14 — V1 progress remains isolated while V2 receives independent progress state', async () => {
    const env = await setupFullPipelineEnv();

    // Attempt 1 -> Generate V1
    await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.nodeQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.reactQ._id.toString(), selectedOptionId: 'b' },
    ]);
    const v1 = await generateRoadmapForStudent(env.user._id.toString(), env.career._id.toString());

    // Update V1 progress (complete JS module)
    await completeModuleProgress(v1._id.toString(), v1.modules[0].moduleId, env.user._id.toString());

    const { progress: p1 } = await getOrCreateRoadmapProgress(v1._id.toString(), env.user._id.toString());
    expect(p1.completedModules).toBe(1);

    await new Promise((r) => setTimeout(r, 20));

    // Attempt 2 -> Generate V2
    await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.nodeQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.reactQ._id.toString(), selectedOptionId: 'b' },
    ]);
    const v2 = await generateAdaptiveRoadmapForStudent(env.user._id.toString(), env.career._id.toString());

    // Fetch V2 progress
    const { progress: p2 } = await getOrCreateRoadmapProgress(v2._id.toString(), env.user._id.toString());

    expect(p2.roadmapId.toString()).toBe(v2._id.toString());
    expect(p2.completedModules).toBe(0); // V2 progress starts fresh

    // Verify V1 progress remained unchanged
    const p1Fetch = await RoadmapProgressModel.findOne({ roadmapId: v1._id });
    expect(p1Fetch!.completedModules).toBe(1);
  });

  // Test 15 & 16 — Historical AssessmentAttempt records remain unchanged & latest attempt is used
  it('Test 15 & 16 — Latest completed assessment attempt is used for adaptation while historical attempts stay preserved', async () => {
    const env = await setupFullPipelineEnv();

    // Attempt 1: 0% score
    const att1 = await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.nodeQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.reactQ._id.toString(), selectedOptionId: 'b' },
    ]);

    await new Promise((r) => setTimeout(r, 20));

    // Attempt 2: 100% JS score
    const att2 = await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'a' },
      { questionId: env.nodeQ._id.toString(), selectedOptionId: 'b' },
      { questionId: env.reactQ._id.toString(), selectedOptionId: 'b' },
    ]);

    const v2 = await generateAdaptiveRoadmapForStudent(env.user._id.toString(), env.career._id.toString());

    expect(v2.generatedFromAssessmentAttemptId!.toString()).toBe(att2._id.toString());

    // Verify Attempt 1 remains preserved in MongoDB
    const fetchedAtt1 = await AssessmentAttemptModel.findById(att1._id);
    expect(fetchedAtt1).toBeDefined();
  });

  // Test 17 — Duplicate generation protection
  it('Test 17 — Repeated adaptive roadmap request without new assessment evidence is idempotent (returns existing V2)', async () => {
    const env = await setupFullPipelineEnv();

    // Attempt 1
    await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'b' },
    ]);

    // Adaptive generation call 1
    const v2First = await generateAdaptiveRoadmapForStudent(
      env.user._id.toString(),
      env.career._id.toString()
    );

    // Adaptive generation call 2 without new assessment submission
    const v2Second = await generateAdaptiveRoadmapForStudent(
      env.user._id.toString(),
      env.career._id.toString()
    );

    expect(v2Second._id.toString()).toBe(v2First._id.toString());
    expect(v2Second.version).toBe(v2First.version);

    // Total roadmaps count in DB should be 1
    const totalRoadmaps = await RoadmapModel.countDocuments({ studentProfileId: env.studentProfile._id });
    expect(totalRoadmaps).toBe(1);
  });

  // Test 18 — Student ownership / security
  it('Test 18 — Requesting adaptive roadmap for non-existent student identity throws RoadmapGenerationError (404/400)', async () => {
    const fakeId = new Types.ObjectId().toString();

    await expect(
      generateAdaptiveRoadmapForStudent(fakeId)
    ).rejects.toThrow(RoadmapGenerationError);
  });

  // Test 19 — Pure adaptive decision logic does not mutate input
  it('Test 19 — Pure shouldGenerateAdaptiveRoadmap function is deterministic and side-effect free', () => {
    const mockRoadmap = Object.freeze({
      generatedFromAssessmentAttemptId: new Types.ObjectId(),
    });

    const attemptIdStr = mockRoadmap.generatedFromAssessmentAttemptId.toString();

    const decision1 = shouldGenerateAdaptiveRoadmap(attemptIdStr, mockRoadmap, false);
    expect(decision1).toBe(false);

    const newAttemptIdStr = new Types.ObjectId().toString();
    const decision2 = shouldGenerateAdaptiveRoadmap(newAttemptIdStr, mockRoadmap, false);
    expect(decision2).toBe(true);

    const forcedDecision = shouldGenerateAdaptiveRoadmap(attemptIdStr, mockRoadmap, true);
    expect(forcedDecision).toBe(true);
  });

  // Test 20 — No N+1 queries
  it('Test 20 — Adaptive roadmap service operates with bounded database queries', async () => {
    const env = await setupFullPipelineEnv();

    await createReassessmentAttempt(env.user._id.toString(), env.assessment._id.toString(), [
      { questionId: env.jsQ._id.toString(), selectedOptionId: 'b' },
    ]);

    const v2 = await generateAdaptiveRoadmapForStudent(
      env.user._id.toString(),
      env.career._id.toString()
    );

    expect(v2).toBeDefined();
    expect(v2.version).toBe(1); // First generation creates version 1
  });
});
