import { connectDB, disconnectDB } from '../config/database.js';
import { SkillModel } from '../models/Skill.js';
import { ResourceModel } from '../models/Resource.js';
import { ResourceType, ResourceDifficulty } from '../types/intelligence.js';

export interface ResourceSeedResult {
  resourcesProcessed: number;
}

export const seedResourceData = async (): Promise<ResourceSeedResult> => {
  // 1. Load canonical skills map by slug
  const skills = await SkillModel.find().lean();
  const skillMap = new Map<string, any>();
  for (const s of skills) {
    skillMap.set(s.slug, s);
  }

  // 2. Define curated 20+ demo resources
  const resourceCatalog: Array<{
    title: string;
    slug: string;
    description: string;
    url: string;
    type: ResourceType;
    provider: string;
    skillSlug: string;
    difficulty: ResourceDifficulty;
    estimatedDuration: string;
    rating: number;
    authorOrInstructor?: string;
    isPaid: boolean;
    tags: string[];
  }> = [
    // JavaScript Resources
    {
      title: 'JavaScript Fundamentals: Arrays, Functions & Callbacks',
      slug: 'javascript-fundamentals-arrays-functions',
      description: 'Master functional patterns, immutable data manipulation, array transformation methods, and lexical scope.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
      type: 'COURSE',
      provider: 'SkillPath Core',
      skillSlug: 'javascript',
      difficulty: 'BEGINNER',
      estimatedDuration: '2.5 hours',
      rating: 4.9,
      authorOrInstructor: 'MDN & SkillPath Team',
      isPaid: false,
      tags: ['javascript', 'es6', 'functions', 'arrays'],
    },
    {
      title: 'Deep Dive into Asynchronous JavaScript & Promises',
      slug: 'async-javascript-promises-async-await',
      description: 'Complete guide to event loop, microtasks, Macrotasks, Promise chaining, and async/await error handling.',
      url: 'https://javascript.info/async',
      type: 'ARTICLE',
      provider: 'JavaScript.info',
      skillSlug: 'javascript',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '1.5 hours',
      rating: 4.8,
      authorOrInstructor: 'Ilya Kantor',
      isPaid: false,
      tags: ['javascript', 'async', 'promises', 'event-loop'],
    },
    {
      title: 'JavaScript Closures and Scope Masterclass',
      slug: 'javascript-closures-scope-masterclass',
      description: 'Understand execution contexts, lexical environment, variable shadowing, and closure memory mechanics.',
      url: 'https://frontendmasters.com/courses/deep-javascript-v3/',
      type: 'VIDEO',
      provider: 'Frontend Masters',
      skillSlug: 'javascript',
      difficulty: 'ADVANCED',
      estimatedDuration: '3.0 hours',
      rating: 4.9,
      authorOrInstructor: 'Kyle Simpson',
      isPaid: true,
      tags: ['javascript', 'closures', 'scope', 'advanced'],
    },

    // React Resources
    {
      title: 'React 19 Component Architecture & Hook Primitives',
      slug: 'react-19-component-architecture-hooks',
      description: 'Learn how to build reusable, accessible UI components with pure render logic, useEffect guardrails, and custom hooks.',
      url: 'https://react.dev/learn',
      type: 'DOCUMENTATION',
      provider: 'Official React Documentation',
      skillSlug: 'react',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '4.0 hours',
      rating: 5.0,
      authorOrInstructor: 'React Core Team',
      isPaid: false,
      tags: ['react', 'hooks', 'components', 'frontend'],
    },
    {
      title: 'State Management in React: Context vs Redux vs Zustand',
      slug: 'react-state-management-comparison',
      description: 'Architectural breakdown of local component state, prop drilling solutions, global state stores, and selector optimization.',
      url: 'https://react.dev/learn/managing-state',
      type: 'ARTICLE',
      provider: 'React Guides',
      skillSlug: 'react',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '1.0 hour',
      rating: 4.7,
      authorOrInstructor: 'Dan Abramov',
      isPaid: false,
      tags: ['react', 'state', 'zustand', 'context'],
    },
    {
      title: 'React Performance Optimization & Memoization',
      slug: 'react-performance-optimization-memoization',
      description: 'Prevent unnecessary re-renders with useMemo, useCallback, React.memo, code splitting, and dynamic imports.',
      url: 'https://kentcdodds.com/blog/usememo-and-usecallback',
      type: 'ARTICLE',
      provider: 'Kent C. Dodds Blog',
      skillSlug: 'react',
      difficulty: 'ADVANCED',
      estimatedDuration: '45 mins',
      rating: 4.9,
      authorOrInstructor: 'Kent C. Dodds',
      isPaid: false,
      tags: ['react', 'performance', 'memoization', 'optimization'],
    },

    // Node.js Resources
    {
      title: 'Node.js Runtime Architecture & Event Loop',
      slug: 'nodejs-runtime-architecture-event-loop',
      description: 'Comprehensive guide to libuv, event loop phases, thread pool workers, and non-blocking I/O operations.',
      url: 'https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/',
      type: 'DOCUMENTATION',
      provider: 'Node.js Official Docs',
      skillSlug: 'node-js',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '2.0 hours',
      rating: 4.8,
      authorOrInstructor: 'Node.js Foundation',
      isPaid: false,
      tags: ['node', 'event-loop', 'backend', 'runtime'],
    },
    {
      title: 'Building Production Node.js CLI & Background Services',
      slug: 'building-production-nodejs-cli-background-services',
      description: 'Step-by-step tutorial creating robust Node.js console utilities, process signal handling, and logging.',
      url: 'https://nodejs.dev/learn',
      type: 'COURSE',
      provider: 'OpenJS Foundation',
      skillSlug: 'node-js',
      difficulty: 'BEGINNER',
      estimatedDuration: '3.0 hours',
      rating: 4.6,
      authorOrInstructor: 'Node.js Contributors',
      isPaid: false,
      tags: ['node', 'cli', 'process', 'backend'],
    },

    // Express Resources
    {
      title: 'Express.js Middleware Architecture & Error Handling',
      slug: 'expressjs-middleware-architecture-error-handling',
      description: 'Master Express pipeline flow, custom request validators, error handlers, and router modularization.',
      url: 'https://expressjs.com/en/guide/using-middleware.html',
      type: 'DOCUMENTATION',
      provider: 'Express.js Official Docs',
      skillSlug: 'express',
      difficulty: 'BEGINNER',
      estimatedDuration: '1.5 hours',
      rating: 4.7,
      authorOrInstructor: 'Express.js Team',
      isPaid: false,
      tags: ['express', 'middleware', 'routing', 'backend'],
    },
    {
      title: 'Secure Express API Rate Limiting & Helmet Guardrails',
      slug: 'secure-express-api-rate-limiting-helmet',
      description: 'Production readiness guide configuring CORS, rate limiting, security HTTP headers, and body parser sanitization.',
      url: 'https://expressjs.com/en/advanced/best-practice-security.html',
      type: 'ARTICLE',
      provider: 'OWASP & Express Security',
      skillSlug: 'express',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '1.0 hour',
      rating: 4.9,
      authorOrInstructor: 'OWASP Foundation',
      isPaid: false,
      tags: ['express', 'security', 'cors', 'helmet'],
    },

    // MongoDB Resources
    {
      title: 'MongoDB Data Modeling & Mongoose Schema Design',
      slug: 'mongodb-data-modeling-mongoose-schema-design',
      description: 'Learn embedding vs referencing strategies, schema validations, population vs aggregations, and virtual fields.',
      url: 'https://university.mongodb.com/',
      type: 'COURSE',
      provider: 'MongoDB University',
      skillSlug: 'mongodb',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '4.0 hours',
      rating: 4.9,
      authorOrInstructor: 'MongoDB Education',
      isPaid: false,
      tags: ['mongodb', 'mongoose', 'nosql', 'database'],
    },
    {
      title: 'MongoDB Aggregation Pipeline Mastery',
      slug: 'mongodb-aggregation-pipeline-mastery',
      description: 'Build complex analytical queries using $match, $group, $lookup, $project, $unwind, and indexing strategies.',
      url: 'https://docs.mongodb.com/manual/aggregation/',
      type: 'DOCUMENTATION',
      provider: 'MongoDB Documentation',
      skillSlug: 'mongodb',
      difficulty: 'ADVANCED',
      estimatedDuration: '2.5 hours',
      rating: 4.8,
      authorOrInstructor: 'MongoDB Engineering',
      isPaid: false,
      tags: ['mongodb', 'aggregation', 'indexing', 'performance'],
    },

    // REST API Resources
    {
      title: 'REST API Consumption & Async Data Handling Lab',
      slug: 'rest-api-consumption-async-data-handling-lab',
      description: 'Hands-on practice connecting Axios clients to backend endpoints, handling loading spinners, error states, and debounce.',
      url: 'https://restfulapi.net/',
      type: 'PRACTICE',
      provider: 'SkillPath Labs',
      skillSlug: 'rest-api',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '1.5 hours',
      rating: 4.8,
      authorOrInstructor: 'SkillPath Core Team',
      isPaid: false,
      tags: ['api', 'rest', 'axios', 'http'],
    },
    {
      title: 'RESTful API Design Standards & HTTP Status Codes',
      slug: 'restful-api-design-standards-http-status-codes',
      description: 'Complete reference for idempotent methods, RESTful resource URI design, JSON error schemas, and versioning.',
      url: 'https://swagger.io/resources/articles/best-practices-in-api-design/',
      type: 'ARTICLE',
      provider: 'Swagger API Docs',
      skillSlug: 'rest-api',
      difficulty: 'BEGINNER',
      estimatedDuration: '45 mins',
      rating: 4.7,
      authorOrInstructor: 'OpenAPI Initiative',
      isPaid: false,
      tags: ['api', 'rest', 'design', 'http'],
    },

    // Git Resources
    {
      title: 'Git Branching & Collaborative GitHub Workflows',
      slug: 'git-branching-collaborative-github-workflows',
      description: 'Interactive exercises for resolving merge conflicts, rebasing feature branches, and writing standard pull requests.',
      url: 'https://git-scm.com/book/en/v2',
      type: 'PRACTICE',
      provider: 'GitHub Education',
      skillSlug: 'git',
      difficulty: 'BEGINNER',
      estimatedDuration: '1.5 hours',
      rating: 4.8,
      authorOrInstructor: 'Scott Chacon & Ben Straub',
      isPaid: false,
      tags: ['git', 'github', 'version-control', 'collaboration'],
    },
    {
      title: 'Advanced Git: Interactive Rebase, Bisect & Stash',
      slug: 'advanced-git-interactive-rebase-bisect-stash',
      description: 'Master commit squashing, reflog recovery, git bisect debugging, and cherry-picking commits across branches.',
      url: 'https://git-scm.com/docs',
      type: 'DOCUMENTATION',
      provider: 'Git Official Reference',
      skillSlug: 'git',
      difficulty: 'ADVANCED',
      estimatedDuration: '2.0 hours',
      rating: 4.9,
      authorOrInstructor: 'Git Maintainers',
      isPaid: false,
      tags: ['git', 'rebase', 'stash', 'bisect'],
    },

    // Authentication Resources
    {
      title: 'JWT Authentication & Refresh Token Security Patterns',
      slug: 'jwt-authentication-refresh-token-security-patterns',
      description: 'In-depth guide implementing JSON Web Tokens, HTTP-only cookie storage, token revocation, and bcrypt hashing.',
      url: 'https://jwt.io/introduction',
      type: 'COURSE',
      provider: 'Auth0 Academy',
      skillSlug: 'authentication',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '2.5 hours',
      rating: 4.9,
      authorOrInstructor: 'Auth0 Engineering',
      isPaid: false,
      tags: ['authentication', 'jwt', 'security', 'bcrypt'],
    },
    {
      title: 'OAuth 2.0 & OpenID Connect Fundamentals',
      slug: 'oauth-20-openid-connect-fundamentals',
      description: 'Understand authorization grants, bearer tokens, identity providers, authorization servers, and PKCE flow.',
      url: 'https://oauth.net/2/',
      type: 'DOCUMENTATION',
      provider: 'OAuth Working Group',
      skillSlug: 'authentication',
      difficulty: 'ADVANCED',
      estimatedDuration: '3.0 hours',
      rating: 4.8,
      authorOrInstructor: 'IETF OAuth WG',
      isPaid: false,
      tags: ['oauth', 'authentication', 'security', 'oidc'],
    },

    // Problem Solving Resources
    {
      title: 'Algorithmic Thinking & Problem Decomposition',
      slug: 'algorithmic-thinking-problem-decomposition',
      description: 'Practical guide to breaking complex requirements into algorithmic steps, time complexity analysis, and edge cases.',
      url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
      type: 'COURSE',
      provider: 'MIT OpenCourseWare',
      skillSlug: 'problem-solving',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '5.0 hours',
      rating: 5.0,
      authorOrInstructor: 'MIT CS Department',
      isPaid: false,
      tags: ['problem-solving', 'algorithms', 'cs-core', 'logic'],
    },
    {
      title: 'Frontend Developer Diagnostic Evaluation Quiz',
      slug: 'frontend-developer-diagnostic-evaluation-quiz',
      description: '20 rapid-fire questions benchmarked against technical hiring standards to verify your core web understanding.',
      url: 'https://developer.mozilla.org/en-US/docs/Learn',
      type: 'QUIZ',
      provider: 'SkillPath Assessment',
      skillSlug: 'problem-solving',
      difficulty: 'BEGINNER',
      estimatedDuration: '15 mins',
      rating: 4.9,
      authorOrInstructor: 'SkillPath Assessment Team',
      isPaid: false,
      tags: ['quiz', 'assessment', 'problem-solving', 'web'],
    },

    // Python & Data Science Resources
    {
      title: 'Official Python Tutorial & Standard Library Guide',
      slug: 'official-python-tutorial-standard-library-guide',
      description: 'Comprehensive introduction to Python syntax, control flow, functions, data structures, and module organization.',
      url: 'https://docs.python.org/3/tutorial/',
      type: 'DOCUMENTATION',
      provider: 'Python Software Foundation',
      skillSlug: 'python',
      difficulty: 'BEGINNER',
      estimatedDuration: '4.0 hours',
      rating: 4.9,
      authorOrInstructor: 'Guido van Rossum & Python Docs Team',
      isPaid: false,
      tags: ['python', 'basics', 'programming'],
    },
    {
      title: 'Pandas Data Analysis & Manipulation User Guide',
      slug: 'pandas-data-analysis-manipulation-user-guide',
      description: 'Learn DataFrames, Series indexing, data cleaning, aggregation, reshaping, and merging tabular datasets.',
      url: 'https://pandas.pydata.org/docs/user_guide/index.html',
      type: 'DOCUMENTATION',
      provider: 'Pandas Development Team',
      skillSlug: 'pandas',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '3.5 hours',
      rating: 4.9,
      authorOrInstructor: 'Wes McKinney & Pandas Contributors',
      isPaid: false,
      tags: ['pandas', 'python', 'data-science'],
    },
    {
      title: 'NumPy Array Computing for Absolute Beginners',
      slug: 'numpy-array-computing-absolute-beginners',
      description: 'Master multi-dimensional arrays, vectorization, array slicing, broadcasting, and numerical computing.',
      url: 'https://numpy.org/doc/stable/user/absolute_beginners.html',
      type: 'DOCUMENTATION',
      provider: 'NumPy Documentation',
      skillSlug: 'numpy',
      difficulty: 'BEGINNER',
      estimatedDuration: '2.0 hours',
      rating: 4.8,
      authorOrInstructor: 'NumPy Developers',
      isPaid: false,
      tags: ['numpy', 'python', 'math'],
    },
    {
      title: 'Introductory Statistics & Probability Guide',
      slug: 'introductory-statistics-probability-guide',
      description: 'Covers descriptive statistics, probability distributions, hypothesis testing, confidence intervals, and regression.',
      url: 'https://openstax.org/details/books/introductory-statistics',
      type: 'BOOK',
      provider: 'OpenStax',
      skillSlug: 'statistics',
      difficulty: 'BEGINNER',
      estimatedDuration: '6.0 hours',
      rating: 4.8,
      authorOrInstructor: 'Barbara Illowsky & Susan Dean',
      isPaid: false,
      tags: ['statistics', 'math', 'data-science'],
    },
    {
      title: 'Data Cleaning & Preprocessing Best Practices',
      slug: 'data-cleaning-preprocessing-best-practices',
      description: 'Handling missing values, outlier detection, data normalization, categorical encoding, and feature transformation.',
      url: 'https://pandas.pydata.org/docs/user_guide/reshaping.html',
      type: 'ARTICLE',
      provider: 'Pandas Guides',
      skillSlug: 'data-cleaning',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '2.0 hours',
      rating: 4.7,
      authorOrInstructor: 'Data Science Core Team',
      isPaid: false,
      tags: ['data-cleaning', 'pandas', 'python'],
    },
    {
      title: 'Data Visualization with Matplotlib & Seaborn',
      slug: 'data-visualization-matplotlib-seaborn',
      description: 'Create publication-quality line charts, scatter plots, histograms, heatmaps, and customized subplots.',
      url: 'https://matplotlib.org/stable/tutorials/index.html',
      type: 'COURSE',
      provider: 'Matplotlib Org',
      skillSlug: 'data-visualization',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '3.0 hours',
      rating: 4.8,
      authorOrInstructor: 'John Hunter & Matplotlib Team',
      isPaid: false,
      tags: ['visualization', 'matplotlib', 'python'],
    },

    // AI/ML Resources
    {
      title: 'Linear Algebra for Machine Learning',
      slug: 'linear-algebra-machine-learning',
      description: 'Vectors, matrices, eigenvalues, eigenvectors, matrix factorization, and SVD in machine learning.',
      url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/',
      type: 'COURSE',
      provider: 'MIT OpenCourseWare',
      skillSlug: 'mathematics',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '8.0 hours',
      rating: 5.0,
      authorOrInstructor: 'Gilbert Strang',
      isPaid: false,
      tags: ['math', 'linear-algebra', 'ai'],
    },
    {
      title: 'Scikit-Learn Supervised & Unsupervised ML Tutorial',
      slug: 'scikit-learn-supervised-unsupervised-ml-tutorial',
      description: 'Practical introduction to classification, regression, clustering, decision trees, and ensemble methods.',
      url: 'https://scikit-learn.org/stable/tutorial/index.html',
      type: 'DOCUMENTATION',
      provider: 'Scikit-Learn Developers',
      skillSlug: 'machine-learning',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '4.5 hours',
      rating: 4.9,
      authorOrInstructor: 'INRIA Scikit-Learn Team',
      isPaid: false,
      tags: ['machine-learning', 'python', 'scikit-learn'],
    },
    {
      title: 'Deep Learning Book by Ian Goodfellow',
      slug: 'deep-learning-book-ian-goodfellow',
      description: 'Definitive textbook covering neural networks, backpropagation, CNNs, RNNs, and deep generative models.',
      url: 'https://www.deeplearningbook.org/',
      type: 'BOOK',
      provider: 'MIT Press',
      skillSlug: 'deep-learning',
      difficulty: 'ADVANCED',
      estimatedDuration: '10.0 hours',
      rating: 4.9,
      authorOrInstructor: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
      isPaid: false,
      tags: ['deep-learning', 'ai', 'neural-networks'],
    },

    // Cybersecurity Resources
    {
      title: 'Linux Command Line Administration Journey',
      slug: 'linux-command-line-administration-journey',
      description: 'Hands-on guide to Linux CLI navigation, file management, permissions, process management, and bash scripts.',
      url: 'https://linuxjourney.com/',
      type: 'COURSE',
      provider: 'Linux Journey',
      skillSlug: 'linux',
      difficulty: 'BEGINNER',
      estimatedDuration: '3.5 hours',
      rating: 4.9,
      authorOrInstructor: 'Community Open Access',
      isPaid: false,
      tags: ['linux', 'sysadmin', 'command-line'],
    },
    {
      title: 'Computer Networking & Protocols Fundamentals',
      slug: 'computer-networking-protocols-fundamentals',
      description: 'Understand TCP/IP, UDP, HTTP/S, DNS, IP addressing, subnetting, and network packet routing.',
      url: 'https://www.cloudflare.com/learning/network-layer/what-is-the-network-layer/',
      type: 'ARTICLE',
      provider: 'Cloudflare Learning Center',
      skillSlug: 'networking',
      difficulty: 'BEGINNER',
      estimatedDuration: '2.5 hours',
      rating: 4.8,
      authorOrInstructor: 'Cloudflare Technical Team',
      isPaid: false,
      tags: ['networking', 'tcp-ip', 'protocols'],
    },
    {
      title: 'OWASP Top 10 Web Application Security Cheat Sheet',
      slug: 'owasp-top-10-web-application-security-cheat-sheet',
      description: 'Comprehensive guide to mitigating injection vulnerabilities, broken authentication, XSS, and security misconfigurations.',
      url: 'https://cheatsheetseries.owasp.org/',
      type: 'DOCUMENTATION',
      provider: 'OWASP Foundation',
      skillSlug: 'web-security',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '2.0 hours',
      rating: 5.0,
      authorOrInstructor: 'OWASP Core Contributors',
      isPaid: false,
      tags: ['security', 'owasp', 'web-security'],
    },

    // Cloud & DevOps Resources
    {
      title: 'Docker Containerization Getting Started Guide',
      slug: 'docker-containerization-getting-started-guide',
      description: 'Learn Docker container creation, image caching, multi-stage Dockerfiles, and container networking.',
      url: 'https://docs.docker.com/get-started/',
      type: 'DOCUMENTATION',
      provider: 'Docker Inc.',
      skillSlug: 'docker',
      difficulty: 'BEGINNER',
      estimatedDuration: '3.0 hours',
      rating: 4.9,
      authorOrInstructor: 'Docker Docs Engineering',
      isPaid: false,
      tags: ['docker', 'devops', 'containers'],
    },
    {
      title: 'GitHub Actions CI/CD Pipeline Automation',
      slug: 'github-actions-cicd-pipeline-automation',
      description: 'Automate build pipelines, test execution, container pushing, and cloud server deployment workflows.',
      url: 'https://docs.github.com/en/actions',
      type: 'DOCUMENTATION',
      provider: 'GitHub Documentation',
      skillSlug: 'ci-cd',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '2.5 hours',
      rating: 4.9,
      authorOrInstructor: 'GitHub Team',
      isPaid: false,
      tags: ['ci-cd', 'github-actions', 'devops'],
    },
    {
      title: 'AWS Cloud Practitioner & Architecture Fundamentals',
      slug: 'aws-cloud-practitioner-architecture-fundamentals',
      description: 'Core overview of Amazon Web Services: EC2, S3, RDS, IAM, VPC, and Serverless Lambda computing.',
      url: 'https://aws.amazon.com/getting-started/',
      type: 'COURSE',
      provider: 'Amazon Web Services',
      skillSlug: 'aws',
      difficulty: 'BEGINNER',
      estimatedDuration: '4.0 hours',
      rating: 4.8,
      authorOrInstructor: 'AWS Training & Certification',
      isPaid: false,
      tags: ['aws', 'cloud', 'devops'],
    },
  ];

  let resourcesProcessed = 0;


  for (const item of resourceCatalog) {
    const skillDoc = skillMap.get(item.skillSlug);
    if (!skillDoc) {
      console.warn(`[Seed] Warning: Skill slug '${item.skillSlug}' not found for resource '${item.title}'`);
      continue;
    }

    await ResourceModel.findOneAndUpdate(
      { slug: item.slug },
      {
        $set: {
          title: item.title,
          slug: item.slug,
          description: item.description,
          url: item.url,
          type: item.type,
          provider: item.provider,
          skillId: skillDoc._id,
          skillTag: item.skillSlug,
          difficulty: item.difficulty,
          estimatedDuration: item.estimatedDuration,
          rating: item.rating,
          authorOrInstructor: item.authorOrInstructor,
          isPaid: item.isPaid,
          tags: item.tags,
        },
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    resourcesProcessed++;
  }

  return { resourcesProcessed };
};

// Standalone runner CLI
if (typeof require !== 'undefined' && require.main === module) {
  connectDB()
    .then(async () => {
      console.log('Running resource seed script...');
      const result = await seedResourceData();
      console.log('Resource seed executed successfully:', result);
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Resource seed failed:', err);
      process.exit(1);
    });
}
