import { Squad, SquadRole, SquadTaskStatus } from '@/types/squad.types'
import { profileApi } from '@/api/endpoints/profile.api'
import { projectsApi } from '@/api/endpoints/projects.api'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

/**
 * Squads API Module
 * Connects team project collaboration to student roles, project tasks, and verified skill evidence.
 */
export const squadsApi = {
  getSquads: async (): Promise<Squad[]> => {
    const [profile, projects] = await Promise.all([
      profileApi.getProfile().catch(() => null),
      projectsApi.getRecommendedProjects().catch(() => []),
    ])

    const targetRole = profile?.careerGoal || profile?.targetCareer || DEFAULT_CAREER_GOAL
    const userName = profile?.name || 'You (Current Learner)'
    const mainProject = projects[0]?.title || 'Campus Marketplace Platform'

    const squadList: Squad[] = [
      {
        id: 'sq_campus_marketplace',
        name: 'Campus Marketplace Engineering Squad',
        description: 'Building a full-stack campus peer-to-peer textbook & gear marketplace MVP with live chat & Stripe payment sandbox.',
        targetCareer: targetRole,
        projectName: mainProject,
        progressPercent: 64,
        currentMissionStage: 'API Integration & Authentication Phase',
        userRole: 'BACKEND',
        userRoleLabel: 'Backend API Developer',
        isUserMember: true,
        members: [
          {
            id: 'mem-user',
            name: `${userName} (You)`,
            role: 'BACKEND',
            roleLabel: 'Backend API Developer',
            careerGoal: targetRole,
            isCurrentUser: true,
            skillsDemonstrated: ['Node.js', 'Express.js', 'MongoDB', 'JWT Auth'],
          },
          {
            id: 'mem-1',
            name: 'Aarav Sharma',
            role: 'FRONTEND',
            roleLabel: 'Frontend UI Lead',
            careerGoal: targetRole,
            isCurrentUser: false,
            skillsDemonstrated: ['React', 'TypeScript', 'Tailwind CSS'],
          },
          {
            id: 'mem-2',
            name: 'Priya Nair',
            role: 'DATABASE',
            roleLabel: 'Database Specialist',
            careerGoal: targetRole,
            isCurrentUser: false,
            skillsDemonstrated: ['MongoDB Aggregations', 'Mongoose Schemas'],
          },
          {
            id: 'mem-3',
            name: 'Dev Kulkarni',
            role: 'UI_UX',
            roleLabel: 'UI/UX Designer',
            careerGoal: targetRole,
            isCurrentUser: false,
            skillsDemonstrated: ['Wireframing', 'Design Tokens'],
          },
        ],
        openRoles: [
          { role: 'FULL_STACK', label: 'Full Stack Integration Lead' },
        ],
        tasks: [
          {
            id: 'task-1',
            title: 'Express REST Server Setup & DB Connection',
            description: 'Initialize Express app repository, configure Mongoose connection string, and setup error handlers.',
            assignedRole: 'BACKEND',
            status: 'COMPLETED',
            skillTag: 'Node.js',
            completedAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: 'task-2',
            title: 'JWT Authentication & Bearer Header Verification',
            description: 'Implement token generation on login/register endpoints and create verifyToken middleware.',
            assignedRole: 'BACKEND',
            status: 'IN_PROGRESS',
            skillTag: 'Express.js',
          },
          {
            id: 'task-3',
            title: 'Product Catalog REST CRUD Endpoints',
            description: 'Develop GET /products, POST /products with image URL payload, and DELETE endpoints.',
            assignedRole: 'BACKEND',
            status: 'TODO',
            skillTag: 'REST APIs',
          },
          {
            id: 'task-4',
            title: 'React Single Page App Product Feed Components',
            description: 'Construct responsive grid component rendering product cards with optimistic filtering.',
            assignedRole: 'FRONTEND',
            status: 'COMPLETED',
            skillTag: 'React',
            completedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
      },

      {
        id: 'sq_ai_study_planner',
        name: 'AI Study & Roadmap Planner Squad',
        description: 'Developing an intelligent study planner calculating daily task priorities based on student skill gaps.',
        targetCareer: targetRole,
        projectName: 'AI Study Planner Platform',
        progressPercent: 35,
        currentMissionStage: 'Frontend Architecture & State Machine Phase',
        isUserMember: false,
        members: [
          {
            id: 'mem-4',
            name: 'Rohan Mehta',
            role: 'FULL_STACK',
            roleLabel: 'Full Stack Engineer',
            careerGoal: targetRole,
            isCurrentUser: false,
            skillsDemonstrated: ['Node.js', 'React'],
          },
          {
            id: 'mem-5',
            name: 'Ananya Gupta',
            role: 'FRONTEND',
            roleLabel: 'Frontend Engineer',
            careerGoal: targetRole,
            isCurrentUser: false,
            skillsDemonstrated: ['React', 'CSS Modules'],
          },
        ],
        openRoles: [
          { role: 'BACKEND', label: 'Backend API Engineer' },
          { role: 'DATABASE', label: 'Database Architect' },
        ],
        tasks: [
          {
            id: 'task-5',
            title: 'Custom Skill Gap Evaluation Engine',
            description: 'Build calculation logic comparing target skill benchmark against diagnostic scores.',
            assignedRole: 'BACKEND',
            status: 'TODO',
            skillTag: 'Algorithms',
          },
          {
            id: 'task-6',
            title: 'Interactive Roadmap Stage Timeline View',
            description: 'Build responsive SVG vertical timeline component for active roadmap stages.',
            assignedRole: 'FRONTEND',
            status: 'IN_PROGRESS',
            skillTag: 'React UI',
          },
        ],
      },
    ]

    return squadList
  },

  joinSquad: async (squadId: string, role: SquadRole): Promise<{ success: boolean; squadId: string; role: SquadRole }> => {
    return { success: true, squadId, role }
  },

  updateTaskStatus: async (taskId: string, status: SquadTaskStatus): Promise<{ success: boolean; taskId: string; status: SquadTaskStatus }> => {
    return { success: true, taskId, status }
  },
}
