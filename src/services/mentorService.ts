/**
 * Mentor Service
 * --------------
 * Data access layer for the SkillPath Mentor System.
 * Currently uses local demo data + sessionStorage.
 * Future: Replace API calls with real backend endpoints.
 */

import { DEMO_MENTORS } from '@/data/demo.mentors'
import {
  Mentor,
  MentorIntake,
  MentorJourney,
  LearningGoal,
  GOAL_LABELS,
} from '@/types/mentor.types'

const STORAGE_KEYS = {
  INTAKE: 'sp_mentor_intake',
  MATCHES: 'sp_mentor_matches',
  SELECTED: 'sp_mentor_selected',
  JOURNEY: 'sp_mentor_journey',
} as const

// ─── Mentor Data Access ────────────────────────────────────────────────────

export const mentorService = {
  /**
   * Get all available mentors.
   * Future: return await api.get('/mentors')
   */
  getMentors(): Mentor[] {
    return DEMO_MENTORS
  },

  /**
   * Get a single mentor by ID.
   * Future: return await api.get(`/mentors/${id}`)
   */
  getMentorById(id: string): Mentor | undefined {
    return DEMO_MENTORS.find((m) => m.id === id)
  },

  // ─── Intake Persistence ─────────────────────────────────────────────────

  storeMentorIntake(intake: MentorIntake): void {
    try {
      sessionStorage.setItem(STORAGE_KEYS.INTAKE, JSON.stringify(intake))
    } catch {
      // sessionStorage unavailable — fail silently
    }
  },

  getMentorIntake(): MentorIntake | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.INTAKE)
      return raw ? (JSON.parse(raw) as MentorIntake) : null
    } catch {
      return null
    }
  },

  storeMatchedIds(mentorIds: string[]): void {
    try {
      sessionStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(mentorIds))
    } catch {
      // silent
    }
  },

  getMatchedIds(): string[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.MATCHES)
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  },

  storeSelectedMentorId(mentorId: string): void {
    try {
      sessionStorage.setItem(STORAGE_KEYS.SELECTED, mentorId)
    } catch {
      // silent
    }
  },

  getSelectedMentorId(): string | null {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.SELECTED)
    } catch {
      return null
    }
  },

  // ─── Journey Management ──────────────────────────────────────────────────

  /**
   * Activate a mentor journey after successful demo checkout.
   */
  activateJourney(mentor: Mentor, intake: MentorIntake): MentorJourney {
    const journey: MentorJourney = {
      mentorId: mentor.id,
      mentorName: mentor.name,
      goal: intake.goal,
      level: intake.level,
      intake,
      startDate: new Date().toISOString(),
      status: 'active',
      progressPercent: 0,
      currentFocus: mentor.weeklyPlan[0]?.focus ?? 'Getting started',
      nextTask: mentor.weeklyPlan[0]?.activities[0] ?? 'First session with mentor',
      planWeeks: mentor.weeklyPlan.map((w) => ({
        week: w.week,
        focus: w.focus,
        completed: false,
      })),
    }
    try {
      sessionStorage.setItem(STORAGE_KEYS.JOURNEY, JSON.stringify(journey))
    } catch {
      // silent
    }
    return journey
  },

  getMentorJourney(): MentorJourney | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.JOURNEY)
      return raw ? (JSON.parse(raw) as MentorJourney) : null
    } catch {
      return null
    }
  },

  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((k) => sessionStorage.removeItem(k))
    } catch {
      // silent
    }
  },

  // ─── Helpers ─────────────────────────────────────────────────────────────

  formatGoal(goal: LearningGoal): string {
    return GOAL_LABELS[goal] ?? goal
  },

  formatPrice(price: number): string {
    return `₹${price.toLocaleString('en-IN')}/month`
  },
}
