import { apiClient } from '@/api/client'
import {
  PersonalizedSummaryResponse,
  SkillExplanationResponse,
  AISkillExplanation,
  MentorQueryResponse,
  AIMentorResponse,
  CareerTrackRecommendation,
} from '@/types/ai.types'
import { skillsApi } from './skills.api'

/**
 * AI Personalization & Career Recommendation API Module
 * -----------------------------------------------------
 * Integrates directly with Person 2's backend intelligence routes:
 * - GET  /api/v1/intelligence/ai/personalized-summary
 * - GET  /api/v1/intelligence/ai/explain-skill/:skillSlug
 * - POST /api/v1/intelligence/ai/mentor-ask
 */
export const aiApi = {
  /**
   * Fetches personalized AI summary and intelligence context for the authenticated student.
   * Endpoint: GET /api/v1/intelligence/ai/personalized-summary
   */
  getPersonalizedSummary: async (): Promise<PersonalizedSummaryResponse> => {
    try {
      const res = await apiClient.get<PersonalizedSummaryResponse>(
        '/v1/intelligence/ai/personalized-summary'
      )
      return res.data
    } catch {
      // Fallback path without /v1/ prefix
      const res = await apiClient.get<PersonalizedSummaryResponse>(
        '/intelligence/ai/personalized-summary'
      )
      return res.data
    }
  },

  /**
   * Fetches AI-generated skill gap explanation and action plan for a specific skill.
   * Endpoint: GET /api/v1/intelligence/ai/explain-skill/:skillSlug
   */
  getSkillExplanation: async (skillSlug: string): Promise<AISkillExplanation> => {
    const cleanSlug = encodeURIComponent(skillSlug.trim().toLowerCase())
    try {
      const res = await apiClient.get<SkillExplanationResponse>(
        `/v1/intelligence/ai/explain-skill/${cleanSlug}`
      )
      return res.data.explanation
    } catch {
      const res = await apiClient.get<SkillExplanationResponse>(
        `/intelligence/ai/explain-skill/${cleanSlug}`
      )
      return res.data.explanation
    }
  },

  /**
   * Submits a query to the AI Career Mentor and receives personalized guidance.
   * Endpoint: POST /api/v1/intelligence/ai/mentor-ask
   */
  askAIMentor: async (query: string): Promise<AIMentorResponse> => {
    try {
      const res = await apiClient.post<MentorQueryResponse, { query: string }>(
        '/v1/intelligence/ai/mentor-ask',
        { query: query.trim() }
      )
      return res.data.mentorResponse
    } catch {
      const res = await apiClient.post<MentorQueryResponse, { query: string }>(
        '/intelligence/ai/mentor-ask',
        { query: query.trim() }
      )
      return res.data.mentorResponse
    }
  },

  /**
   * Synthesizes live career recommendations for the student by combining
   * live AI personalization context and deterministic skill gap priority snapshots.
   */
  getCareerRecommendations: async (): Promise<{
    activeTrack: CareerTrackRecommendation | null
    allTracks: CareerTrackRecommendation[]
    summaryHeadline?: string
    summaryText?: string
    encouragementQuote?: string
    nextBestAction?: string
  }> => {
    // 1. Fetch live AI personalized summary and skill gaps in parallel
    const [summaryRes, gapsRes] = await Promise.allSettled([
      aiApi.getPersonalizedSummary(),
      skillsApi.getSkillGapPriority(),
    ])

    const summaryData = summaryRes.status === 'fulfilled' ? summaryRes.value : null
    const gapsData = gapsRes.status === 'fulfilled' ? gapsRes.value : null

    const context = summaryData?.context
    const summary = summaryData?.personalizedSummary
    const snapshots = gapsData?.snapshots || []

    const targetCareer = context?.targetCareer || 'Full Stack Developer'
    const targetCareerSlug = context?.careerSlug || 'full-stack-developer'

    // Compute alignment % from live verified skill levels against target thresholds
    let activeAlignment = 0
    const existingSkills: string[] = []
    const missingSkills: string[] = []

    if (snapshots.length > 0) {
      let totalScoreRatio = 0
      snapshots.forEach((snap) => {
        const cur = snap.currentLevel ?? 0
        const target = snap.targetLevel || 100
        const ratio = Math.min(100, Math.round((cur / target) * 100))
        totalScoreRatio += ratio

        const isMet = cur >= target || snap.gap <= 0 || snap.priority?.priorityStatus === 'TARGET_MET'
        if (isMet) {
          existingSkills.push(snap.skillName || snap.skillSlug || 'Skill')
        } else {
          missingSkills.push(snap.skillName || snap.skillSlug || 'Skill')
        }
      })
      activeAlignment = Math.round(totalScoreRatio / snapshots.length)
    } else if (context?.overallProgressPercent) {
      activeAlignment = context.overallProgressPercent
    }

    const activeTrack: CareerTrackRecommendation = {
      id: targetCareerSlug,
      title: targetCareer,
      slug: targetCareerSlug,
      alignment: Math.max(activeAlignment, 15), // baseline educational alignment
      description:
        summary?.summaryText ||
        `Designs and builds modern end-to-end applications combining user interfaces, backend APIs, and distributed data systems.`,
      existingSkills:
        existingSkills.length > 0
          ? existingSkills.slice(0, 4)
          : ['Computer Science Fundamentals', 'Problem Solving Logic'],
      missingSkills:
        missingSkills.length > 0
          ? missingSkills.slice(0, 4)
          : (summary?.topFocusSkills && summary.topFocusSkills.length > 0)
          ? summary.topFocusSkills
          : ['REST API Architecture', 'Database Integration'],
      recommendedNextStep:
        summary?.nextBestAction ||
        (context?.topPrioritySkill
          ? `Focus on closing the identified gap in ${context.topPrioritySkill} to advance your roadmap.`
          : 'Complete diagnostic skill assessment to calibrate your personalized roadmap.'),
      isTargetRole: true,
      category: 'software',
      topFocusSkills: summary?.topFocusSkills || [],
    }

    // Build catalog comparison tracks calibrated against student's verified skills
    const otherTracks: CareerTrackRecommendation[] = [
      {
        id: 'frontend-engineer',
        title: 'Frontend Engineer',
        slug: 'frontend-engineer',
        alignment: Math.max(25, Math.min(95, Math.round(activeAlignment * 1.05))),
        description:
          'Specializes in building responsive, high-performance web applications using modern JavaScript and component architectures.',
        existingSkills: existingSkills.filter((s) => /java|react|git/i.test(s)).length > 0
          ? existingSkills.filter((s) => /java|react|git/i.test(s)).slice(0, 3)
          : ['HTML5 & Semantics', 'JavaScript Core'],
        missingSkills: ['Advanced React Patterns', 'CSS Architecture & Tokens', 'Performance Profiling'],
        recommendedNextStep: 'Build high-fidelity responsive interfaces and practice client-side caching.',
        isTargetRole: targetCareer.toLowerCase().includes('frontend'),
        category: 'frontend',
      },
      {
        id: 'backend-systems-engineer',
        title: 'Backend Systems Engineer',
        slug: 'backend-systems-engineer',
        alignment: Math.max(20, Math.min(90, Math.round(activeAlignment * 0.9))),
        description:
          'Architects reliable server runtimes, RESTful/GraphQL microservices, and database query pipelines.',
        existingSkills: existingSkills.filter((s) => /node|express|mongo|sql/i.test(s)).length > 0
          ? existingSkills.filter((s) => /node|express|mongo|sql/i.test(s)).slice(0, 3)
          : ['Backend Logic Flow', 'Basic Querying'],
        missingSkills: ['Distributed Caching', 'Database Index Tuning', 'Service Auth & Security'],
        recommendedNextStep: 'Implement resilient authentication workflows and structured database models.',
        isTargetRole: targetCareer.toLowerCase().includes('backend'),
        category: 'backend',
      },
      {
        id: 'cloud-devops-engineer',
        title: 'Cloud & DevOps Engineer',
        slug: 'cloud-devops-engineer',
        alignment: Math.max(15, Math.min(80, Math.round(activeAlignment * 0.7))),
        description:
          'Automates CI/CD delivery pipelines, manages containerized deployments, and ensures system reliability.',
        existingSkills: existingSkills.filter((s) => /git/i.test(s)).length > 0
          ? ['Git Collaboration', 'Environment Configuration']
          : ['Command Line Operations'],
        missingSkills: ['Docker Containerization', 'Kubernetes Orchestration', 'CI/CD Automation'],
        recommendedNextStep: 'Containerize an existing project with Docker and configure automated tests.',
        isTargetRole: targetCareer.toLowerCase().includes('devops'),
        category: 'cloud',
      },
    ]

    // If active track is not already one of the other tracks, put activeTrack first
    const allTracks = [activeTrack, ...otherTracks.filter((t) => t.id !== activeTrack.id)]

    return {
      activeTrack,
      allTracks,
      summaryHeadline: summary?.headline,
      summaryText: summary?.summaryText,
      encouragementQuote: summary?.encouragementQuote,
      nextBestAction: summary?.nextBestAction,
    }
  },
}
