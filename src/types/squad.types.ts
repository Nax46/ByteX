export type SquadRole = 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'UI_UX' | 'FULL_STACK'

export type SquadTaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED'

export interface SquadMember {
  id: string
  name: string
  avatarUrl?: string
  role: SquadRole
  roleLabel: string
  careerGoal: string
  isCurrentUser: boolean
  skillsDemonstrated: string[]
}

export interface SquadTask {
  id: string
  title: string
  description: string
  assignedRole: SquadRole
  status: SquadTaskStatus
  skillTag: string
  completedAt?: string
}

export interface Squad {
  id: string
  name: string
  description: string
  targetCareer: string
  projectName: string
  progressPercent: number
  members: SquadMember[]
  openRoles: { role: SquadRole; label: string }[]
  tasks: SquadTask[]
  currentMissionStage: string
  userRole?: SquadRole
  userRoleLabel?: string
  isUserMember: boolean
}
