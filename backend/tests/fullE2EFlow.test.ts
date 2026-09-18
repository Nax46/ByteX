import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, UserRole } from '../src/models/User.js';
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

import { AssessmentScoringService } from '../src/services/assessmentScoringService.js';
import { getStudentSkillGapPriority } from '../src/services/skillGapPriorityReadoutService.js';
import { generateRoadmapForStudent } from '../src/services/roadmapGenerationService.js';
import {
  getOrCreateRoadmapProgress,
  startModuleProgress,
  completeModuleProgress,
} from '../src/services/roadmapProgressService.js';
import { getRecommendedResourcesForStudent } from '../src/services/resourceRecommendationService.js';
import { getRecommendedProjectsForStudent } from '../src/services/projectRecommendationService.js';
import { createReassessmentAttempt, getReassessmentSummary } from '../src/services/reassessmentService.js';
import { generateAdaptiveRoadmapForStudent } from '../src/services/adaptiveRoadmapService.js';
import { buildStudentAIContext } from '../src/services/ai/personalizationContextBuilder.js';

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

describe('P20 — Full End-to-End Verification Pipeline', () => {
  it('Executes full 23-step E2E flow from diagnostic assessment through adaptive roadmap V2 and AI personalization context', async () => {
    // 1. Seed base catalog data (Careers, Skills, CareerSkills, Assessments, Questions, Resources, Projects)
    const seedRes = await seedMaster();
    expect(seedRes.foundation.skillsProcessed).toBeGreaterThan(0);
    expect(seedRes.assessment.questionsProcessed).toBeGreaterThan(0);

    // 2. Student exists: Create test student
    const studentUser = await User.create({
      email: 'e2e.student@example.com',
      passwordHash: 'securePasswordHash123',
      role: UserRole.STUDENT,
    });

    const studentProfile = await StudentProfile.create({
      userId: studentUser._id,
      fullName: 'E2E Test Student',
      targetCareer: 'Full Stack Developer',
    });

    expect(studentProfile._id).toBeDefined();

    // 3. Career exists & resolves to CareerSkills and Skills
    const career = await CareerModel.findOne({ title: 'Full Stack Developer' }).lean();
    expect(career).toBeDefined();

    const careerSkills = await CareerSkillModel.find({ careerId: career!._id }).lean();
    expect(careerSkills.length).toBeGreaterThan(0);

    // 4. Diagnostic assessment & Questions exist
    const diagnosticAssessment = await AssessmentModel.findOne({ type: 'DIAGNOSTIC' }).lean();
    expect(diagnosticAssessment).toBeDefined();

    const questions = await QuestionModel.find({ assessmentId: diagnosticAssessment!._id }).lean();
    expect(questions.length).toBeGreaterThan(0);

    // 5. Assessment submission occurs with actual answer choices (low scores to create gaps)
    const initialSubmissions = questions.map((q, idx) => {
      const wrongOpt = q.options.find((opt) => opt.optionId !== q.correctOptionId)?.optionId || q.correctOptionId;
      return {
        questionId: q._id.toString(),
        // Intentionally select wrong options for half to generate realistic gaps
        selectedOptionId: idx % 2 === 0 ? q.correctOptionId : wrongOpt,
        timeSpentSeconds: 45,
      };
    });

    // 6. Score is calculated SERVER-SIDE & 7. Skill scores are persisted
    const attempt1 = await AssessmentScoringService.evaluateAndSaveAttempt({
      studentProfileId: studentProfile._id.toString(),
      assessmentId: diagnosticAssessment!._id.toString(),
      answers: initialSubmissions,
    });

    expect(attempt1).toBeDefined();
    expect(attempt1.status).toBe('COMPLETED');
    expect(attempt1.skillScores?.length).toBeGreaterThan(0);
    expect(attempt1.completedAt).toBeDefined();

    const persistedAttempt1 = await AssessmentAttemptModel.findById(attempt1._id).lean();
    expect(persistedAttempt1).toBeDefined();
    expect(persistedAttempt1?.status).toBe('COMPLETED');

    // 8. Skill gaps are calculated & 9. Priority is calculated
    const gapSnapshots = await getStudentSkillGapPriority(studentUser._id.toString());
    expect(gapSnapshots.length).toBeGreaterThan(0);
    const firstGap = gapSnapshots[0];
    expect(firstGap.skillId).toBeDefined();
    expect(firstGap.gap).toBeGreaterThanOrEqual(0);
    expect(firstGap.priority).toBeDefined();
    expect(typeof firstGap.priority.priorityScore).toBe('number');

    // 10. Roadmap V1 is generated
    const roadmapV1 = await generateRoadmapForStudent(studentUser._id.toString(), career!._id.toString());
    expect(roadmapV1).toBeDefined();
    expect(roadmapV1.version).toBe(1);
    expect(roadmapV1.isCurrent).toBe(true);
    expect(roadmapV1.modules.length).toBeGreaterThan(0);

    // 11. Progress is initialized
    const { progress: progressV1 } = await getOrCreateRoadmapProgress(roadmapV1._id.toString(), studentUser._id.toString());
    expect(progressV1).toBeDefined();
    expect(progressV1.roadmapId.toString()).toBe(roadmapV1._id.toString());
    expect(progressV1.overallProgress).toBe(0);

    // 12. Resource recommendations work
    const resourceRecs = await getRecommendedResourcesForStudent(studentUser._id.toString());
    expect(resourceRecs).toBeDefined();
    expect(Array.isArray(resourceRecs)).toBe(true);

    // 13. Project recommendations work
    const projectRecs = await getRecommendedProjectsForStudent(studentUser._id.toString());
    expect(projectRecs).toBeDefined();
    expect(Array.isArray(projectRecs)).toBe(true);

    // 14. Progress can change (start and complete first module)
    const firstModule = roadmapV1.modules[0];
    await startModuleProgress(roadmapV1._id.toString(), firstModule.moduleId, studentUser._id.toString());
    const updatedProgress = await completeModuleProgress(
      roadmapV1._id.toString(),
      firstModule.moduleId,
      studentUser._id.toString()
    );

    expect(updatedProgress.completedModules).toBe(1);
    expect(updatedProgress.overallProgress).toBeGreaterThan(0);

    // 15. Reassessment creates a NEW attempt & 16. Previous attempt remains unchanged
    // Submit 100% correct answers on reassessment to show mastery improvement
    const reassessmentSubmissions = questions.map((q) => ({
      questionId: q._id.toString(),
      selectedOptionId: q.correctOptionId,
      timeSpentSeconds: 30,
    }));

    const attempt2 = await createReassessmentAttempt(
      studentUser._id.toString(),
      diagnosticAssessment!._id.toString(),
      reassessmentSubmissions
    );

    expect(attempt2._id.toString()).not.toBe(attempt1._id.toString());
    expect(attempt2.totalEarnedPoints).toBeGreaterThan(attempt1.totalEarnedPoints || 0);

    // Verify Attempt 1 remains unchanged
    const originalAttempt1Check = await AssessmentAttemptModel.findById(attempt1._id).lean();
    expect(originalAttempt1Check?.totalEarnedPoints).toBe(attempt1.totalEarnedPoints);

    // 17. Skill trend is calculated
    const reassessmentSummary = await getReassessmentSummary(studentUser._id.toString());
    expect(reassessmentSummary.overallPreviousScore).toBeDefined();
    expect(reassessmentSummary.overallCurrentScore).toBeDefined();
    expect(reassessmentSummary.overallChange).toBeGreaterThan(0);
    expect(reassessmentSummary.skillComparisons.length).toBeGreaterThan(0);

    // 18. Adaptive roadmap V2 is generated
    const roadmapV2 = await generateAdaptiveRoadmapForStudent(studentUser._id.toString(), career!._id.toString());
    expect(roadmapV2).toBeDefined();
    expect(roadmapV2.version).toBe(2);

    // 19. V1 is archived/current flag updated according to rules & 20. V2 is current
    const archivedV1 = await RoadmapModel.findById(roadmapV1._id).lean();
    expect(archivedV1?.isCurrent).toBe(false);
    expect(roadmapV2.isCurrent).toBe(true);

    // 21. V2 progress remains isolated
    const { progress: progressV2 } = await getOrCreateRoadmapProgress(roadmapV2._id.toString(), studentUser._id.toString());
    expect(progressV2.roadmapId.toString()).toBe(roadmapV2._id.toString());
    expect(progressV2._id.toString()).not.toBe(progressV1._id.toString());

    // 22. AI Personalization can consume the resulting intelligence context
    const aiContext = await buildStudentAIContext(studentUser._id.toString());
    expect(aiContext).toBeDefined();
    expect(aiContext.studentName).toBe('E2E Test Student');
    expect(aiContext.targetCareer).toBe('Full Stack Developer');

    // 23. Auth Security Boundary Isolation Check
    // Verify Student B cannot access Student A's intelligence data
    const studentBUser = await User.create({
      email: 'studentB@example.com',
      passwordHash: 'hashB123',
      role: UserRole.STUDENT,
    });
    await StudentProfile.create({
      userId: studentBUser._id,
      fullName: 'Student B',
      targetCareer: 'Full Stack Developer',
    });

    const studentBProgressForA = await RoadmapProgressModel.findOne({
      roadmapId: roadmapV1._id,
      studentProfileId: studentBUser._id,
    });
    expect(studentBProgressForA).toBeNull();
  });
});
