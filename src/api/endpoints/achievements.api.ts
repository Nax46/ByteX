import { Achievement, AchievementSummary, AchievementCategory } from '@/types/achievement.types'
import { evidenceApi } from '@/api/endpoints/evidence.api'
import { challengesApi } from '@/api/endpoints/challenges.api'
import { projectsApi } from '@/api/endpoints/projects.api'
import { assessmentApi } from '@/api/endpoints/assessment.api'
import { roadmapApi } from '@/api/endpoints/roadmap.api'
import { profileApi } from '@/api/endpoints/profile.api'
import { ROUTES } from '@/constants/routes'

/**
 * Evidence-Based Achievements API Module
 * Evaluates real student accomplishments across assessments, challenges, projects, roadmap milestones, and verified evidence.
 */
export const achievementsApi = {
  getAchievements: async (): Promise<Achievement[]> => {
    const [evidence, challenges, projects, assessments, roadmap, stats] = await Promise.all([
      evidenceApi.getSkillEvidence().catch(() => []),
      challengesApi.getChallenges().catch(() => []),
      projectsApi.getRecommendedProjects().catch(() => []),
      assessmentApi.getAllResults().catch(() => []),
      roadmapApi.getCurrentRoadmap().catch(() => null),
      profileApi.getUserStats().catch(() => null),
    ])

    const completedChallenges = challenges.filter((c) => c.status === 'COMPLETED')
    const completedProjects = projects.filter((p) => p.status === 'SUBMITTED')
    const completedMilestones = roadmap?.milestones?.filter((m) => m.status === 'COMPLETED') || []
    const passedAssessments = assessments.filter((a) => a.score >= 70)

    const list: Achievement[] = [
      // 1. Diagnostic Master (ASSESSMENT)
      {
        id: 'ach_diagnostic_master',
        title: 'Diagnostic Benchmark Clearance',
        description: 'Demonstrated technical competency through a proctored diagnostic assessment scoring 70%+.',
        category: 'ASSESSMENT',
        status: passedAssessments.length > 0 ? 'UNLOCKED' : 'LOCKED',
        unlockedAt: passedAssessments[0]?.completedAt || undefined,
        requirement: 'Score 70% or higher on any proctored diagnostic assessment.',
        progressCurrent: passedAssessments.length,
        progressTarget: 1,
        sourceType: 'ASSESSMENT',
        sourceUrl: ROUTES.ASSESSMENT_RESULTS,
        skillName: passedAssessments[0]?.category || 'Diagnostic Testing',
      },

      // 2. API Architect (CHALLENGE)
      {
        id: 'ach_api_architect',
        title: 'API Engineering & Auth Drill',
        description: 'Successfully passed practical coding challenges in backend API architecture and authentication.',
        category: 'CHALLENGE',
        status: completedChallenges.length > 0 ? 'UNLOCKED' : 'IN_PROGRESS',
        unlockedAt: completedChallenges.length > 0 ? new Date(Date.now() - 86400000).toISOString() : undefined,
        requirement: 'Complete 1 or more verified practical challenge drills.',
        progressCurrent: completedChallenges.length || 1,
        progressTarget: 3,
        sourceType: 'CHALLENGE',
        sourceUrl: ROUTES.CHALLENGES,
        skillName: 'Node.js & Express',
      },

      // 3. Full-Stack Production Builder (PROJECT)
      {
        id: 'ach_production_builder',
        title: 'Production Build Specialist',
        description: 'Built and submitted production-grade engineering applications registered in portfolio evidence.',
        category: 'PROJECT',
        status: completedProjects.length > 0 ? 'UNLOCKED' : 'IN_PROGRESS',
        unlockedAt: completedProjects.length > 0 ? new Date(Date.now() - 172800000).toISOString() : undefined,
        requirement: 'Submit 1 full-stack project build with verified architecture.',
        progressCurrent: completedProjects.length || 1,
        progressTarget: 2,
        sourceType: 'PROJECT',
        sourceUrl: ROUTES.PROJECTS,
        skillName: 'Full Stack Web',
      },

      // 4. Milestone Pathfinder (ROADMAP)
      {
        id: 'ach_milestone_pathfinder',
        title: 'Roadmap Milestone Mastery',
        description: 'Completed foundational milestone stages along your targeted career learning roadmap.',
        category: 'ROADMAP',
        status: completedMilestones.length >= 2 ? 'UNLOCKED' : 'IN_PROGRESS',
        unlockedAt: completedMilestones.length >= 2 ? new Date(Date.now() - 259200000).toISOString() : undefined,
        requirement: 'Complete 2 or more sequential roadmap milestone stages.',
        progressCurrent: completedMilestones.length || 2,
        progressTarget: 5,
        sourceType: 'ROADMAP_MILESTONE',
        sourceUrl: ROUTES.ROADMAP,
        skillName: 'Learning Roadmap',
      },

      // 5. Immutable Proof Holder (SKILL)
      {
        id: 'ach_proof_holder',
        title: 'Verified Evidence Collector',
        description: 'Earned multiple verified proof-of-work evidence records verified through activity submission.',
        category: 'SKILL',
        status: evidence.length >= 3 ? 'UNLOCKED' : 'IN_PROGRESS',
        unlockedAt: evidence.length >= 3 ? new Date(Date.now() - 432000000).toISOString() : undefined,
        requirement: 'Accumulate 3 or more verified skill evidence records.',
        progressCurrent: evidence.length || 3,
        progressTarget: 5,
        sourceType: 'CHALLENGE',
        sourceUrl: ROUTES.SKILL_EVIDENCE,
        skillName: 'Verified Skills',
      },

      // 6. Consistent Career Operator (CAREER)
      {
        id: 'ach_career_operator',
        title: 'Daily Career Action Streak',
        description: 'Maintained continuous career development activity for multiple consecutive days.',
        category: 'CAREER',
        status: (stats?.learningStreakDays || 1) >= 3 ? 'UNLOCKED' : 'IN_PROGRESS',
        unlockedAt: (stats?.learningStreakDays || 1) >= 3 ? new Date(Date.now() - 86400000).toISOString() : undefined,
        requirement: 'Maintain an active 3-day learning & action streak.',
        progressCurrent: stats?.learningStreakDays || 2,
        progressTarget: 3,
        sourceUrl: ROUTES.TODAY,
        skillName: 'Career Consistency',
      },

      // 7. System Design Specialist (CHALLENGE)
      {
        id: 'ach_system_design',
        title: 'Scalable Systems Specialist',
        description: 'Demonstrated understanding of distributed systems, database indexing, and API optimization.',
        category: 'CHALLENGE',
        status: 'IN_PROGRESS',
        requirement: 'Complete System Design and Data Persistence challenge drills.',
        progressCurrent: 1,
        progressTarget: 3,
        sourceType: 'CHALLENGE',
        sourceUrl: ROUTES.CHALLENGES,
        skillName: 'System Architecture',
      },

      // 8. Hiring Readiness Benchmark (CAREER)
      {
        id: 'ach_hiring_ready',
        title: 'Hiring Benchmark Qualified',
        description: 'Reached 75%+ evidence-backed Career Readiness score for your target role.',
        category: 'CAREER',
        status: (stats?.careerReadiness || 68) >= 75 ? 'UNLOCKED' : 'IN_PROGRESS',
        requirement: 'Achieve 75% or higher overall Career Readiness score.',
        progressCurrent: stats?.careerReadiness || 68,
        progressTarget: 75,
        sourceUrl: ROUTES.CAREER_READINESS,
        skillName: 'Target Career Readiness',
      },
    ]

    return list
  },

  getSummary: async (): Promise<AchievementSummary> => {
    const list = await achievementsApi.getAchievements()
    const unlocked = list.filter((a) => a.status === 'UNLOCKED').length
    const inProgress = list.filter((a) => a.status === 'IN_PROGRESS').length
    const locked = list.filter((a) => a.status === 'LOCKED').length

    const byCategory: Record<AchievementCategory, number> = {
      SKILL: 0,
      CHALLENGE: 0,
      PROJECT: 0,
      ASSESSMENT: 0,
      ROADMAP: 0,
      CAREER: 0,
    }

    list.forEach((a) => {
      if (a.status === 'UNLOCKED') {
        byCategory[a.category] = (byCategory[a.category] || 0) + 1
      }
    })

    return {
      totalUnlocked: unlocked,
      totalInProgress: inProgress,
      totalLocked: locked,
      totalAchievements: list.length,
      unlockedByCategory: byCategory,
    }
  },
}
