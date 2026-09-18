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
      url: '/assessment',
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
