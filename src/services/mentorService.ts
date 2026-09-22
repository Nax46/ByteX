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
  MentorPaymentRecord,
  PaymentMethod,
} from '@/types/mentor.types'
import { safeStorage } from '@/utils/storage'
import { storageService } from '@/services/storage.service'

const STORAGE_KEYS = {
  INTAKE: 'sp_mentor_intake',
  MATCHES: 'sp_mentor_matches',
  SELECTED: 'sp_mentor_selected',
  JOURNEY: 'sp_mentor_journey',
  PAYMENT: 'sp_mentor_payment',
} as const

// ─── Mentor Data Access & Payment Layer ─────────────────────────────────────

export const mentorService = {
  /**
   * Helper to retrieve currently authenticated student's user ID.
   */
  getCurrentUserId(): string {
    const user = storageService.getUser()
    return user?.id ? String(user.id) : 'demo_student'
  },

  /**
   * Helper to retrieve currently authenticated student's user profile.
   */
  getCurrentUser() {
    return storageService.getUser()
  },

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
      safeStorage.setItem(STORAGE_KEYS.INTAKE, intake)
    } catch {
      // safeStorage handles errors internally
    }
  },

  getMentorIntake(): MentorIntake | null {
    try {
      const fromSession = sessionStorage.getItem(STORAGE_KEYS.INTAKE)
      if (fromSession) return JSON.parse(fromSession) as MentorIntake
    } catch {
      // fallback
    }
    return safeStorage.getItem<MentorIntake>(STORAGE_KEYS.INTAKE, null)
  },

  storeMatchedIds(mentorIds: string[]): void {
    try {
      sessionStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(mentorIds))
      safeStorage.setItem(STORAGE_KEYS.MATCHES, mentorIds)
    } catch {
      // silent
    }
  },

  getMatchedIds(): string[] {
    try {
      const fromSession = sessionStorage.getItem(STORAGE_KEYS.MATCHES)
      if (fromSession) return JSON.parse(fromSession) as string[]
    } catch {
      // fallback
    }
    return safeStorage.getItem<string[]>(STORAGE_KEYS.MATCHES, []) ?? []
  },

  storeSelectedMentorId(mentorId: string): void {
    try {
      sessionStorage.setItem(STORAGE_KEYS.SELECTED, mentorId)
      safeStorage.setItem(STORAGE_KEYS.SELECTED, mentorId)
    } catch {
      // silent
    }
  },

  getSelectedMentorId(): string | null {
    try {
      const fromSession = sessionStorage.getItem(STORAGE_KEYS.SELECTED)
      if (fromSession) return fromSession
    } catch {
      // fallback
    }
    return safeStorage.getItem<string>(STORAGE_KEYS.SELECTED, null)
  },

  // ─── Payment State & Management ──────────────────────────────────────────

  /**
   * Generate an honest, formatted demo payment ID (DEMO-SP-XXXXXX).
   */
  generateDemoPaymentId(): string {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000)
    return `DEMO-SP-${randomSuffix}`
  },

  /**
   * Retrieve payment record for the active student.
   */
  getPaymentRecord(userId?: string): MentorPaymentRecord | null {
    const uid = userId || this.getCurrentUserId()
    const userSpecificKey = `${STORAGE_KEYS.PAYMENT}_${uid}`
    
    // Check user-scoped persistent storage first
    const record = safeStorage.getItem<MentorPaymentRecord>(userSpecificKey, null)
    if (record) return record

    // Check general fallback
    return safeStorage.getItem<MentorPaymentRecord>(STORAGE_KEYS.PAYMENT, null)
  },

  /**
   * Store payment record scoped to the active student.
   */
  savePaymentRecord(record: MentorPaymentRecord): void {
    const userSpecificKey = `${STORAGE_KEYS.PAYMENT}_${record.studentId}`
    safeStorage.setItem(userSpecificKey, record)
    safeStorage.setItem(STORAGE_KEYS.PAYMENT, record)

    try {
      sessionStorage.setItem(STORAGE_KEYS.PAYMENT, JSON.stringify(record))
    } catch {
      // silent
    }
  },

  /**
   * Check whether the active student has completed payment and activated mentorship.
   * Protected against URL bypass — requires actual payment record with demo_success & active status.
   */
  isJourneyActive(userId?: string): boolean {
    const record = this.getPaymentRecord(userId)
    if (!record) return false
    return record.paymentStatus === 'demo_success' && record.mentorshipStatus === 'active'
  },

  /**
   * Initiate a pending payment record.
   */
  initiatePayment(
    mentor: Mentor,
    intake?: MentorIntake | null,
    paymentMethod: PaymentMethod = 'upi',
    upiApp?: string,
    upiId?: string
  ): MentorPaymentRecord {
    const user = this.getCurrentUser()
    const studentId = this.getCurrentUserId()
    if (intake) {
      this.storeMentorIntake(intake)
    }

    const record: MentorPaymentRecord = {
      paymentId: this.generateDemoPaymentId(),
      studentId,
      studentName: user?.name || 'Student',
      studentEmail: user?.email || 'student@skillpath.edu',
      mentorId: mentor.id,
      mentorName: mentor.name,
      planName: `${mentor.expertise[0] || 'SkillPath'} Career Mentorship`,
      duration: '1 Month (4 weeks)',
      amount: mentor.priceMonthly,
      paymentMethod,
      upiApp,
      upiId,
      paymentStatus: 'pending',
      mentorshipStatus: 'payment_pending',
      createdAt: new Date().toISOString(),
      isDemo: true,
    }

    this.savePaymentRecord(record)
    return record
  },

  /**
   * Complete simulated demo payment, activate mentorship and initialize journey.
   */
  completeDemoPayment(
    mentor: Mentor,
    intake: MentorIntake,
    paymentMethod: PaymentMethod = 'upi',
    upiApp?: string,
    upiId?: string
  ): { payment: MentorPaymentRecord; journey: MentorJourney } {
    const user = this.getCurrentUser()
    const studentId = this.getCurrentUserId()

    const paymentRecord: MentorPaymentRecord = {
      paymentId: this.generateDemoPaymentId(),
      studentId,
      studentName: user?.name || 'Student',
      studentEmail: user?.email || 'student@skillpath.edu',
      mentorId: mentor.id,
      mentorName: mentor.name,
      planName: `${mentor.expertise[0] || 'SkillPath'} Career Mentorship`,
      duration: '1 Month (4 weeks)',
      amount: mentor.priceMonthly,
      paymentMethod,
      upiApp,
      upiId,
      paymentStatus: 'demo_success',
      mentorshipStatus: 'active',
      createdAt: new Date().toISOString(),
      isDemo: true,
    }

    this.savePaymentRecord(paymentRecord)
    const journey = this.activateJourney(mentor, intake)

    return { payment: paymentRecord, journey }
  },

  /**
   * Record payment cancellation.
   */
  cancelPayment(mentorId?: string): MentorPaymentRecord | null {
    const existing = this.getPaymentRecord()
    if (!existing) return null

    const updated: MentorPaymentRecord = {
      ...existing,
      mentorId: mentorId || existing.mentorId,
      paymentStatus: 'cancelled',
      mentorshipStatus: 'payment_pending',
    }

    this.savePaymentRecord(updated)
    return updated
  },

  // ─── Journey Management ──────────────────────────────────────────────────

  /**
   * Activate a mentor journey after successful demo checkout.
   */
  activateJourney(mentor: Mentor, intake: MentorIntake): MentorJourney {
    const studentId = this.getCurrentUserId()
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

    // Persist scoped to user in safeStorage (localStorage) and sessionStorage
    const userJourneyKey = `${STORAGE_KEYS.JOURNEY}_${studentId}`
    safeStorage.setItem(userJourneyKey, journey)
    safeStorage.setItem(STORAGE_KEYS.JOURNEY, journey)

    try {
      sessionStorage.setItem(STORAGE_KEYS.JOURNEY, JSON.stringify(journey))
    } catch {
      // silent
    }

    return journey
  },

  /**
   * Retrieve active mentor journey.
   * Access is protected — returns null if student has not completed payment.
   */
  getMentorJourney(userId?: string): MentorJourney | null {
    const uid = userId || this.getCurrentUserId()

    // Gate: mentorship must be active
    if (!this.isJourneyActive(uid)) {
      return null
    }

    const userJourneyKey = `${STORAGE_KEYS.JOURNEY}_${uid}`
    const fromSafe = safeStorage.getItem<MentorJourney>(userJourneyKey, null)
    if (fromSafe) return fromSafe

    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.JOURNEY)
      if (raw) return JSON.parse(raw) as MentorJourney
    } catch {
      // fallback
    }

    return safeStorage.getItem<MentorJourney>(STORAGE_KEYS.JOURNEY, null)
  },

  /**
   * Clear all mentor state for testing or fresh demo flows.
   */
  clearAll(): void {
    const uid = this.getCurrentUserId()
    try {
      Object.values(STORAGE_KEYS).forEach((k) => {
        sessionStorage.removeItem(k)
        safeStorage.removeItem(k)
        safeStorage.removeItem(`${k}_${uid}`)
      })
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

