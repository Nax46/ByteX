import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { SkillModel } from '../models/Skill.js';
import { CareerModel } from '../models/Career.js';
import { AssessmentModel } from '../models/Assessment.js';
import { AssessmentAttemptModel } from '../models/AssessmentAttempt.js';
import { generateRoadmapForStudent } from '../services/roadmapGenerationService.js';
import { getOrCreateRoadmapProgress } from '../services/roadmapProgressService.js';

export interface DemoStudentSeedResult {
  userId: string;
  studentProfileId: string;
  attemptId: string;
  roadmapId: string;
}

/**
 * Seeds a deterministic Demo Student Persona ("Alex Student")
 * matching the hackathon walkthrough scenario specified in P2_SEED_DATA_CONTRACT.md.
 *
 * Idempotent & Non-destructive: Safe to run repeatedly.
 */
export const seedDemoStudentData = async (): Promise<DemoStudentSeedResult> => {
  const email = 'demo.student@skillpath.dev';
  const rawPassword = 'DemoStudent12345!';

  // 1. Upsert Demo User
  let user = await User.findOne({ email });
  if (!user) {
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    user = await User.create({
      email,
      passwordHash,
      role: UserRole.STUDENT,
    });
  }

  // 2. Fetch Full Stack Developer Career
  const career = await CareerModel.findOne({ slug: 'full-stack-developer' });
  if (!career) {
    throw new Error('Full Stack Developer career not found. Please run foundation seed first.');
  }

  // 3. Upsert StudentProfile
  const profile = await StudentProfile.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        userId: user._id,
        fullName: 'Alex Student',
        targetCareer: career.title,
        targetCareerId: career._id,
        isOnboardingCompleted: true,
        preferredLearningStyle: 'PRACTICAL',
        weeklyHoursCommitment: 10,
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  // 4. Fetch Diagnostic Assessment
  const assessment = await AssessmentModel.findOne({ type: 'DIAGNOSTIC' });
  if (!assessment) {
    throw new Error('Diagnostic assessment not found. Please run assessment seed first.');
  }

  // 5. Fetch Skill References for realistic diagnostic score evaluation
  const skills = await SkillModel.find().lean();
  const skillMap = new Map<string, any>();
  skills.forEach((s) => skillMap.set(s.slug, s));

  const reactSkill = skillMap.get('react');
  const jsSkill = skillMap.get('javascript');
  const nodeSkill = skillMap.get('node-js');
  const restSkill = skillMap.get('rest-api');
  const mongoSkill = skillMap.get('mongodb');

  const skillScores: any[] = [];
  if (reactSkill) skillScores.push({ skillId: reactSkill._id, score: 80, totalQuestions: 10, correctCount: 8, earnedPoints: 80, maxPoints: 100 });
  if (jsSkill) skillScores.push({ skillId: jsSkill._id, score: 85, totalQuestions: 10, correctCount: 8, earnedPoints: 85, maxPoints: 100 });
  if (nodeSkill) skillScores.push({ skillId: nodeSkill._id, score: 38, totalQuestions: 10, correctCount: 4, earnedPoints: 38, maxPoints: 100 });
  if (restSkill) skillScores.push({ skillId: restSkill._id, score: 30, totalQuestions: 10, correctCount: 3, earnedPoints: 30, maxPoints: 100 });
  if (mongoSkill) skillScores.push({ skillId: mongoSkill._id, score: 20, totalQuestions: 10, correctCount: 2, earnedPoints: 20, maxPoints: 100 });

  // 6. Upsert AssessmentAttempt
  let attempt = await AssessmentAttemptModel.findOne({
    studentProfileId: profile._id,
    assessmentId: assessment._id,
  });

  if (!attempt) {
    attempt = await AssessmentAttemptModel.create({
      userId: user._id,
      studentProfileId: profile._id,
      assessmentId: assessment._id,
      status: 'COMPLETED',
      completedAt: new Date(),
      skillScores,
      totalEarnedPoints: 253,
      totalMaxPoints: 500,
    });
  }

  // 7. Generate or fetch baseline Roadmap V1 for Demo Student
  let roadmap = await generateRoadmapForStudent(profile._id.toString(), career._id.toString());

  // 8. Initialize Roadmap Progress
  await getOrCreateRoadmapProgress(roadmap._id.toString(), profile._id.toString());

  return {
    userId: user._id.toString(),
    studentProfileId: profile._id.toString(),
    attemptId: attempt._id.toString(),
    roadmapId: roadmap._id.toString(),
  };
};
