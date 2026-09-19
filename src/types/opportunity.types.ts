export type OpportunityType = 'INTERNSHIP' | 'JOB' | 'FREELANCE' | 'HACKATHON' | 'OPEN_SOURCE'

export type WorkMode = 'REMOTE' | 'HYBRID' | 'ON_SITE'

export type ApplicationStatus = 'NOT_APPLIED' | 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'SELECTED'

export interface OpportunityRequiredSkill {
  name: string
  importance: 'CRITICAL' | 'IMPORTANT' | 'PREFERRED'
  minScore?: number
  isDemonstrated?: boolean
  isGap?: boolean
}

export interface Opportunity {
  id: string
  title: string
  organization: string
  organizationLogo?: string
  type: OpportunityType
  typeLabel: string
  targetCareer: string
  location: string
  workMode: WorkMode
  stipendOrSalary: string
  deadline: string
  description: string
  responsibilities: string[]
  requiredSkills: OpportunityRequiredSkill[]
  externalUrl?: string
  isPlatformApplication: boolean
  isRecommended?: boolean
  relevanceReason?: string
  isSaved?: boolean
  applicationStatus?: ApplicationStatus
  appliedAt?: string
}

export interface OpportunityFilterOptions {
  searchQuery: string
  type: string
  workMode: string
  onlyRecommended: boolean
  onlySaved: boolean
  onlyApplied: boolean
}
