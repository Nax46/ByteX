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

  // 2. Load target career profiles map by slug
  const careers = await CareerModel.find().lean();
  const careerMap = new Map<string, any>();
  for (const c of careers) {
    careerMap.set(c.slug, c);
  }

  // 3. Define practical portfolio projects across all 7 careers
  const projectCatalog: Array<{
    title: string;
    slug: string;
    description: string;
    difficulty: ProjectDifficulty;
    careerSlug: string;
    primarySkillSlug: string;
    reinforcedSkillSlugs: string[];
    technologies: string[];
    estimatedHours: number;
    githubStarterUrl?: string;
    architectureOverview?: string;
    learningObjectives?: string[];
  }> = [
    // --- Full Stack & Web Projects ---
    {
      title: 'Interactive Task & Kanban Dashboard',
      slug: 'interactive-task-kanban-dashboard',
      description: 'Build an interactive drag-and-drop task management board with filter controls, local storage persistence, and dynamic state update callbacks.',
      difficulty: 'BEGINNER',
      careerSlug: 'frontend-developer',
      primarySkillSlug: 'javascript',
      reinforcedSkillSlugs: ['javascript', 'html-css', 'problem-solving'],
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
      careerSlug: 'frontend-developer',
      primarySkillSlug: 'react',
      reinforcedSkillSlugs: ['react', 'typescript', 'javascript'],
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
      careerSlug: 'backend-developer',
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
      careerSlug: 'backend-developer',
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
      careerSlug: 'backend-developer',
      primarySkillSlug: 'authentication',
      reinforcedSkillSlugs: ['authentication', 'express', 'rest-api', 'mongodb'],
      technologies: ['Node.js', 'Express', 'JWT', 'bcryptjs', 'MongoDB'],
      estimatedHours: 16,
      githubStarterUrl: 'https://github.com/skillpath-templates/auth-rbac-starter',
      architectureOverview: 'Production security authentication engine issuing signed JWT tokens, HTTP-only cookies, and middleware permission checks.',
      learningObjectives: ['Secure user passwords with bcrypt', 'Manage JWT access & refresh lifecycle', 'Build role-based auth middleware'],
    },
    {
      title: 'Full Stack Web Developer Capstone Platform',
      slug: 'full-stack-web-developer-capstone-platform',
      description: 'End-to-end capstone application integrating React frontend, Express REST API backend, MongoDB Atlas database, JWT Auth, and adaptive roadmap analytics.',
      difficulty: 'ADVANCED',
      careerSlug: 'full-stack-developer',
      primarySkillSlug: 'react',
      reinforcedSkillSlugs: ['react', 'express', 'mongodb', 'authentication', 'node-js', 'rest-api'],
      technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript'],
      estimatedHours: 30,
      githubStarterUrl: 'https://github.com/skillpath-templates/fullstack-capstone-starter',
      architectureOverview: 'Complete 3-tier enterprise architecture combining SPA frontend client, authenticated backend API server, and MongoDB persistence layer.',
      learningObjectives: ['Integrate complete full-stack web app', 'Deploy API and database to cloud', 'Write end-to-end integration tests'],
    },

    // --- Data Analytics Projects ---
    {
      title: 'E-Commerce Sales & Revenue Data Analysis',
      slug: 'ecommerce-sales-revenue-data-analysis',
      description: 'Clean raw transaction logs using Pandas, write SQL queries to identify top-performing customer cohorts, and present visual insight charts.',
      difficulty: 'INTERMEDIATE',
      careerSlug: 'data-analyst',
      primarySkillSlug: 'pandas',
      reinforcedSkillSlugs: ['pandas', 'python', 'sql', 'data-visualization'],
      technologies: ['Python', 'Pandas', 'SQL', 'Matplotlib', 'Jupyter'],
      estimatedHours: 10,
      githubStarterUrl: 'https://github.com/skillpath-templates/sales-data-starter',
      architectureOverview: 'Jupyter notebook processing CSV logs, executing SQL window functions, and exporting executive charts.',
      learningObjectives: ['Wrangle messy datasets with Pandas', 'Write SQL cohort analysis queries', 'Build clear chart stories'],
    },
    {
      title: 'Student Performance & Academic Analytics Dashboard',
      slug: 'student-performance-analytics-dashboard',
      description: 'Design an interactive Power BI dashboard tracking student course completion rates, assessment scores, and drop-out risk factors.',
      difficulty: 'BEGINNER',
      careerSlug: 'data-analyst',
      primarySkillSlug: 'data-visualization',
      reinforcedSkillSlugs: ['data-visualization', 'excel', 'power-bi', 'statistics'],
      technologies: ['Power BI', 'Excel', 'DAX', 'Statistics'],
      estimatedHours: 8,
      githubStarterUrl: 'https://github.com/skillpath-templates/student-analytics-starter',
      architectureOverview: 'Power BI data model consuming Excel tables, defining DAX measures, and rendering interactive visual slicers.',
      learningObjectives: ['Build relational data models in Power BI', 'Formulate DAX metrics', 'Design user-friendly KPI cards'],
    },

    // --- AI / ML Projects ---
    {
      title: 'Predictive Housing Price Machine Learning Model',
      slug: 'predictive-housing-price-ml-model',
      description: 'Build and evaluate linear regression and random forest models predicting property market values from demographic and geometric features.',
      difficulty: 'INTERMEDIATE',
      careerSlug: 'ai-ml-engineer',
      primarySkillSlug: 'machine-learning',
      reinforcedSkillSlugs: ['machine-learning', 'python', 'pandas', 'numpy', 'model-evaluation'],
      technologies: ['Python', 'Scikit-Learn', 'Pandas', 'NumPy'],
      estimatedHours: 12,
      githubStarterUrl: 'https://github.com/skillpath-templates/housing-ml-starter',
      architectureOverview: 'Scikit-Learn Pipeline combining StandardScalar feature transformers, Random Forest Regressors, and RMSE evaluation.',
      learningObjectives: ['Engineer tabular predictive features', 'Tune model hyperparameters', 'Evaluate regression metrics'],
    },
    {
      title: 'Deep Learning Neural Network Classifier',
      slug: 'deep-learning-neural-network-classifier',
      description: 'Construct a multi-layer deep neural network using Python and NumPy matrix operations to classify multi-class vector datasets.',
      difficulty: 'ADVANCED',
      careerSlug: 'ai-ml-engineer',
      primarySkillSlug: 'deep-learning',
      reinforcedSkillSlugs: ['deep-learning', 'mathematics', 'numpy', 'data-preprocessing'],
      technologies: ['Python', 'NumPy', 'Matplotlib'],
      estimatedHours: 16,
      githubStarterUrl: 'https://github.com/skillpath-templates/nn-from-scratch-starter',
      architectureOverview: 'From-scratch neural network implementation featuring forward propagation, cross-entropy loss, and backpropagation gradients.',
      learningObjectives: ['Implement matrix calculus in NumPy', 'Understand backpropagation gradients', 'Prevent exploding gradients'],
    },

    // --- Cybersecurity Projects ---
    {
      title: 'Web Application Vulnerability Audit Lab',
      slug: 'web-application-vulnerability-audit-lab',
      description: 'Conduct a security assessment of a vulnerable web application, identifying OWASP Top 10 flaws including SQL Injection and XSS.',
      difficulty: 'INTERMEDIATE',
      careerSlug: 'cybersecurity-analyst',
      primarySkillSlug: 'web-security',
      reinforcedSkillSlugs: ['web-security', 'security-fundamentals', 'linux', 'networking'],
      technologies: ['Burp Suite', 'OWASP ZAP', 'Linux', 'Web Security'],
      estimatedHours: 10,
      githubStarterUrl: 'https://github.com/skillpath-templates/web-audit-starter',
      architectureOverview: 'Controlled security sandbox testing HTTP proxy requests, payload injections, and remediation report generation.',
      learningObjectives: ['Identify web application vulnerabilities', 'Demonstrate proof-of-concept exploits', 'Author remediation reports'],
    },
    {
      title: 'Network Traffic & Security Packet Scanner',
      slug: 'network-traffic-security-packet-scanner',
      description: 'Analyze PCAP network captures using security tools, detect suspicious port scans, and isolate malicious IP traffic.',
      difficulty: 'INTERMEDIATE',
      careerSlug: 'cybersecurity-analyst',
      primarySkillSlug: 'security-tools',
      reinforcedSkillSlugs: ['security-tools', 'networking', 'linux'],
      technologies: ['Wireshark', 'Nmap', 'Linux', 'Bash'],
      estimatedHours: 8,
      githubStarterUrl: 'https://github.com/skillpath-templates/pcap-analysis-starter',
      architectureOverview: 'Packet analysis laboratory inspecting TCP handshakes, DNS queries, and TLS certificate exchanges.',
      learningObjectives: ['Parse PCAP packet traces', 'Identify network scan footprints', 'Audit network protocol headers'],
    },

    // --- Cloud & DevOps Projects ---
    {
      title: 'Containerized Microservices Deployment Pipeline',
      slug: 'containerized-microservices-deployment-pipeline',
      description: 'Package a Node.js web app and MongoDB database into Docker containers, orchestrate them with Docker Compose, and configure health checks.',
      difficulty: 'INTERMEDIATE',
      careerSlug: 'cloud-devops-engineer',
      primarySkillSlug: 'docker',
      reinforcedSkillSlugs: ['docker', 'linux', 'networking', 'cloud-fundamentals'],
      technologies: ['Docker', 'Docker Compose', 'Linux', 'Node.js'],
      estimatedHours: 10,
      githubStarterUrl: 'https://github.com/skillpath-templates/docker-compose-starter',
      architectureOverview: 'Multi-container Docker architecture using bridge network isolation, named volume persistence, and environment secrets.',
      learningObjectives: ['Author multi-stage Dockerfiles', 'Orchestrate services with Docker Compose', 'Configure container volumes'],
    },
    {
      title: 'Automated GitHub Actions CI/CD Cloud Pipeline',
      slug: 'automated-github-actions-cicd-cloud-pipeline',
      description: 'Build an automated continuous delivery pipeline running automated unit tests, building Docker images, and deploying to cloud infrastructure.',
      difficulty: 'ADVANCED',
      careerSlug: 'cloud-devops-engineer',
      primarySkillSlug: 'ci-cd',
      reinforcedSkillSlugs: ['ci-cd', 'git', 'aws', 'infrastructure-deployment'],
      technologies: ['GitHub Actions', 'Docker', 'AWS EC2', 'Bash'],
      estimatedHours: 14,
      githubStarterUrl: 'https://github.com/skillpath-templates/cicd-cloud-starter',
      architectureOverview: 'GitHub Actions workflow triggering on pull requests, executing linting/testing jobs, and securely deploying over SSH.',
      learningObjectives: ['Build GitHub Actions workflow YAMLs', 'Manage deployment secrets safely', 'Automate cloud deployments'],
    },
  ];

  let projectsProcessed = 0;

  for (const item of projectCatalog) {
    const primarySkillDoc = skillMap.get(item.primarySkillSlug);
    if (!primarySkillDoc) {
      console.warn(`[Seed] Warning: Primary skill slug '${item.primarySkillSlug}' not found for project '${item.title}'`);
      continue;
    }

    const careerDoc = careerMap.get(item.careerSlug);

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
          careerId: careerDoc?._id,
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

