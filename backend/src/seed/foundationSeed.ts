import { connectDB, disconnectDB } from '../config/database.js';
import { SkillModel } from '../models/Skill.js';
import { CareerModel } from '../models/Career.js';
import { CareerSkillModel } from '../models/CareerSkill.js';
import { SkillCategory, SkillImportance } from '../types/intelligence.js';

export interface SeedResult {
  skillsProcessed: number;
  careersProcessed: number;
  careerSkillsProcessed: number;
}

export const seedFoundationData = async (): Promise<SeedResult> => {
  // 1. Canonical Skill Definitions
  const skillsData: Array<{ name: string; slug: string; category: SkillCategory; description: string }> = [
    // Web & Core CS
    { name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL', description: 'Core programming language of the web' },
    { name: 'TypeScript', slug: 'typescript', category: 'TECHNICAL', description: 'Typed superset of JavaScript for scalable applications' },
    { name: 'React', slug: 'react', category: 'FRAMEWORK', description: 'Frontend component library for building user interfaces' },
    { name: 'Node.js', slug: 'node-js', category: 'TECHNICAL', description: 'Server-side JavaScript runtime environment' },
    { name: 'Express', slug: 'express', category: 'FRAMEWORK', description: 'Minimalist web framework for Node.js' },
    { name: 'HTML & CSS', slug: 'html-css', category: 'TECHNICAL', description: 'Foundational technologies for structuring and styling web pages' },
    { name: 'REST API', slug: 'rest-api', category: 'CORE_CS', description: 'Representational State Transfer API architecture' },
    { name: 'MongoDB', slug: 'mongodb', category: 'TOOL', description: 'NoSQL document database' },
    { name: 'SQL', slug: 'sql', category: 'TECHNICAL', description: 'Structured Query Language for relational database management' },
    { name: 'Git', slug: 'git', category: 'TOOL', description: 'Distributed version control system' },
    { name: 'Authentication', slug: 'authentication', category: 'CORE_CS', description: 'Identity verification and authorization patterns' },
    { name: 'Problem Solving', slug: 'problem-solving', category: 'SOFT', description: 'Analytical thinking and algorithmic problem solving' },

    // Data Analytics
    { name: 'Python', slug: 'python', category: 'TECHNICAL', description: 'High-level programming language for general computing and data analysis' },
    { name: 'Statistics', slug: 'statistics', category: 'CORE_CS', description: 'Statistical concepts, hypothesis testing, and probability distributions' },
    { name: 'Data Cleaning', slug: 'data-cleaning', category: 'TECHNICAL', description: 'Wrangling, handling missing data, and dataset preprocessing' },
    { name: 'Pandas', slug: 'pandas', category: 'FRAMEWORK', description: 'Python data manipulation and analysis library' },
    { name: 'NumPy', slug: 'numpy', category: 'FRAMEWORK', description: 'Python numerical arrays and mathematical computing library' },
    { name: 'Data Visualization', slug: 'data-visualization', category: 'TECHNICAL', description: 'Charts, plots, and visual storytelling with data' },
    { name: 'Excel', slug: 'excel', category: 'TOOL', description: 'Spreadsheet formulas, pivot tables, and tabular analysis' },
    { name: 'Power BI', slug: 'power-bi', category: 'TOOL', description: 'Business intelligence analytics and dashboard reporting tool' },

    // AI & Machine Learning
    { name: 'Mathematics', slug: 'mathematics', category: 'CORE_CS', description: 'Linear algebra, calculus, and mathematical foundation for AI' },
    { name: 'Machine Learning', slug: 'machine-learning', category: 'TECHNICAL', description: 'Supervised, unsupervised, and reinforcement learning models' },
    { name: 'Data Preprocessing', slug: 'data-preprocessing', category: 'TECHNICAL', description: 'Feature scaling, encoding, and dataset normalization for ML' },
    { name: 'Model Evaluation', slug: 'model-evaluation', category: 'TECHNICAL', description: 'Cross-validation, precision/recall, and performance metrics' },
    { name: 'Deep Learning', slug: 'deep-learning', category: 'TECHNICAL', description: 'Neural networks, backpropagation, and deep learning architectures' },

    // Cybersecurity
    { name: 'Networking', slug: 'networking', category: 'CORE_CS', description: 'TCP/IP, OSI model, routing, DNS, and network protocols' },
    { name: 'Linux', slug: 'linux', category: 'TOOL', description: 'Linux command line, file permissions, and shell administration' },
    { name: 'Operating Systems', slug: 'operating-systems', category: 'CORE_CS', description: 'OS architecture, processes, memory management, and security' },
    { name: 'Security Fundamentals', slug: 'security-fundamentals', category: 'CORE_CS', description: 'CIA triad, threat modeling, and defense-in-depth principles' },
    { name: 'Cryptography', slug: 'cryptography', category: 'CORE_CS', description: 'Symmetric/asymmetric encryption, hashing, and PKI infrastructure' },
    { name: 'Web Security', slug: 'web-security', category: 'TECHNICAL', description: 'OWASP Top 10, XSS, SQLi, and secure web application development' },
    { name: 'Ethical Hacking', slug: 'ethical-hacking', category: 'TECHNICAL', description: 'Penetration testing methodology, reconnaissance, and exploitation' },
    { name: 'Security Tools', slug: 'security-tools', category: 'TOOL', description: 'Network scanners, packet analyzers, and security audit utilities' },

    // Cloud & DevOps
    { name: 'Docker', slug: 'docker', category: 'TOOL', description: 'Containerization, Dockerfiles, images, and container orchestration' },
    { name: 'CI/CD', slug: 'ci-cd', category: 'TOOL', description: 'Continuous integration and continuous deployment pipelines' },
    { name: 'Cloud Fundamentals', slug: 'cloud-fundamentals', category: 'CORE_CS', description: 'Cloud architecture, IaaS/PaaS/SaaS models, and virtualization' },
    { name: 'AWS', slug: 'aws', category: 'TOOL', description: 'Amazon Web Services cloud computing suite' },
    { name: 'Infrastructure & Deployment', slug: 'infrastructure-deployment', category: 'TECHNICAL', description: 'Server provisioning, environment setup, and deployment management' },
  ];

  // Idempotent Skill Upserts
  const skillDocsMap = new Map<string, any>();
  for (const skill of skillsData) {
    const doc = await SkillModel.findOneAndUpdate(
      { slug: skill.slug },
      { $set: skill },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
    skillDocsMap.set(skill.slug, doc);
  }

  // 2. Career Definitions (Core 7 Hackathon Catalog)
  const careersData: Array<{
    title: string;
    slug: string;
    description: string;
    category: string;
    isActive: boolean;
  }> = [
    {
      title: 'Full Stack Developer',
      slug: 'full-stack-developer',
      description: 'Designs and builds modern end-to-end web applications combining frontend UIs, backend APIs, and databases.',
      category: 'Web Development',
      isActive: true,
    },
    {
      title: 'Frontend Developer',
      slug: 'frontend-developer',
      description: 'Builds responsive, accessible, high-performance web user interfaces using modern JavaScript, HTML/CSS, and component frameworks.',
      category: 'Web Development',
      isActive: true,
    },
    {
      title: 'Backend Developer',
      slug: 'backend-developer',
      description: 'Architects robust server-side APIs, database schemas, business logic, authentication systems, and cloud backend microservices.',
      category: 'Web Development',
      isActive: true,
    },
    {
      title: 'Data Analyst',
      slug: 'data-analyst',
      description: 'Transforms raw datasets into actionable insights using SQL, Python, statistical analysis, and visual dashboards.',
      category: 'Data & Analytics',
      isActive: true,
    },
    {
      title: 'AI/ML Engineer',
      slug: 'ai-ml-engineer',
      description: 'Develops intelligent predictive systems, trains machine learning models, and deploys scalable AI applications.',
      category: 'Artificial Intelligence',
      isActive: true,
    },
    {
      title: 'Cybersecurity Analyst',
      slug: 'cybersecurity-analyst',
      description: 'Protects systems and network infrastructure, conducts security audits, analyzes vulnerabilities, and defends against cyber threats.',
      category: 'Cybersecurity',
      isActive: true,
    },
    {
      title: 'Cloud/DevOps Engineer',
      slug: 'cloud-devops-engineer',
      description: 'Automates cloud infrastructure, manages containerized deployments, builds CI/CD pipelines, and ensures platform reliability.',
      category: 'Cloud Infrastructure',
      isActive: true,
    },
  ];

  const careerDocsMap = new Map<string, any>();
  for (const career of careersData) {
    const doc = await CareerModel.findOneAndUpdate(
      { slug: career.slug },
      { $set: career },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
    careerDocsMap.set(career.slug, doc);
  }

  // 3. CareerSkill Requirement Mappings for all 7 Careers
  const careerMappingsMap: Record<
    string,
    Array<{
      skillSlug: string;
      requiredLevel: number;
      importance: SkillImportance;
      prerequisiteSlugs: string[];
    }>
  > = {
    'full-stack-developer': [
      { skillSlug: 'javascript', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: [] },
      { skillSlug: 'html-css', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: [] },
      { skillSlug: 'react', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: ['javascript', 'html-css'] },
      { skillSlug: 'node-js', requiredLevel: 75, importance: 'HIGH', prerequisiteSlugs: ['javascript'] },
      { skillSlug: 'express', requiredLevel: 75, importance: 'HIGH', prerequisiteSlugs: ['node-js'] },
      { skillSlug: 'rest-api', requiredLevel: 80, importance: 'CRITICAL', prerequisiteSlugs: ['express'] },
      { skillSlug: 'mongodb', requiredLevel: 70, importance: 'HIGH', prerequisiteSlugs: ['express'] },
      { skillSlug: 'authentication', requiredLevel: 75, importance: 'CRITICAL', prerequisiteSlugs: ['express', 'rest-api'] },
      { skillSlug: 'git', requiredLevel: 75, importance: 'MEDIUM', prerequisiteSlugs: [] },
      { skillSlug: 'problem-solving', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: [] },
    ],
    'frontend-developer': [
      { skillSlug: 'html-css', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: [] },
      { skillSlug: 'javascript', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: [] },
      { skillSlug: 'typescript', requiredLevel: 75, importance: 'HIGH', prerequisiteSlugs: ['javascript'] },
      { skillSlug: 'react', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: ['javascript', 'html-css'] },
      { skillSlug: 'rest-api', requiredLevel: 70, importance: 'HIGH', prerequisiteSlugs: ['javascript'] },
      { skillSlug: 'git', requiredLevel: 75, importance: 'MEDIUM', prerequisiteSlugs: [] },
      { skillSlug: 'problem-solving', requiredLevel: 75, importance: 'HIGH', prerequisiteSlugs: [] },
    ],
    'backend-developer': [
      { skillSlug: 'javascript', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: [] },
      { skillSlug: 'node-js', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: ['javascript'] },
      { skillSlug: 'express', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: ['node-js'] },
      { skillSlug: 'rest-api', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: ['express'] },
      { skillSlug: 'sql', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: [] },
      { skillSlug: 'mongodb', requiredLevel: 75, importance: 'HIGH', prerequisiteSlugs: ['express'] },
      { skillSlug: 'authentication', requiredLevel: 80, importance: 'CRITICAL', prerequisiteSlugs: ['express', 'rest-api'] },
      { skillSlug: 'git', requiredLevel: 75, importance: 'MEDIUM', prerequisiteSlugs: [] },
    ],
    'data-analyst': [
      { skillSlug: 'sql', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: [] },
      { skillSlug: 'python', requiredLevel: 80, importance: 'CRITICAL', prerequisiteSlugs: [] },
      { skillSlug: 'excel', requiredLevel: 75, importance: 'MEDIUM', prerequisiteSlugs: [] },
      { skillSlug: 'statistics', requiredLevel: 75, importance: 'HIGH', prerequisiteSlugs: [] },
      { skillSlug: 'pandas', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: ['python'] },
      { skillSlug: 'numpy', requiredLevel: 70, importance: 'MEDIUM', prerequisiteSlugs: ['python'] },
      { skillSlug: 'data-cleaning', requiredLevel: 75, importance: 'HIGH', prerequisiteSlugs: ['pandas'] },
      { skillSlug: 'data-visualization', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: ['pandas'] },
      { skillSlug: 'power-bi', requiredLevel: 70, importance: 'MEDIUM', prerequisiteSlugs: ['data-visualization'] },
    ],
    'ai-ml-engineer': [
      { skillSlug: 'python', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: [] },
      { skillSlug: 'mathematics', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: [] },
      { skillSlug: 'statistics', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: ['mathematics'] },
      { skillSlug: 'numpy', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: ['python'] },
      { skillSlug: 'pandas', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: ['python'] },
      { skillSlug: 'data-preprocessing', requiredLevel: 75, importance: 'HIGH', prerequisiteSlugs: ['pandas'] },
      { skillSlug: 'machine-learning', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: ['python', 'statistics', 'numpy'] },
      { skillSlug: 'model-evaluation', requiredLevel: 75, importance: 'HIGH', prerequisiteSlugs: ['machine-learning'] },
      { skillSlug: 'deep-learning', requiredLevel: 70, importance: 'MEDIUM', prerequisiteSlugs: ['machine-learning'] },
    ],
    'cybersecurity-analyst': [
      { skillSlug: 'operating-systems', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: [] },
      { skillSlug: 'linux', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: ['operating-systems'] },
      { skillSlug: 'networking', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: [] },
      { skillSlug: 'security-fundamentals', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: ['networking'] },
      { skillSlug: 'cryptography', requiredLevel: 70, importance: 'MEDIUM', prerequisiteSlugs: ['security-fundamentals'] },
      { skillSlug: 'web-security', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: ['security-fundamentals'] },
      { skillSlug: 'ethical-hacking', requiredLevel: 75, importance: 'HIGH', prerequisiteSlugs: ['web-security', 'linux'] },
      { skillSlug: 'security-tools', requiredLevel: 75, importance: 'MEDIUM', prerequisiteSlugs: ['linux'] },
    ],
    'cloud-devops-engineer': [
      { skillSlug: 'linux', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: [] },
      { skillSlug: 'networking', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: [] },
      { skillSlug: 'git', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: [] },
      { skillSlug: 'cloud-fundamentals', requiredLevel: 80, importance: 'CRITICAL', prerequisiteSlugs: ['networking'] },
      { skillSlug: 'docker', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: ['linux'] },
      { skillSlug: 'ci-cd', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: ['docker', 'git'] },
      { skillSlug: 'aws', requiredLevel: 75, importance: 'HIGH', prerequisiteSlugs: ['cloud-fundamentals'] },
      { skillSlug: 'infrastructure-deployment', requiredLevel: 75, importance: 'HIGH', prerequisiteSlugs: ['docker', 'cloud-fundamentals'] },
    ],
  };

  let careerSkillsCount = 0;

  for (const [careerSlug, mappings] of Object.entries(careerMappingsMap)) {
    const careerDoc = careerDocsMap.get(careerSlug);
    if (!careerDoc) continue;

    for (const mapping of mappings) {
      const skillDoc = skillDocsMap.get(mapping.skillSlug);
      if (!skillDoc) continue;

      const prereqIds = mapping.prerequisiteSlugs
        .map((slug) => skillDocsMap.get(slug)?._id)
        .filter((id) => Boolean(id));

      await CareerSkillModel.findOneAndUpdate(
        { careerId: careerDoc._id, skillId: skillDoc._id },
        {
          $set: {
            careerId: careerDoc._id,
            skillId: skillDoc._id,
            requiredLevel: mapping.requiredLevel,
            importance: mapping.importance,
            weight: 1.0,
            prerequisites: prereqIds,
          },
        },
        { upsert: true, returnDocument: 'after', runValidators: true }
      );
      careerSkillsCount++;
    }
  }

  return {
    skillsProcessed: skillDocsMap.size,
    careersProcessed: careerDocsMap.size,
    careerSkillsProcessed: careerSkillsCount,
  };
};

// Executable runner when called directly via CLI
if (typeof require !== 'undefined' && require.main === module) {
  connectDB()
    .then(async () => {
      console.log('Running foundation seed script...');
      const result = await seedFoundationData();
      console.log('Seed executed successfully:', result);
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Foundation seed failed:', err);
      process.exit(1);
    });
}

