import { connectDB, disconnectDB } from '../config/database.js';
import { SkillModel } from '../models/Skill.js';
import { CareerModel } from '../models/Career.js';
import { ProjectModel } from '../models/Project.js';
import { ProjectDifficulty } from '../types/intelligence.js';

export interface ProjectSeedResult {
  projectsProcessed: number;
}

export const seedProjectData = async (): Promise<ProjectSeedResult> => {
  // 1. Load canonical skills map by slug
  const skills = await SkillModel.find().lean();
  const skillMap = new Map<string, any>();
  for (const s of skills) {
    skillMap.set(s.slug, s);
  }

  // 2. Load target career profile
  const fullStackCareer = await CareerModel.findOne({ slug: 'full-stack-developer' }).lean();

  // 3. Define 15+ practical demo projects
  const projectCatalog: Array<{
    title: string;
    slug: string;
    description: string;
    difficulty: ProjectDifficulty;
    primarySkillSlug: string;
    reinforcedSkillSlugs: string[];
    technologies: string[];
    estimatedHours: number;
    githubStarterUrl?: string;
    architectureOverview?: string;
    learningObjectives?: string[];
  }> = [
    {
      title: 'Interactive Task & Kanban Dashboard',
      slug: 'interactive-task-kanban-dashboard',
      description: 'Build an interactive drag-and-drop task management board with filter controls, local storage persistence, and dynamic state update callbacks.',
      difficulty: 'BEGINNER',
      primarySkillSlug: 'javascript',
      reinforcedSkillSlugs: ['javascript', 'problem-solving'],
      technologies: ['JavaScript', 'HTML5', 'CSS3', 'Local Storage API'],
      estimatedHours: 6,
      githubStarterUrl: 'https://github.com/skillpath-templates/kanban-starter',
      architectureOverview: 'Client-side SPA leveraging vanilla JS DOM events, array transformation methods, and state synchronization.',
      learningObjectives: ['Master array methods', 'Implement event delegation', 'Handle browser storage'],
    },
    {
      title: 'Modern Component Library & Design System',
      slug: 'modern-component-library-design-system',
      description: 'Design and publish a reusable UI component catalog featuring accessible buttons, modals, dropdowns, and fluid responsive layouts.',
      difficulty: 'INTERMEDIATE',
      primarySkillSlug: 'react',
      reinforcedSkillSlugs: ['react', 'javascript', 'problem-solving'],
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Storybook'],
      estimatedHours: 12,
      githubStarterUrl: 'https://github.com/skillpath-templates/react-design-system-starter',
      architectureOverview: 'Modular React architecture enforcing strict component props, render isolation, and theme customization.',
      learningObjectives: ['Build compound components', 'Create accessible UI primitives', 'Enforce TypeScript contracts'],
    },
    {
      title: 'RESTful E-Commerce Micro-Service API',
      slug: 'restful-ecommerce-microservice-api',
      description: 'Develop a scalable REST API server handling product catalogs, inventory updates, cart calculations, and JSON validation schemas.',
      difficulty: 'INTERMEDIATE',
      primarySkillSlug: 'express',
      reinforcedSkillSlugs: ['express', 'node-js', 'rest-api'],
      technologies: ['Node.js', 'Express', 'Zod', 'REST API'],
      estimatedHours: 10,
      githubStarterUrl: 'https://github.com/skillpath-templates/express-ecommerce-api-starter',
      architectureOverview: 'Layered controller-service architecture with centralized error handler, input validation, and route modularization.',
      learningObjectives: ['Implement Express middleware pipeline', 'Validate HTTP request payload with Zod', 'Structure RESTful routes'],
    },
    {
      title: 'High-Performance MongoDB Data Indexing & Analytics Engine',
      slug: 'mongodb-data-indexing-analytics-engine',
      description: 'Architect a MongoDB analytics database with custom schema validations, compound indexes, aggregation pipelines, and bulk upsert runners.',
      difficulty: 'ADVANCED',
      primarySkillSlug: 'mongodb',
      reinforcedSkillSlugs: ['mongodb', 'express', 'node-js'],
      technologies: ['MongoDB', 'Mongoose', 'TypeScript', 'Node.js'],
      estimatedHours: 14,
      githubStarterUrl: 'https://github.com/skillpath-templates/mongo-analytics-starter',
      architectureOverview: 'Mongoose schema pipeline executing complex aggregation stages ($match, $group, $lookup) with zero N+1 database calls.',
      learningObjectives: ['Design high-throughput Mongoose schemas', 'Write multi-stage aggregation queries', 'Optimize database indexes'],
    },
    {
      title: 'JWT Authentication & Role-Based Access Control System',
      slug: 'jwt-auth-rbac-security-system',
      description: 'Implement end-to-end user authentication with double-submit cookie validation, refresh token rotation, password hashing, and RBAC guards.',
      difficulty: 'ADVANCED',
      primarySkillSlug: 'authentication',
      reinforcedSkillSlugs: ['authentication', 'express', 'rest-api', 'mongodb'],
      technologies: ['Node.js', 'Express', 'JWT', 'bcryptjs', 'MongoDB'],
      estimatedHours: 16,
      githubStarterUrl: 'https://github.com/skillpath-templates/auth-rbac-starter',
      architectureOverview: 'Production security authentication engine issuing signed JWT tokens, HTTP-only cookies, and middleware permission checks.',
      learningObjectives: ['Secure user passwords with bcrypt', 'Manage JWT access & refresh lifecycle', 'Build role-based auth middleware'],
    },
    {
      title: 'Real-Time Async Job Queue & Event Dashboard',
      slug: 'realtime-async-job-queue-dashboard',
      description: 'Construct a background job processor handling async task queues, retry strategies, process logging, and real-time execution metrics.',
      difficulty: 'INTERMEDIATE',
      primarySkillSlug: 'node-js',
      reinforcedSkillSlugs: ['node-js', 'javascript', 'rest-api'],
      technologies: ['Node.js', 'EventEmitters', 'Express', 'Pino Logger'],
      estimatedHours: 10,
      githubStarterUrl: 'https://github.com/skillpath-templates/node-job-runner-starter',
      architectureOverview: 'Node.js event-driven architecture using native EventEmitter pipelines and non-blocking asynchronous processing.',
      learningObjectives: ['Master Node.js event loop mechanics', 'Handle async task retries and failures', 'Log structured diagnostics'],
    },
    {
      title: 'API Rate Limiting & Gateway Proxy Service',
      slug: 'api-rate-limiting-gateway-proxy',
      description: 'Build a lightweight API Gateway forwarding requests to downstream microservices while enforcing token bucket rate limits and request logging.',
      difficulty: 'INTERMEDIATE',
      primarySkillSlug: 'rest-api',
      reinforcedSkillSlugs: ['rest-api', 'express', 'node-js'],
      technologies: ['Node.js', 'Express', 'http-proxy-middleware'],
      estimatedHours: 8,
      githubStarterUrl: 'https://github.com/skillpath-templates/api-gateway-starter',
      architectureOverview: 'Reverse proxy server intercepting HTTP headers, validating client API keys, and throttling excessive client requests.',
      learningObjectives: ['Implement rate-limiting algorithms', 'Proxy HTTP requests safely', 'Standardize API error schemas'],
    },
    {
      title: 'Collaborative Multi-Branch Git Release Manager',
      slug: 'collaborative-multibranch-git-release-manager',
      description: 'Simulate a multi-developer git repository workflow resolving complex merge conflicts, rebasing feature branches, and configuring GitHub Actions CI.',
      difficulty: 'BEGINNER',
      primarySkillSlug: 'git',
      reinforcedSkillSlugs: ['git', 'problem-solving'],
      technologies: ['Git', 'GitHub Actions', 'Bash'],
      estimatedHours: 4,
      githubStarterUrl: 'https://github.com/skillpath-templates/git-workflow-lab',
      architectureOverview: 'Git feature-branch release workflow enforcing trunk-based development, semantic commits, and pull request reviews.',
      learningObjectives: ['Resolve complex git merge conflicts', 'Rebase feature branches onto main', 'Automate CI checks'],
    },
    {
      title: 'Algorithmic Data Structure Visualizer & Benchmark Suite',
      slug: 'algorithmic-ds-visualizer-benchmark-suite',
      description: 'Create an interactive web application visualizing sorting algorithms (QuickSort, MergeSort) and measuring time/space complexity benchmarks.',
      difficulty: 'INTERMEDIATE',
      primarySkillSlug: 'problem-solving',
      reinforcedSkillSlugs: ['problem-solving', 'javascript', 'react'],
      technologies: ['JavaScript', 'React', 'TypeScript', 'Canvas API'],
      estimatedHours: 12,
      githubStarterUrl: 'https://github.com/skillpath-templates/algo-visualizer-starter',
      architectureOverview: 'Interactive React application rendering algorithm execution steps using async delays and state snapshots.',
      learningObjectives: ['Decompose complex algorithms', 'Visualize Big-O time complexity', 'Optimize UI render cycles'],
    },
    {
      title: 'Full Stack Web Developer Capstone Platform',
      slug: 'full-stack-web-developer-capstone-platform',
      description: 'End-to-end capstone application integrating React frontend, Express REST API backend, MongoDB Atlas database, JWT Auth, and adaptive roadmap analytics.',
      difficulty: 'ADVANCED',
      primarySkillSlug: 'react',
      reinforcedSkillSlugs: ['react', 'express', 'mongodb', 'authentication', 'node-js', 'rest-api'],
      technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript'],
      estimatedHours: 30,
      githubStarterUrl: 'https://github.com/skillpath-templates/fullstack-capstone-starter',
      architectureOverview: 'Complete 3-tier enterprise architecture combining SPA frontend client, authenticated backend API server, and MongoDB persistence layer.',
      learningObjectives: ['Integrate complete full-stack web app', 'Deploy API and database to cloud', 'Write end-to-end integration tests'],
    },
    {
      title: 'Single Page App Dynamic Data Table & Pagination',
      slug: 'spa-dynamic-data-table-pagination',
      description: 'Build an ultra-fast client-side data grid supporting column sorting, multi-field filtering, debounced search, and pagination controls.',
      difficulty: 'BEGINNER',
      primarySkillSlug: 'react',
      reinforcedSkillSlugs: ['react', 'javascript'],
      technologies: ['React', 'TypeScript', 'Lucide Icons'],
      estimatedHours: 5,
      githubStarterUrl: 'https://github.com/skillpath-templates/react-datatable-starter',
      architectureOverview: 'Optimized React functional table component using memoized selector hooks for fast client-side sorting and filtering.',
      learningObjectives: ['Implement memoized sorting logic', 'Manage pagination state', 'Debounce user search inputs'],
    },
    {
      title: 'Express File Upload & Storage Processing Service',
      slug: 'express-file-upload-storage-service',
      description: 'Create a Node.js backend microservice for multipart/form-data image uploads, mime-type validation, thumbnail generation, and cloud storage.',
      difficulty: 'INTERMEDIATE',
      primarySkillSlug: 'express',
      reinforcedSkillSlugs: ['express', 'node-js', 'rest-api'],
      technologies: ['Node.js', 'Express', 'Multer', 'Sharp'],
      estimatedHours: 8,
      githubStarterUrl: 'https://github.com/skillpath-templates/express-upload-starter',
      architectureOverview: 'Stream-based file processing backend checking file extensions, enforcing file size limits, and storing metadata in database.',
      learningObjectives: ['Handle multipart form requests', 'Validate binary file magic numbers', 'Process stream data efficiently'],
    },
    {
      title: 'MongoDB Multi-Tenant Organization Schema System',
      slug: 'mongodb-multitenant-org-schema-system',
      description: 'Design a multi-tenant SaaS MongoDB database enforcing tenant data isolation, sub-document validations, and scoped query middlewares.',
      difficulty: 'ADVANCED',
      primarySkillSlug: 'mongodb',
      reinforcedSkillSlugs: ['mongodb', 'express', 'authentication'],
      technologies: ['MongoDB', 'Mongoose', 'TypeScript'],
      estimatedHours: 12,
      githubStarterUrl: 'https://github.com/skillpath-templates/mongo-multitenant-starter',
      architectureOverview: 'Mongoose plugin architecture injecting tenantId scoping filters across all find, update, and delete database hooks.',
      learningObjectives: ['Build Mongoose middleware plugins', 'Enforce multi-tenant data isolation', 'Index composite keys'],
    },
    {
      title: 'OAuth2 Social Identity Integration Server',
      slug: 'oauth2-social-identity-integration-server',
      description: 'Add Google & GitHub OAuth2 login integration to an existing Express identity service, storing user profiles and linking credentials.',
      difficulty: 'INTERMEDIATE',
      primarySkillSlug: 'authentication',
      reinforcedSkillSlugs: ['authentication', 'express', 'rest-api'],
      technologies: ['Node.js', 'Express', 'Passport.js', 'OAuth2'],
      estimatedHours: 9,
      githubStarterUrl: 'https://github.com/skillpath-templates/oauth-social-starter',
      architectureOverview: 'Passport.js OAuth2 strategy implementation exchanging authorization codes for user profile claims and issuing internal JWT tokens.',
      learningObjectives: ['Understand OAuth2 authorization flow', 'Handle social callback endpoints', 'Link third-party accounts'],
    },
    {
      title: 'Interactive CLI Developer Environment Diagnostic Tool',
      slug: 'interactive-cli-dev-env-diagnostic-tool',
      description: 'Develop an interactive terminal CLI checking installed node version, git configuration, open port availability, and database connectivity.',
      difficulty: 'BEGINNER',
      primarySkillSlug: 'node-js',
      reinforcedSkillSlugs: ['node-js', 'javascript'],
      technologies: ['Node.js', 'Commander.js', 'Inquirer.js', 'Chalk'],
      estimatedHours: 4,
      githubStarterUrl: 'https://github.com/skillpath-templates/cli-diagnostic-starter',
      architectureOverview: 'Standalone executable Node.js script using async child processes to run system checks and render styled terminal summaries.',
      learningObjectives: ['Build command-line Node.js utilities', 'Execute shell sub-processes asynchronously', 'Format terminal output'],
    },
  ];

  let projectsProcessed = 0;

  for (const item of projectCatalog) {
    const primarySkillDoc = skillMap.get(item.primarySkillSlug);
    if (!primarySkillDoc) {
      console.warn(`[Seed] Warning: Primary skill slug '${item.primarySkillSlug}' not found for project '${item.title}'`);
      continue;
    }

    const reinforcedSkillIds = item.reinforcedSkillSlugs
      .map((slug) => skillMap.get(slug)?._id)
      .filter((id) => Boolean(id));

    await ProjectModel.findOneAndUpdate(
      { slug: item.slug },
      {
        $set: {
          title: item.title,
          slug: item.slug,
          description: item.description,
          difficulty: item.difficulty,
          careerId: fullStackCareer?._id,
          skillId: primarySkillDoc._id,
          skillsReinforced: reinforcedSkillIds,
          technologies: item.technologies,
          estimatedHours: item.estimatedHours,
          githubStarterUrl: item.githubStarterUrl,
          architectureOverview: item.architectureOverview,
          learningObjectives: item.learningObjectives,
        },
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    projectsProcessed++;
  }

  return { projectsProcessed };
};

// Standalone runner CLI
if (typeof require !== 'undefined' && require.main === module) {
  connectDB()
    .then(async () => {
      console.log('Running project seed script...');
      const result = await seedProjectData();
      console.log('Project seed executed successfully:', result);
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Project seed failed:', err);
      process.exit(1);
    });
}
