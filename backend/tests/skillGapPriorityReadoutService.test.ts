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
import {
  getStudentSkillGapPriority,
  ReadoutError,
} from '../src/services/skillGapPriorityReadoutService.js';
import * as engineModule from '../src/services/skillGapPriorityEngine.js';

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
  vi.restoreAllMocks();
});

describe('Skill Gap & Priority Readout Application Service', () => {
  it('Test 1 — Complete student readout (Happy Path)', async () => {
    const user = await User.create({ email: 'student1@example.com', passwordHash: 'hash123' });
    const profile = await StudentProfile.create({
      userId: user._id,
      fullName: 'Alice Student',
      targetCareer: 'Full Stack Developer',
    });

    const jsSkill = await SkillModel.create({ name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' });
    const reactSkill = await SkillModel.create({ name: 'React', slug: 'react', category: 'FRAMEWORK' });
    const career = await CareerModel.create({ title: 'Full Stack Developer', slug: 'full-stack-developer' });

    await CareerSkillModel.create({
      careerId: career._id,
      skillId: jsSkill._id,
      requiredLevel: 85,
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
      title: 'Full Stack Diagnostic',
      slug: 'full-stack-diagnostic',
      type: 'DIAGNOSTIC',
    });

    await AssessmentAttemptModel.create({
      userId: user._id,
      studentProfileId: profile._id,
      assessmentId: assessment._id,
      status: 'COMPLETED',
      completedAt: new Date(),
      skillScores: [
        { skillId: jsSkill._id, score: 60, totalQuestions: 5, correctCount: 3, earnedPoints: 30, maxPoints: 50 },
        { skillId: reactSkill._id, score: 40, totalQuestions: 5, correctCount: 2, earnedPoints: 20, maxPoints: 50 },
      ],
    });

    const snapshots = await getStudentSkillGapPriority(user._id.toString());

    expect(snapshots.length).toBe(2);

    const jsSnap = snapshots.find((s) => s.skillId.toString() === jsSkill._id.toString());
    const reactSnap = snapshots.find((s) => s.skillId.toString() === reactSkill._id.toString());

    expect(jsSnap).toBeDefined();
    expect(jsSnap?.currentLevel).toBe(60);
    expect(jsSnap?.targetLevel).toBe(85);
    expect(jsSnap?.gap).toBe(25);
    expect(jsSnap?.hasEvidence).toBe(true);

    expect(reactSnap).toBeDefined();
    expect(reactSnap?.currentLevel).toBe(40);
    expect(reactSnap?.targetLevel).toBe(80);
    expect(reactSnap?.gap).toBe(40);
    expect(reactSnap?.hasEvidence).toBe(true);
  });

  it('Test 2 — No completed assessment returns NO_EVIDENCE without zeroing', async () => {
    const user = await User.create({ email: 'student2@example.com', passwordHash: 'hash123' });
    await StudentProfile.create({
      userId: user._id,
      fullName: 'Bob Student',
      targetCareer: 'Full Stack Developer',
    });

    const nodeSkill = await SkillModel.create({ name: 'Node.js', slug: 'node-js', category: 'TECHNICAL' });
    const career = await CareerModel.create({ title: 'Full Stack Developer', slug: 'full-stack-developer' });

    await CareerSkillModel.create({
      careerId: career._id,
      skillId: nodeSkill._id,
      requiredLevel: 75,
      importance: 'HIGH',
    });

    const snapshots = await getStudentSkillGapPriority(user._id.toString());

    expect(snapshots.length).toBe(1);
    expect(snapshots[0].hasEvidence).toBe(false);
    expect(snapshots[0].currentLevel).toBeNull();
    expect(snapshots[0].gap).toBe(75);
    expect(snapshots[0].priority.priorityStatus).toBe('NO_EVIDENCE');
  });

  it('Test 3 — Latest completed assessment wins while preserving history', async () => {
    const user = await User.create({ email: 'student3@example.com', passwordHash: 'hash123' });
    const profile = await StudentProfile.create({
      userId: user._id,
      fullName: 'Charlie Student',
      targetCareer: 'Full Stack Developer',
    });

    const jsSkill = await SkillModel.create({ name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' });
    const career = await CareerModel.create({ title: 'Full Stack Developer', slug: 'full-stack-developer' });

    await CareerSkillModel.create({
      careerId: career._id,
      skillId: jsSkill._id,
      requiredLevel: 85,
      importance: 'CRITICAL',
    });

    const assessment = await AssessmentModel.create({
      title: 'Full Stack Diagnostic',
      slug: 'full-stack-diagnostic',
      type: 'DIAGNOSTIC',
    });

    // Older attempt (score 40)
    await AssessmentAttemptModel.create({
      userId: user._id,
      studentProfileId: profile._id,
      assessmentId: assessment._id,
      status: 'COMPLETED',
      completedAt: new Date(Date.now() - 3600 * 1000 * 24),
      skillScores: [{ skillId: jsSkill._id, score: 40, totalQuestions: 5, correctCount: 2, earnedPoints: 20, maxPoints: 50 }],
    });

    // Newer attempt (score 80)
    await AssessmentAttemptModel.create({
      userId: user._id,
      studentProfileId: profile._id,
      assessmentId: assessment._id,
      status: 'COMPLETED',
      completedAt: new Date(),
      skillScores: [{ skillId: jsSkill._id, score: 80, totalQuestions: 5, correctCount: 4, earnedPoints: 40, maxPoints: 50 }],
    });

    const attemptsCount = await AssessmentAttemptModel.countDocuments({ studentProfileId: profile._id });
    expect(attemptsCount).toBe(2);

    const snapshots = await getStudentSkillGapPriority(user._id.toString());
    expect(snapshots[0].currentLevel).toBe(80); // Newer attempt wins
    expect(snapshots[0].gap).toBe(5);
  });

  it('Test 4 — In-progress attempt is ignored', async () => {
    const user = await User.create({ email: 'student4@example.com', passwordHash: 'hash123' });
    const profile = await StudentProfile.create({
      userId: user._id,
      fullName: 'Diana Student',
      targetCareer: 'Full Stack Developer',
    });

    const jsSkill = await SkillModel.create({ name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' });
    const career = await CareerModel.create({ title: 'Full Stack Developer', slug: 'full-stack-developer' });

    await CareerSkillModel.create({
      careerId: career._id,
      skillId: jsSkill._id,
      requiredLevel: 85,
      importance: 'CRITICAL',
    });

    const assessment = await AssessmentModel.create({
      title: 'Full Stack Diagnostic',
      slug: 'full-stack-diagnostic',
      type: 'DIAGNOSTIC',
    });

    // Older COMPLETED attempt (score 50)
    await AssessmentAttemptModel.create({
      userId: user._id,
      studentProfileId: profile._id,
      assessmentId: assessment._id,
      status: 'COMPLETED',
      completedAt: new Date(Date.now() - 3600 * 1000),
      skillScores: [{ skillId: jsSkill._id, score: 50, totalQuestions: 5, correctCount: 2, earnedPoints: 25, maxPoints: 50 }],
    });

    // Newer IN_PROGRESS attempt (score 95)
    await AssessmentAttemptModel.create({
      userId: user._id,
      studentProfileId: profile._id,
      assessmentId: assessment._id,
      status: 'IN_PROGRESS',
      createdAt: new Date(),
      skillScores: [{ skillId: jsSkill._id, score: 95, totalQuestions: 5, correctCount: 5, earnedPoints: 50, maxPoints: 50 }],
    });

    const snapshots = await getStudentSkillGapPriority(user._id.toString());
    expect(snapshots[0].currentLevel).toBe(50); // Completed attempt wins, IN_PROGRESS ignored
  });

  it('Test 5 — Student isolation (User A cannot access User B data)', async () => {
    const userA = await User.create({ email: 'usera@example.com', passwordHash: 'hash123' });
    await StudentProfile.create({ userId: userA._id, fullName: 'Student A', targetCareer: 'Full Stack Developer' });

    const userB = await User.create({ email: 'userb@example.com', passwordHash: 'hash123' });

    await expect(getStudentSkillGapPriority(userB._id.toString())).rejects.toThrow('Student profile not found.');
  });

  it('Test 6 — Missing target career throws domain error', async () => {
    const user = await User.create({ email: 'student6@example.com', passwordHash: 'hash123' });
    await StudentProfile.create({ userId: user._id, fullName: 'Frank Student', targetCareer: '' });

    await expect(getStudentSkillGapPriority(user._id.toString())).rejects.toThrow(ReadoutError);
    await expect(getStudentSkillGapPriority(user._id.toString())).rejects.toThrow(
      'Student target career is not configured. Please complete profile setup.'
    );
  });

  it('Test 7 — Missing skill document is handled gracefully', async () => {
    const user = await User.create({ email: 'student7@example.com', passwordHash: 'hash123' });
    await StudentProfile.create({ userId: user._id, fullName: 'Grace Student', targetCareer: 'Full Stack Developer' });

    const orphanSkillId = new Types.ObjectId();
    const career = await CareerModel.create({ title: 'Full Stack Developer', slug: 'full-stack-developer' });

    await CareerSkillModel.create({
      careerId: career._id,
      skillId: orphanSkillId,
      requiredLevel: 70,
      importance: 'HIGH',
    });

    const snapshots = await getStudentSkillGapPriority(user._id.toString());
    expect(snapshots.length).toBe(1);
    expect(snapshots[0].skillId.toString()).toBe(orphanSkillId.toString());
    expect(snapshots[0].skillName).toBeUndefined();
  });

  it('Test 8 — N+1 query prevention (batched DB queries)', async () => {
    const user = await User.create({ email: 'student8@example.com', passwordHash: 'hash123' });
    await StudentProfile.create({ userId: user._id, fullName: 'Hank Student', targetCareer: 'Full Stack Developer' });

    const jsSkill = await SkillModel.create({ name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' });
    const reactSkill = await SkillModel.create({ name: 'React', slug: 'react', category: 'FRAMEWORK' });
    const career = await CareerModel.create({ title: 'Full Stack Developer', slug: 'full-stack-developer' });

    await CareerSkillModel.create({ careerId: career._id, skillId: jsSkill._id, requiredLevel: 85, importance: 'CRITICAL' });
    await CareerSkillModel.create({ careerId: career._id, skillId: reactSkill._id, requiredLevel: 80, importance: 'HIGH' });

    const careerSkillsSpy = vi.spyOn(CareerSkillModel, 'find');
    const skillsSpy = vi.spyOn(SkillModel, 'find');

    const snapshots = await getStudentSkillGapPriority(user._id.toString());

    expect(careerSkillsSpy).toHaveBeenCalledTimes(1);
    expect(skillsSpy).toHaveBeenCalledTimes(1);
    expect(snapshots.length).toBe(2);
  });

  it('Test 9 — Pure engine delegation', async () => {
    const user = await User.create({ email: 'student9@example.com', passwordHash: 'hash123' });
    await StudentProfile.create({ userId: user._id, fullName: 'Ian Student', targetCareer: 'Full Stack Developer' });

    const jsSkill = await SkillModel.create({ name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL' });
    const career = await CareerModel.create({ title: 'Full Stack Developer', slug: 'full-stack-developer' });

    await CareerSkillModel.create({ careerId: career._id, skillId: jsSkill._id, requiredLevel: 85, importance: 'CRITICAL' });

    const engineSpy = vi.spyOn(engineModule, 'buildSkillGapPrioritySnapshot');

    await getStudentSkillGapPriority(user._id.toString());

    expect(engineSpy).toHaveBeenCalledTimes(1);
  });
});
