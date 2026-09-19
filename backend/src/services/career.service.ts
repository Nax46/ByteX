import { CareerModel } from '../models/Career.js';
import { CareerSkillModel } from '../models/CareerSkill.js';
import { ResourceModel } from '../models/Resource.js';
import { ProjectModel } from '../models/Project.js';
import { AssessmentModel } from '../models/Assessment.js';
import { getStudentSkillGapPriority } from './skillGapPriorityReadoutService.js';
import mongoose from 'mongoose';

export class CareerServiceError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'CareerServiceError';
  }
}

/**
 * Service: Retrieves all active careers from MongoDB.
 */
export const getCareersListService = async () => {
  const careers = await CareerModel.find({ isActive: true })
    .select('title slug description category isActive createdAt updatedAt')
    .sort({ category: 1, title: 1 })
    .lean();

  return careers;
};

/**
 * Service: Retrieves detailed career information by ID or slug.
 */
export const getCareerDetailsService = async (careerIdOrSlug: string) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(careerIdOrSlug);
  const career = isObjectId
    ? await CareerModel.findById(careerIdOrSlug).lean()
    : await CareerModel.findOne({ slug: careerIdOrSlug.toLowerCase() }).lean();

  if (!career) {
    throw new CareerServiceError(`Career '${careerIdOrSlug}' not found`, 404);
  }

  // Retrieve associated CareerSkills with populated Skill details and prerequisites
  const careerSkills = await CareerSkillModel.find({ careerId: career._id })
    .populate('skillId', 'name slug category description maxLevel')
    .populate('prerequisites', 'name slug category')
    .lean();

  // Retrieve metrics: counts for resources, projects, and diagnostic assessment
  const skillIds = careerSkills.map((cs) => cs.skillId?._id).filter(Boolean);
  const resourceCount = await ResourceModel.countDocuments({ skillId: { $in: skillIds } });
  const projectCount = await ProjectModel.countDocuments({ careerId: career._id });
  const diagnosticAssessment = await AssessmentModel.findOne({ targetCareerId: career._id, type: 'DIAGNOSTIC' }).select('_id slug title durationMinutes').lean();

  const formattedRequiredSkills = careerSkills.map((cs: any) => ({
    skillId: cs.skillId?._id,
    name: cs.skillId?.name || 'Unknown Skill',
    slug: cs.skillId?.slug || '',
    category: cs.skillId?.category || 'TECHNICAL',
    description: cs.skillId?.description || '',
    requiredLevel: cs.requiredLevel,
    importance: cs.importance,
    weight: cs.weight,
    prerequisites: (cs.prerequisites || []).map((p: any) => ({
      skillId: p._id,
      name: p.name,
      slug: p.slug,
      category: p.category,
    })),
  }));

  return {
    career: {
      id: career._id,
      title: career.title,
      slug: career.slug,
      description: career.description,
      category: career.category,
      isActive: career.isActive,
    },
    requiredSkills: formattedRequiredSkills,
    summaryMetrics: {
      totalRequiredSkills: formattedRequiredSkills.length,
      resourceCount,
      projectCount,
      hasDiagnosticAssessment: Boolean(diagnosticAssessment),
      diagnosticAssessment: diagnosticAssessment
        ? {
            id: diagnosticAssessment._id,
            slug: diagnosticAssessment.slug,
            title: diagnosticAssessment.title,
            durationMinutes: diagnosticAssessment.durationMinutes,
          }
        : null,
    },
  };
};

/**
 * Service: Retrieves required skill mappings for a career by ID or slug.
 */
export const getCareerSkillsService = async (careerIdOrSlug: string) => {
  const details = await getCareerDetailsService(careerIdOrSlug);
  return {
    careerId: details.career.id,
    careerTitle: details.career.title,
    careerSlug: details.career.slug,
    skills: details.requiredSkills,
  };
};

/**
 * Service: Retrieves student's career readiness view combining MongoDB career requirements
 * with student's current Skill Scores and Skill Gap Engine calculations.
 */
export const getStudentCareerReadinessService = async (userId: string, careerIdOrSlug: string) => {
  const details = await getCareerDetailsService(careerIdOrSlug);

  // Get student's current skill gaps and priority snapshots using existing deterministic engine
  let studentSnapshots: any[] = [];
  try {
    studentSnapshots = await getStudentSkillGapPriority(userId);
  } catch {
    // If student has no scores yet, fallback gracefully
    studentSnapshots = [];
  }

  const snapshotMap = new Map<string, any>();
  studentSnapshots.forEach((snap) => {
    snapshotMap.set(snap.skillSlug, snap);
  });

  let metSkillsCount = 0;
  let developingSkillsCount = 0;
  let needsWorkSkillsCount = 0;

  const skillBreakdown = details.requiredSkills.map((reqSkill) => {
    const snap = snapshotMap.get(reqSkill.slug);
    const currentLevel = snap ? snap.currentLevel : 0;
    const requiredLevel = reqSkill.requiredLevel;
    const gap = Math.max(0, requiredLevel - currentLevel);
    const priorityScore = snap ? snap.priorityScore : 0;

    let status: 'MET' | 'DEVELOPING' | 'NEEDS_WORK';
    if (currentLevel >= requiredLevel) {
      status = 'MET';
      metSkillsCount++;
    } else if (currentLevel > 0) {
      status = 'DEVELOPING';
      developingSkillsCount++;
    } else {
      status = 'NEEDS_WORK';
      needsWorkSkillsCount++;
    }

    return {
      skillId: reqSkill.skillId,
      name: reqSkill.name,
      slug: reqSkill.slug,
      category: reqSkill.category,
      currentLevel,
      requiredLevel,
      gap,
      importance: reqSkill.importance,
      priorityScore,
      status,
      prerequisites: reqSkill.prerequisites,
    };
  });

  return {
    career: details.career,
    readinessMetrics: {
      formulaStatus: 'TO BE AGREED', // Specified contract placeholder
      totalRequiredSkills: details.requiredSkills.length,
      metSkillsCount,
      developingSkillsCount,
      needsWorkSkillsCount,
    },
    skillBreakdown,
  };
};
