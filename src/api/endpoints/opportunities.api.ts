import { Opportunity, ApplicationStatus } from '@/types/opportunity.types'
import { profileApi } from '@/api/endpoints/profile.api'

const SAVED_STORAGE_KEY = 'bytex_saved_opps_v1'
const APPLIED_STORAGE_KEY = 'bytex_applied_opps_v1'

const getSavedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(SAVED_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const getAppliedMap = (): Record<string, { status: ApplicationStatus; appliedAt: string }> => {
  try {
    const raw = localStorage.getItem(APPLIED_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export interface StudentOpportunityContext {
  targetCareer: string
  readinessScore: number
  topBottleneck: string
  verifiedSkillsCount: number
}

export const opportunitiesApi = {
  getStudentContext: async (): Promise<StudentOpportunityContext> => {
    try {
      const [profile, stats] = await Promise.all([
        profileApi.getProfile(),
        profileApi.getUserStats().catch(() => null),
      ])
      return {
        targetCareer: profile.careerGoal || profile.targetCareer || 'Full Stack Developer',
        readinessScore: stats?.careerReadiness || 68,
        topBottleneck: 'Node.js & REST APIs',
        verifiedSkillsCount: 6,
      }
    } catch {
      return {
        targetCareer: 'Full Stack Developer',
        readinessScore: 68,
        topBottleneck: 'Node.js & REST APIs',
        verifiedSkillsCount: 6,
      }
    }
  },

  getOpportunities: async (): Promise<Opportunity[]> => {
    const context = await opportunitiesApi.getStudentContext()
    const savedIds = getSavedIds()
    const appliedMap = getAppliedMap()

    const rawList: Omit<Opportunity, 'isSaved' | 'applicationStatus' | 'appliedAt'>[] = [
      {
        id: 'opp_fullstack_intern',
        title: 'Junior Full Stack Developer Intern',
        organization: 'TechVanguard Labs',
        organizationLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=80',
        type: 'INTERNSHIP',
        typeLabel: 'Summer Internship',
        targetCareer: 'Full Stack Developer',
        location: 'Bengaluru, India',
        workMode: 'HYBRID',
        stipendOrSalary: '₹25,000 / month',
        deadline: '15 Oct 2026',
        description:
          'Join TechVanguard Labs to assist in engineering responsive React frontend user interfaces and robust Express.js microservices. You will work closely with senior tech leads to ship real customer features.',
        responsibilities: [
          'Develop reusable React UI components matching Figma design specifications.',
          'Build RESTful API endpoints backed by MongoDB Atlas data models.',
          'Write unit and integration tests using Jest and Cypress.',
          'Participate in daily Agile standups and sprint planning sessions.',
        ],
        requiredSkills: [
          { name: 'React', importance: 'CRITICAL', minScore: 60, isDemonstrated: true, isGap: false },
          { name: 'JavaScript', importance: 'CRITICAL', minScore: 70, isDemonstrated: true, isGap: false },
          { name: 'Node.js', importance: 'IMPORTANT', minScore: 55, isDemonstrated: false, isGap: true },
          { name: 'MongoDB', importance: 'PREFERRED', minScore: 50, isDemonstrated: true, isGap: false },
        ],
        externalUrl: 'https://techvanguard.example.com/careers/fullstack-intern',
        isPlatformApplication: true,
        isRecommended: true,
        relevanceReason: 'Directly aligns with your Full Stack Developer target role and verified React capabilities.',
      },
      {
        id: 'opp_backend_associate',
        title: 'Associate Backend Engineer (Node.js)',
        organization: 'CloudStream Systems',
        organizationLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80',
        type: 'JOB',
        typeLabel: 'Full-time Entry Level',
        targetCareer: 'Full Stack Developer',
        location: 'Remote',
        workMode: 'REMOTE',
        stipendOrSalary: '₹6.5 - ₹8.0 LPA',
        deadline: '30 Oct 2026',
        description:
          'CloudStream is seeking an entry-level backend engineer to help scale high-concurrency microservices. Ideal candidates have strong JavaScript/Node.js fundamentals and REST API experience.',
        responsibilities: [
          'Design and maintain scalable Express server routes and authentication middleware.',
          'Optimize database queries and schema indices in MongoDB.',
          'Implement OAuth2 and JWT security standards for API payloads.',
        ],
        requiredSkills: [
          { name: 'Node.js', importance: 'CRITICAL', minScore: 65, isDemonstrated: false, isGap: true },
          { name: 'Express.js', importance: 'CRITICAL', minScore: 60, isDemonstrated: true, isGap: false },
          { name: 'REST APIs', importance: 'IMPORTANT', minScore: 70, isDemonstrated: true, isGap: false },
          { name: 'TypeScript', importance: 'PREFERRED', minScore: 55, isDemonstrated: false, isGap: true },
        ],
        externalUrl: 'https://cloudstream.example.com/jobs/backend-associate',
        isPlatformApplication: true,
        isRecommended: true,
        relevanceReason: 'High career value — closing your Node.js gap fulfills 100% of this role requirement.',
      },
      {
        id: 'opp_marketplace_freelance',
        title: 'Full Stack Campus Marketplace MVP Developer',
        organization: 'ByteX Open Incubator',
        organizationLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
        type: 'FREELANCE',
        typeLabel: 'Gig / Contract',
        targetCareer: 'Full Stack Developer',
        location: 'On Campus / Remote',
        workMode: 'REMOTE',
        stipendOrSalary: '₹18,000 fixed stipend',
        deadline: '10 Oct 2026',
        description:
          'Contract opportunity for student developers to build a peer-to-peer campus gear exchange prototype. Demonstrates verified practical skills for your Career Passport.',
        responsibilities: [
          'Implement product listing CRUD operations with image uploads.',
          'Integrate Stripe test mode payment intent API.',
          'Deploy application on Vercel and Render.',
        ],
        requiredSkills: [
          { name: 'React', importance: 'CRITICAL', minScore: 60, isDemonstrated: true, isGap: false },
          { name: 'Express.js', importance: 'CRITICAL', minScore: 60, isDemonstrated: true, isGap: false },
          { name: 'Tailwind CSS', importance: 'PREFERRED', minScore: 50, isDemonstrated: true, isGap: false },
        ],
        isPlatformApplication: true,
        isRecommended: false,
        relevanceReason: 'Great practical project opportunity to build verified evidence for your Career Passport.',
      },
      {
        id: 'opp_hackathon_2026',
        title: 'AI SkillPath National Buildathon 2026',
        organization: 'SkillPath Foundation & Partners',
        organizationLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80',
        type: 'HACKATHON',
        typeLabel: '48-Hour Hackathon',
        targetCareer: 'Full Stack Developer',
        location: 'Online',
        workMode: 'REMOTE',
        stipendOrSalary: '₹1,50,000 Pool Prize',
        deadline: '05 Oct 2026',
        description:
          '48-hour online hackathon challenging teams to construct AI-assisted career and educational tools. Top teams receive direct interview fast-tracks.',
        responsibilities: [
          'Form or join a team of 2-4 student developers.',
          'Build and submit a working GitHub repository with live video demo.',
          'Present architecture overview to technical judges.',
        ],
        requiredSkills: [
          { name: 'JavaScript', importance: 'CRITICAL', minScore: 50, isDemonstrated: true, isGap: false },
          { name: 'React', importance: 'IMPORTANT', minScore: 50, isDemonstrated: true, isGap: false },
          { name: 'AI APIs', importance: 'PREFERRED', minScore: 40, isDemonstrated: false, isGap: true },
        ],
        externalUrl: 'https://hackathon.skillpath.example.com',
        isPlatformApplication: false,
        isRecommended: true,
        relevanceReason: 'Fast-track interview opportunities for top submissions.',
      },
      {
        id: 'opp_opensource_express',
        title: 'Open Source Contributor — Express Middleware Suite',
        organization: 'Node Community Collective',
        organizationLogo: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=100&auto=format&fit=crop&q=80',
        type: 'OPEN_SOURCE',
        typeLabel: 'Community Initiative',
        targetCareer: 'Full Stack Developer',
        location: 'GitHub',
        workMode: 'REMOTE',
        stipendOrSalary: 'Swag & Verified Badge',
        deadline: 'Open Deadline',
        description:
          'Contribute bug fixes, TypeScript type definitions, and documentation enhancements to popular community Express middleware repositories.',
        responsibilities: [
          'Tackle open GitHub issues marked with `good first issue`.',
          'Submit pull requests adhering to repository code standards.',
          'Participate in code reviews with core maintainers.',
        ],
        requiredSkills: [
          { name: 'Node.js', importance: 'CRITICAL', minScore: 50, isDemonstrated: false, isGap: true },
          { name: 'Git & GitHub', importance: 'CRITICAL', minScore: 60, isDemonstrated: true, isGap: false },
        ],
        externalUrl: 'https://github.com/example/express-middleware-suite',
        isPlatformApplication: false,
        isRecommended: false,
        relevanceReason: 'Excellent way to strengthen Node.js skill score through real public pull requests.',
      },
    ]

    return rawList.map((opp) => {
      const isSaved = savedIds.includes(opp.id)
      const appliedInfo = appliedMap[opp.id]

      return {
        ...opp,
        targetCareer: context.targetCareer,
        isSaved,
        applicationStatus: appliedInfo ? appliedInfo.status : 'NOT_APPLIED',
        appliedAt: appliedInfo ? appliedInfo.appliedAt : undefined,
      }
    })
  },

  getOpportunityById: async (id: string): Promise<Opportunity | null> => {
    const list = await opportunitiesApi.getOpportunities()
    return list.find((o) => o.id === id) || null
  },

  toggleSaveOpportunity: async (id: string): Promise<{ success: boolean; isSaved: boolean }> => {
    const savedIds = getSavedIds()
    let updated: string[] = []
    let nowSaved = false

    if (savedIds.includes(id)) {
      updated = savedIds.filter((item) => item !== id)
      nowSaved = false
    } else {
      updated = [...savedIds, id]
      nowSaved = true
    }

    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // Ignore quota error
    }

    return { success: true, isSaved: nowSaved }
  },

  applyToOpportunity: async (id: string): Promise<{ success: boolean; status: ApplicationStatus }> => {
    const appliedMap = getAppliedMap()
    const now = new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })

    appliedMap[id] = {
      status: 'APPLIED',
      appliedAt: now,
    }

    try {
      localStorage.setItem(APPLIED_STORAGE_KEY, JSON.stringify(appliedMap))
    } catch {
      // Ignore quota error
    }

    return { success: true, status: 'APPLIED' }
  },
}
