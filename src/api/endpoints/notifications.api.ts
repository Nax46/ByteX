import { CareerNotification, NotificationSummary, NotificationCategory } from '@/types/notification.types'
import { evidenceApi } from '@/api/endpoints/evidence.api'
import { challengesApi } from '@/api/endpoints/challenges.api'
import { projectsApi } from '@/api/endpoints/projects.api'
import { assessmentApi } from '@/api/endpoints/assessment.api'
import { roadmapApi } from '@/api/endpoints/roadmap.api'
import { profileApi } from '@/api/endpoints/profile.api'
import { squadsApi } from '@/api/endpoints/squads.api'
import { achievementsApi } from '@/api/endpoints/achievements.api'
import { ROUTES } from '@/constants/routes'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

// Local storage key for persistent read state across reloads
const READ_NOTIFICATIONS_KEY = 'bytex_read_notification_ids'

const getReadIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(READ_NOTIFICATIONS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set<string>()
  } catch {
    return new Set<string>()
  }
}

const saveReadIds = (readSet: Set<string>) => {
  try {
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(Array.from(readSet)))
  } catch (e) {
    console.warn('Failed to save read notification state:', e)
  }
}

export const notificationsApi = {
  getNotifications: async (): Promise<CareerNotification[]> => {
    const [profile, evidence, challenges, projects, assessments, roadmap, squads, achievements] = await Promise.all([
      profileApi.getProfile().catch(() => null),
      evidenceApi.getSkillEvidence().catch(() => []),
      challengesApi.getChallenges().catch(() => []),
      projectsApi.getRecommendedProjects().catch(() => []),
      assessmentApi.getAllResults().catch(() => []),
      roadmapApi.getCurrentRoadmap().catch(() => null),
      squadsApi.getSquads().catch(() => []),
      achievementsApi.getAchievements().catch(() => []),
    ])

    const targetRole = profile?.careerGoal || profile?.targetCareer || DEFAULT_CAREER_GOAL
    const readIds = getReadIds()

    const rawList: CareerNotification[] = []

    // 1. Diagnostic Assessment Event
    if (assessments.length > 0) {
      const topAss = assessments[0]
      rawList.push({
        id: `notif_ass_${topAss.id}`,
        title: `Proctored Diagnostic Assessment Completed (${topAss.score}%)`,
        message: `You completed the ${topAss.category} diagnostic assessment scoring ${topAss.correctQuestions}/${topAss.totalQuestions} correct questions.`,
        whyItMatters: `Establishes your baseline competency score and identifies target skill gaps for your ${targetRole} roadmap.`,
        category: 'ASSESSMENT',
        isRead: readIds.has(`notif_ass_${topAss.id}`),
        createdAt: topAss.completedAt || new Date(Date.now() - 3600000).toISOString(),
        priority: 'HIGH',
        actionUrl: ROUTES.ASSESSMENT_RESULTS,
        actionLabel: 'View Diagnostic Analysis',
        relatedSkill: topAss.category,
      })
    }

    // 2. Practical Challenge Event
    const completedChallenge = challenges.find((c) => c.status === 'COMPLETED')
    if (completedChallenge) {
      rawList.push({
        id: `notif_ch_${completedChallenge.id}`,
        title: `Practical Challenge Passed: ${completedChallenge.title}`,
        message: `Your code submission passed syntax & requirement checks for ${completedChallenge.skillTag}.`,
        whyItMatters: `Practical challenge verification directly reduces your ${completedChallenge.skillTag} gap and logs proof of work.`,
        category: 'CHALLENGE',
        isRead: readIds.has(`notif_ch_${completedChallenge.id}`),
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        priority: 'HIGH',
        actionUrl: ROUTES.CHALLENGES,
        actionLabel: 'View Challenge Result',
        relatedSkill: completedChallenge.skillTag,
      })
    }

    // 3. Project Build Submission Event
    const completedProject = projects.find((p) => p.status === 'SUBMITTED' || p.status === 'IN_PROGRESS')
    if (completedProject) {
      rawList.push({
        id: `notif_proj_${completedProject.id}`,
        title: `Production Build Registered: ${completedProject.title}`,
        message: `Your application build was submitted and registered in your engineering portfolio.`,
        whyItMatters: `Building production applications demonstrates architectural mastery required for hiring readiness in ${targetRole}.`,
        category: 'PROJECT',
        isRead: readIds.has(`notif_proj_${completedProject.id}`),
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        priority: 'HIGH',
        actionUrl: ROUTES.PROJECTS,
        actionLabel: 'Open Project Details',
        relatedSkill: completedProject.skillsReinforced[0] || 'Full Stack',
      })
    }

    // 4. Verified Skill Evidence Proof Event
    if (evidence.length > 0) {
      const topEv = evidence[0]
      rawList.push({
        id: `notif_ev_${topEv.id}`,
        title: `Verified Skill Evidence Proof Logged: ${topEv.skillName}`,
        message: `Immutable evidence record added for ${topEv.title} under verified passport protocol.`,
        whyItMatters: `Verified evidence proofs serve as employer-ready proof points in your shareable Career Passport.`,
        category: 'EVIDENCE',
        isRead: readIds.has(`notif_ev_${topEv.id}`),
        createdAt: new Date(Date.now() - 28800000).toISOString(),
        priority: 'MEDIUM',
        actionUrl: ROUTES.SKILL_EVIDENCE,
        actionLabel: 'View Skill Evidence Log',
        relatedSkill: topEv.skillName,
      })
    }

    // 5. Active Roadmap Milestone Event
    const activeMilestone = roadmap?.milestones?.find((m) => m.status === 'IN_PROGRESS')
    if (activeMilestone) {
      rawList.push({
        id: `notif_road_${activeMilestone.id}`,
        title: `Active Mission Stage: ${activeMilestone.title}`,
        message: `Stage ${activeMilestone.order || 3} is active in your ${targetRole} learning roadmap.`,
        whyItMatters: `Completing the required project tasks and drills in this stage advances your overall career progress.`,
        category: 'ROADMAP',
        isRead: readIds.has(`notif_road_${activeMilestone.id}`),
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        priority: 'MEDIUM',
        actionUrl: ROUTES.ROADMAP,
        actionLabel: 'Open Interactive Roadmap',
        relatedSkill: activeMilestone.skillsCovered[0] || 'Roadmap Stage',
      })
    }

    // 6. Achievement Unlocked Event
    const unlockedAch = achievements.find((a) => a.status === 'UNLOCKED')
    if (unlockedAch) {
      rawList.push({
        id: `notif_ach_${unlockedAch.id}`,
        title: `Milestone Achievement Unlocked: ${unlockedAch.title}`,
        message: unlockedAch.description,
        whyItMatters: unlockedAch.requirement,
        category: 'ACHIEVEMENTS',
        isRead: readIds.has(`notif_ach_${unlockedAch.id}`),
        createdAt: new Date(Date.now() - 57600000).toISOString(),
        priority: 'MEDIUM',
        actionUrl: ROUTES.ACHIEVEMENTS,
        actionLabel: 'View Unlocked Achievement',
        relatedSkill: unlockedAch.skillName,
      })
    }

    // 7. Squad Collaboration Event
    const activeSquad = squads.find((s) => s.isUserMember)
    if (activeSquad) {
      rawList.push({
        id: `notif_squad_${activeSquad.id}`,
        title: `Squad Workspace Active: ${activeSquad.name}`,
        message: `You are assigned as ${activeSquad.userRoleLabel} for the ${activeSquad.projectName} build.`,
        whyItMatters: `Team project collaboration builds role-specific experience and team evidence for recruiters.`,
        category: 'COLLABORATION',
        isRead: readIds.has(`notif_squad_${activeSquad.id}`),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        priority: 'MEDIUM',
        actionUrl: ROUTES.SQUADS,
        actionLabel: 'Open Squad Workspace',
        relatedSkill: 'Team Collaboration',
      })
    }

    // 8. Daily Career Action Reminder Event
    rawList.push({
      id: 'notif_today_action',
      title: `Today's Career Action Ready`,
      message: `Your single high-priority daily task has been calculated from your top career bottlenecks.`,
      whyItMatters: `Executing one focused action daily is the fastest way to eliminate skill gaps and reach career readiness.`,
      category: 'CAREER',
      isRead: readIds.has('notif_today_action'),
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      priority: 'HIGH',
      actionUrl: ROUTES.TODAY,
      actionLabel: "Execute Today's Action",
      relatedSkill: 'Daily Focus',
    })

    // Sort newest first
    rawList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return rawList
  },

  markAsRead: async (notificationId: string): Promise<{ success: boolean; notificationId: string }> => {
    const readIds = getReadIds()
    readIds.add(notificationId)
    saveReadIds(readIds)
    return { success: true, notificationId }
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const list = await notificationsApi.getNotifications()
    const readIds = getReadIds()
    list.forEach((n) => readIds.add(n.id))
    saveReadIds(readIds)
    return { success: true }
  },

  getSummary: async (): Promise<NotificationSummary> => {
    const list = await notificationsApi.getNotifications()
    const unread = list.filter((n) => !n.isRead).length
    const byCategory: Record<NotificationCategory, number> = {
      CAREER: 0,
      ASSESSMENT: 0,
      CHALLENGE: 0,
      PROJECT: 0,
      EVIDENCE: 0,
      ROADMAP: 0,
      ACHIEVEMENTS: 0,
      COLLABORATION: 0,
    }

    list.forEach((n) => {
      byCategory[n.category] = (byCategory[n.category] || 0) + 1
    })

    return {
      unreadCount: unread,
      totalCount: list.length,
      categoryCounts: byCategory,
    }
  },
}
