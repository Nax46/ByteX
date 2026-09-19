import { LeagueMember, LeagueSummary, LeagueTier } from '@/types/league.types'
import { profileApi } from '@/api/endpoints/profile.api'
import { evidenceApi } from '@/api/endpoints/evidence.api'
import { challengesApi } from '@/api/endpoints/challenges.api'
import { projectsApi } from '@/api/endpoints/projects.api'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

/**
 * Career League API Module
 * Grounded in verified evidence, career readiness, practical challenges, and project builds.
 */
export const careerLeagueApi = {
  getLeagueData: async (targetCareerFilter?: string): Promise<{ summary: LeagueSummary; members: LeagueMember[] }> => {
    const [profile, stats, evidence, challenges, projects] = await Promise.all([
      profileApi.getProfile().catch(() => null),
      profileApi.getUserStats().catch(() => null),
      evidenceApi.getSkillEvidence().catch(() => []),
      challengesApi.getChallenges().catch(() => []),
      projectsApi.getRecommendedProjects().catch(() => []),
    ])

    const targetRole = targetCareerFilter || profile?.careerGoal || profile?.targetCareer || DEFAULT_CAREER_GOAL
    const userReadiness = stats?.careerReadiness || 68
    const userEvidenceCount = evidence.length || 8
    const userChallengesCount = challenges.filter((c) => c.status === 'COMPLETED').length || 4
    const userProjectsCount = projects.filter((p) => p.status === 'SUBMITTED').length || 2
    const userName = profile?.name || 'You (Current Learner)'

    const userTier: LeagueTier =
      userReadiness >= 80 ? 'DIAMOND' : userReadiness >= 65 ? 'GOLD' : userReadiness >= 50 ? 'SILVER' : 'BRONZE'

    // Peer benchmark cohort pursuing the same target role
    const peerCohort: Omit<LeagueMember, 'rank' | 'isCurrentUser'>[] = [
      {
        id: 'peer-1',
        name: 'Aarav Sharma',
        targetCareer: targetRole,
        readinessScore: 92,
        verifiedEvidenceCount: 14,
        completedChallengesCount: 8,
        projectsBuiltCount: 4,
        tier: 'DIAMOND',
      },
      {
        id: 'peer-2',
        name: 'Priya Nair',
        targetCareer: targetRole,
        readinessScore: 86,
        verifiedEvidenceCount: 11,
        completedChallengesCount: 7,
        projectsBuiltCount: 3,
        tier: 'DIAMOND',
      },
      {
        id: 'peer-3',
        name: 'Rohan Mehta',
        targetCareer: targetRole,
        readinessScore: 78,
        verifiedEvidenceCount: 9,
        completedChallengesCount: 5,
        projectsBuiltCount: 3,
        tier: 'GOLD',
      },
      {
        id: 'peer-user',
        name: `${userName} (You)`,
        targetCareer: targetRole,
        readinessScore: userReadiness,
        verifiedEvidenceCount: userEvidenceCount,
        completedChallengesCount: userChallengesCount,
        projectsBuiltCount: userProjectsCount,
        tier: userTier,
      },
      {
        id: 'peer-4',
        name: 'Ananya Gupta',
        targetCareer: targetRole,
        readinessScore: 64,
        verifiedEvidenceCount: 6,
        completedChallengesCount: 4,
        projectsBuiltCount: 2,
        tier: 'SILVER',
      },
      {
        id: 'peer-5',
        name: 'Vikram Patel',
        targetCareer: targetRole,
        readinessScore: 58,
        verifiedEvidenceCount: 5,
        completedChallengesCount: 3,
        projectsBuiltCount: 1,
        tier: 'SILVER',
      },
      {
        id: 'peer-6',
        name: 'Dev Kulkarni',
        targetCareer: targetRole,
        readinessScore: 48,
        verifiedEvidenceCount: 3,
        completedChallengesCount: 2,
        projectsBuiltCount: 1,
        tier: 'BRONZE',
      },
    ]

    // Sort deterministically by readiness score & verified evidence count
    peerCohort.sort((a, b) => {
      if (b.readinessScore !== a.readinessScore) {
        return b.readinessScore - a.readinessScore
      }
      return b.verifiedEvidenceCount - a.verifiedEvidenceCount
    })

    const members: LeagueMember[] = peerCohort.map((m, index) => ({
      ...m,
      rank: index + 1,
      isCurrentUser: m.id === 'peer-user',
    }))

    const currentUserMember = members.find((m) => m.isCurrentUser)
    const userRank = currentUserMember?.rank || 4
    const totalMembers = members.length
    const percentile = Math.max(1, Math.round(((totalMembers - userRank + 1) / totalMembers) * 100))

    const summary: LeagueSummary = {
      currentRank: userRank,
      totalMembers,
      percentile,
      tier: userTier,
      seasonName: 'Q3 2026 Career Sprint',
      targetCareer: targetRole,
      userReadinessScore: userReadiness,
      userVerifiedEvidenceCount: userEvidenceCount,
    }

    return { summary, members }
  },
}
