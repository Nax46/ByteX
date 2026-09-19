import { connectDB, disconnectDB } from '../config/database.js';
import { SkillModel } from '../models/Skill.js';
import { CareerModel } from '../models/Career.js';
import { CareerSkillModel } from '../models/CareerSkill.js';
import { AssessmentModel } from '../models/Assessment.js';
import { QuestionModel } from '../models/Question.js';
import { QuestionDifficulty } from '../types/assessment.js';

export interface AssessmentSeedResult {
  assessmentsProcessed: number;
  questionsProcessed: number;
  skillsCoveredCount: number;
}

export const seedAssessmentData = async (): Promise<AssessmentSeedResult> => {
  // 1. Fetch Skill & Career References
  const skills = await SkillModel.find({});
  if (skills.length === 0) {
    throw new Error('No skills found. Please run foundationSeed first.');
  }

  const skillMap = new Map<string, any>();
  skills.forEach((s) => skillMap.set(s.slug, s));

  const careers = await CareerModel.find({});
  const careerMap = new Map<string, any>();
  careers.forEach((c) => careerMap.set(c.slug, c));

  // 2. Idempotent Diagnostic Assessment Definitions for all 7 careers
  const careerDiagnosticSpecs = [
    { slug: 'full-stack-developer', title: 'Full Stack Developer Diagnostic Assessment', assessmentSlug: 'full-stack-developer-diagnostic' },
    { slug: 'frontend-developer', title: 'Frontend Developer Diagnostic Assessment', assessmentSlug: 'frontend-developer-diagnostic' },
    { slug: 'backend-developer', title: 'Backend Developer Diagnostic Assessment', assessmentSlug: 'backend-developer-diagnostic' },
    { slug: 'data-analyst', title: 'Data Analyst Diagnostic Assessment', assessmentSlug: 'data-analyst-diagnostic' },
    { slug: 'ai-ml-engineer', title: 'AI/ML Engineer Diagnostic Assessment', assessmentSlug: 'ai-ml-engineer-diagnostic' },
    { slug: 'cybersecurity-analyst', title: 'Cybersecurity Analyst Diagnostic Assessment', assessmentSlug: 'cybersecurity-analyst-diagnostic' },
    { slug: 'cloud-devops-engineer', title: 'Cloud/DevOps Engineer Diagnostic Assessment', assessmentSlug: 'cloud-devops-engineer-diagnostic' },
  ];

  const assessmentDocMap = new Map<string, any>();
  let assessmentsProcessedCount = 0;

  for (const spec of careerDiagnosticSpecs) {
    const careerDoc = careerMap.get(spec.slug);
    if (!careerDoc) continue;

    const careerSkills = await CareerSkillModel.find({ careerId: careerDoc._id });
    const targetSkillIds = careerSkills.map((cs) => cs.skillId);

    const doc = await AssessmentModel.findOneAndUpdate(
      { slug: spec.assessmentSlug },
      {
        $set: {
          title: spec.title,
          slug: spec.assessmentSlug,
          type: 'DIAGNOSTIC',
          description: `Comprehensive diagnostic evaluation covering core skills for ${spec.title.replace(' Diagnostic Assessment', '')}.`,
          targetCareerId: careerDoc._id,
          targetSkillIds,
          durationMinutes: 45,
          version: 1,
          isActive: true,
        },
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
    assessmentDocMap.set(spec.slug, doc);
    assessmentsProcessedCount++;
  }

  // Fallback diagnostic assessment for general skill evaluations
  const defaultDiagnostic = assessmentDocMap.get('full-stack-developer') || Array.from(assessmentDocMap.values())[0];

  // 3. Question Bank Definitions (Covering all skills across EASY, MEDIUM, HARD)
  const questionBank: Array<{
    skillSlug: string;
    text: string;
    difficulty: QuestionDifficulty;
    points: number;
    options: Array<{ optionId: string; text: string }>;
    correctOptionId: string;
    explanation: string;
  }> = [
    // --- JavaScript ---
    {
      skillSlug: 'javascript',
      text: 'Which operator is used for strict value and type equality in JavaScript?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: '==' },
        { optionId: 'b', text: '===' },
        { optionId: 'c', text: '=' },
        { optionId: 'd', text: '!=' },
      ],
      correctOptionId: 'b',
      explanation: 'The === operator compares both value and datatype without coercion.',
    },
    {
      skillSlug: 'javascript',
      text: 'What is the output of typeof null in JavaScript?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: '"null"' },
        { optionId: 'b', text: '"undefined"' },
        { optionId: 'c', text: '"object"' },
        { optionId: 'd', text: '"number"' },
      ],
      correctOptionId: 'c',
      explanation: 'typeof null returns "object" due to a historical bug in JS type representation.',
    },
    {
      skillSlug: 'javascript',
      text: 'What does Promise.all() do when one of the passed promises rejects?',
      difficulty: 'HARD',
      points: 30,
      options: [
        { optionId: 'a', text: 'Resolves with null for the rejected promise' },
        { optionId: 'b', text: 'Waits for remaining promises to complete' },
        { optionId: 'c', text: 'Immediately rejects with the reason of the first rejected promise' },
        { optionId: 'd', text: 'Returns an array of error objects' },
      ],
      correctOptionId: 'c',
      explanation: 'Promise.all short-circuits and rejects immediately upon any inner promise rejection.',
    },

    // --- TypeScript ---
    {
      skillSlug: 'typescript',
      text: 'Which TypeScript utility type constructs a type with all properties of T set to optional?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'Required<T>' },
        { optionId: 'b', text: 'Partial<T>' },
        { optionId: 'c', text: 'Readonly<T>' },
        { optionId: 'd', text: 'Pick<T>' },
      ],
      correctOptionId: 'b',
      explanation: 'Partial<T> returns a type with all properties of T marked optional.',
    },
    {
      skillSlug: 'typescript',
      text: 'What is the key difference between an interface and a type alias in TypeScript?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'Types can be merged via declaration merging; interfaces cannot' },
        { optionId: 'b', text: 'Interfaces can be merged via declaration merging; types cannot' },
        { optionId: 'c', text: 'Interfaces only support primitives' },
        { optionId: 'd', text: 'Types are evaluated at runtime' },
      ],
      correctOptionId: 'b',
      explanation: 'Declaration merging allows multiple interface declarations with the same name to combine.',
    },
    {
      skillSlug: 'typescript',
      text: 'What does the infer keyword do inside conditional types in TypeScript?',
      difficulty: 'HARD',
      points: 30,
      options: [
        { optionId: 'a', text: 'Imports an external module type' },
        { optionId: 'b', text: 'Declares a type variable to be deduced within the true branch of a conditional type' },
        { optionId: 'c', text: 'Cast an unknown type to any' },
        { optionId: 'd', text: 'Suppresses compiler errors' },
      ],
      correctOptionId: 'b',
      explanation: 'infer enables type extraction from within generic conditions.',
    },

    // --- React ---
    {
      skillSlug: 'react',
      text: 'Which React Hook is primarily used for managing side effects in functional components?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'useState' },
        { optionId: 'b', text: 'useEffect' },
        { optionId: 'c', text: 'useContext' },
        { optionId: 'd', text: 'useReducer' },
      ],
      correctOptionId: 'b',
      explanation: 'useEffect executes side effects such as data fetching, subscriptions, and DOM updates.',
    },
    {
      skillSlug: 'react',
      text: 'Why should keys be provided when rendering lists in React?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'To automatically sort array elements' },
        { optionId: 'b', text: 'To help React identify which items have changed, been added, or removed' },
        { optionId: 'c', text: 'To encrypt component state' },
        { optionId: 'd', text: 'To apply CSS grid styling' },
      ],
      correctOptionId: 'b',
      explanation: 'Keys give React elements a stable identity to optimize DOM reconciliation during list updates.',
    },
    {
      skillSlug: 'react',
      text: 'What is the primary advantage of React.memo?',
      difficulty: 'HARD',
      points: 30,
      options: [
        { optionId: 'a', text: 'It creates a global Redux store' },
        { optionId: 'b', text: 'It memoizes component render output to skip unnecessary re-renders when props are unchanged' },
        { optionId: 'c', text: 'It automatically catches server exceptions' },
        { optionId: 'd', text: 'It converts JSX to HTML strings' },
      ],
      correctOptionId: 'b',
      explanation: 'React.memo is a higher-order component that skips re-rendering if props do not change.',
    },

    // --- HTML & CSS ---
    {
      skillSlug: 'html-css',
      text: 'Which HTML5 element is appropriate for wrapping main navigation links?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: '<section>' },
        { optionId: 'b', text: '<nav>' },
        { optionId: 'c', text: '<aside>' },
        { optionId: 'd', text: '<header>' },
      ],
      correctOptionId: 'b',
      explanation: 'The <nav> semantic tag represents a section of a page intended for navigation links.',
    },
    {
      skillSlug: 'html-css',
      text: 'What does CSS flex-direction: column do to flex items?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'Lays out items horizontally from left to right' },
        { optionId: 'b', text: 'Lays out items vertically from top to bottom' },
        { optionId: 'c', text: 'Hides items overflow' },
        { optionId: 'd', text: 'Centers items along the cross axis' },
      ],
      correctOptionId: 'b',
      explanation: 'flex-direction: column sets the main axis to vertical, stacking flex children.',
    },
    {
      skillSlug: 'html-css',
      text: 'What is the specificity weight comparison between an ID selector (#header) and a class selector (.header)?',
      difficulty: 'HARD',
      points: 30,
      options: [
        { optionId: 'a', text: 'Class selector has higher specificity' },
        { optionId: 'b', text: 'ID selector has higher specificity (1-0-0 vs 0-1-0)' },
        { optionId: 'c', text: 'They have equal specificity' },
        { optionId: 'd', text: 'Inline styles have lower specificity than class' },
      ],
      correctOptionId: 'b',
      explanation: 'ID selectors carry a specificity of 100, while class selectors carry 10.',
    },

    // --- Node.js ---
    {
      skillSlug: 'node-js',
      text: 'Which module system is standard in modern Node.js using import/export statements?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'CommonJS' },
        { optionId: 'b', text: 'ES Modules (ESM)' },
        { optionId: 'c', text: 'AMD' },
        { optionId: 'd', text: 'UMD' },
      ],
      correctOptionId: 'b',
      explanation: 'ES Modules (ESM) uses standard import/export syntax in modern Node.js.',
    },
    {
      skillSlug: 'node-js',
      text: 'What is the role of the Node.js Event Loop?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'To compile C++ code into JavaScript' },
        { optionId: 'b', text: 'To offload non-blocking I/O operations and execute callbacks on a single main thread' },
        { optionId: 'c', text: 'To render HTML pages on the client' },
        { optionId: 'd', text: 'To encrypt HTTP requests' },
      ],
      correctOptionId: 'b',
      explanation: 'The Event Loop coordinates non-blocking asynchronous I/O execution on Node single thread.',
    },
    {
      skillSlug: 'node-js',
      text: 'Which core module is used to handle file streaming in Node.js?',
      difficulty: 'HARD',
      points: 30,
      options: [
        { optionId: 'a', text: 'http' },
        { optionId: 'b', text: 'stream' },
        { optionId: 'c', text: 'path' },
        { optionId: 'd', text: 'events' },
      ],
      correctOptionId: 'b',
      explanation: 'The stream module provides the foundational API for handling streaming data in Node.',
    },

    // --- Express ---
    {
      skillSlug: 'express',
      text: 'What signature does standard Express middleware function require?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: '(req, res)' },
        { optionId: 'b', text: '(req, res, next)' },
        { optionId: 'c', text: '(err, req)' },
        { optionId: 'd', text: '(next)' },
      ],
      correctOptionId: 'b',
      explanation: 'Express middleware accepts request, response, and the next callback function.',
    },
    {
      skillSlug: 'express',
      text: 'How do you pass error control to the Express global error handler from a route?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'throw new Response()' },
        { optionId: 'b', text: 'next(error)' },
        { optionId: 'c', text: 'return res.send(error)' },
        { optionId: 'd', text: 'console.log(error)' },
      ],
      correctOptionId: 'b',
      explanation: 'Calling next(error) forwards errors to Express four-parameter error handling middleware.',
    },
    {
      skillSlug: 'express',
      text: 'Which signature identifies an Express error-handling middleware?',
      difficulty: 'HARD',
      points: 30,
      options: [
        { optionId: 'a', text: '(req, res, next)' },
        { optionId: 'b', text: '(err, req, res, next)' },
        { optionId: 'c', text: '(err, req)' },
        { optionId: 'd', text: '(req, res)' },
      ],
      correctOptionId: 'b',
      explanation: 'Express identifies error handlers specifically by expecting 4 arguments: (err, req, res, next).',
    },

    // --- MongoDB ---
    {
      skillSlug: 'mongodb',
      text: 'Which format does MongoDB use internally to store documents?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'XML' },
        { optionId: 'b', text: 'BSON (Binary JSON)' },
        { optionId: 'c', text: 'CSV' },
        { optionId: 'd', text: 'YAML' },
      ],
      correctOptionId: 'b',
      explanation: 'MongoDB stores document records in BSON, a binary-encoded serialization of JSON.',
    },
    {
      skillSlug: 'mongodb',
      text: 'Which Mongoose method performs an upsert (insert if not found, update if found)?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'Model.create()' },
        { optionId: 'b', text: 'Model.findOneAndUpdate(filter, update, { upsert: true })' },
        { optionId: 'c', text: 'Model.deleteMany()' },
        { optionId: 'd', text: 'Model.aggregate()' },
      ],
      correctOptionId: 'b',
      explanation: 'Setting { upsert: true } in findOneAndUpdate creates a document if no match is found.',
    },
    {
      skillSlug: 'mongodb',
      text: 'How do you create a compound unique index in Mongoose?',
      difficulty: 'HARD',
      points: 30,
      options: [
        { optionId: 'a', text: 'Schema.index({ fieldA: 1 }, { fieldB: 1 })' },
        { optionId: 'b', text: 'Schema.index({ fieldA: 1, fieldB: 1 }, { unique: true })' },
        { optionId: 'c', text: 'Schema.addUnique(fieldA, fieldB)' },
        { optionId: 'd', text: 'Schema.set({ uniqueCompound: true })' },
      ],
      correctOptionId: 'b',
      explanation: 'Passing a multi-field object to index() with unique: true creates a compound unique index.',
    },

    // --- SQL ---
    {
      skillSlug: 'sql',
      text: 'Which SQL clause is used to filter records based on a condition?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'GROUP BY' },
        { optionId: 'b', text: 'WHERE' },
        { optionId: 'c', text: 'ORDER BY' },
        { optionId: 'd', text: 'HAVING' },
      ],
      correctOptionId: 'b',
      explanation: 'The WHERE clause filters rows prior to any grouping or sorting.',
    },
    {
      skillSlug: 'sql',
      text: 'What is the difference between WHERE and HAVING in SQL?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'WHERE filters individual rows; HAVING filters aggregated groups' },
        { optionId: 'b', text: 'HAVING is used before GROUP BY' },
        { optionId: 'c', text: 'WHERE can only be used with text columns' },
        { optionId: 'd', text: 'There is no difference' },
      ],
      correctOptionId: 'a',
      explanation: 'WHERE filters rows before aggregation, whereas HAVING filters groups created by GROUP BY.',
    },
    {
      skillSlug: 'sql',
      text: 'What type of JOIN returns all rows from the left table and matched rows from the right table?',
      difficulty: 'HARD',
      points: 30,
      options: [
        { optionId: 'a', text: 'INNER JOIN' },
        { optionId: 'b', text: 'LEFT OUTER JOIN' },
        { optionId: 'c', text: 'RIGHT OUTER JOIN' },
        { optionId: 'd', text: 'FULL OUTER JOIN' },
      ],
      correctOptionId: 'b',
      explanation: 'LEFT JOIN preserves all rows from the left table regardless of right table matches.',
    },

    // --- REST API ---
    {
      skillSlug: 'rest-api',
      text: 'Which HTTP method is commonly used to create a new resource in a RESTful API?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'GET' },
        { optionId: 'b', text: 'POST' },
        { optionId: 'c', text: 'DELETE' },
        { optionId: 'd', text: 'OPTIONS' },
      ],
      correctOptionId: 'b',
      explanation: 'POST is the standard REST method for resource creation.',
    },
    {
      skillSlug: 'rest-api',
      text: 'What is the difference between HTTP PUT and PATCH methods?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'PUT creates a resource; PATCH deletes it' },
        { optionId: 'b', text: 'PUT replaces an entire resource; PATCH applies partial updates' },
        { optionId: 'c', text: 'PUT is asynchronous; PATCH is synchronous' },
        { optionId: 'd', text: 'There is no functional difference' },
      ],
      correctOptionId: 'b',
      explanation: 'PUT performs a full replacement of a resource, whereas PATCH modifies specific fields.',
    },
    {
      skillSlug: 'rest-api',
      text: 'Which HTTP status code signifies that a client is unauthenticated?',
      difficulty: 'HARD',
      points: 30,
      options: [
        { optionId: 'a', text: '200 OK' },
        { optionId: 'b', text: '400 Bad Request' },
        { optionId: 'c', text: '401 Unauthorized' },
        { optionId: 'd', text: '403 Forbidden' },
      ],
      correctOptionId: 'c',
      explanation: '401 Unauthorized indicates missing or invalid authentication credentials.',
    },

    // --- Git ---
    {
      skillSlug: 'git',
      text: 'Which command creates a new Git branch and switches to it immediately?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'git init' },
        { optionId: 'b', text: 'git checkout -b <branch-name>' },
        { optionId: 'c', text: 'git commit -m' },
        { optionId: 'd', text: 'git status' },
      ],
      correctOptionId: 'b',
      explanation: 'git checkout -b creates a new branch and checks it out in one step.',
    },
    {
      skillSlug: 'git',
      text: 'What is the purpose of git rebase?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'To delete all remote branches' },
        { optionId: 'b', text: 'To re-apply commits on top of another base tip for a linear history' },
        { optionId: 'c', text: 'To clear working directory changes' },
        { optionId: 'd', text: 'To compress PNG images in a repo' },
      ],
      correctOptionId: 'b',
      explanation: 'Rebasing integrates changes from one branch into another by moving the branch base.',
    },
    {
      skillSlug: 'git',
      text: 'How can you temporarily save uncommitted local changes without committing them?',
      difficulty: 'HARD',
      points: 30,
      options: [
        { optionId: 'a', text: 'git push' },
        { optionId: 'b', text: 'git stash' },
        { optionId: 'c', text: 'git reset --hard' },
        { optionId: 'd', text: 'git clean' },
      ],
      correctOptionId: 'b',
      explanation: 'git stash shelves local uncommitted working changes so you can re-apply them later.',
    },

    // --- Authentication ---
    {
      skillSlug: 'authentication',
      text: 'What are the three dot-separated parts of a JSON Web Token (JWT)?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'Header, Payload, Signature' },
        { optionId: 'b', text: 'Username, Password, Hash' },
        { optionId: 'c', text: 'Key, Value, Secret' },
        { optionId: 'd', text: 'Domain, Path, Cookie' },
      ],
      correctOptionId: 'a',
      explanation: 'A JWT consists of Header (algorithm), Payload (claims), and Signature.',
    },
    {
      skillSlug: 'authentication',
      text: 'Why should passwords never be stored in plain text in a database?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'Plaintext passwords exceed database character limits' },
        { optionId: 'b', text: 'Database breaches expose user credentials directly; salted hashing protects them' },
        { optionId: 'c', text: 'Plaintext passwords slow down database queries' },
        { optionId: 'd', text: 'Plaintext passwords cannot be indexed' },
      ],
      correctOptionId: 'b',
      explanation: 'One-way salted hashing (e.g. bcrypt) ensures stolen databases do not expose plaintext credentials.',
    },
    {
      skillSlug: 'authentication',
      text: 'What is the primary difference between Authentication and Authorization?',
      difficulty: 'HARD',
      points: 30,
      options: [
        { optionId: 'a', text: 'Authentication checks permissions; Authorization verifies identity' },
        { optionId: 'b', text: 'Authentication verifies WHO you are; Authorization verifies WHAT you can access' },
        { optionId: 'c', text: 'Authentication uses SQL; Authorization uses NoSQL' },
        { optionId: 'd', text: 'They are identical concepts' },
      ],
      correctOptionId: 'b',
      explanation: 'Authentication proves identity (login), while Authorization checks user permissions.',
    },

    // --- Problem Solving ---
    {
      skillSlug: 'problem-solving',
      text: 'What is the time complexity of searching a target in a balanced Binary Search Tree (BST)?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'O(1)' },
        { optionId: 'b', text: 'O(log N)' },
        { optionId: 'c', text: 'O(N)' },
        { optionId: 'd', text: 'O(N^2)' },
      ],
      correctOptionId: 'b',
      explanation: 'Balanced BST search halves the search space each step, operating in logarithmic O(log N) time.',
    },
    {
      skillSlug: 'problem-solving',
      text: 'Which data structure follows a First-In-First-Out (FIFO) access order?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'Stack' },
        { optionId: 'b', text: 'Queue' },
        { optionId: 'c', text: 'Heap' },
        { optionId: 'd', text: 'Graph' },
      ],
      correctOptionId: 'b',
      explanation: 'A Queue processes elements in the order they arrive (First-In-First-Out).',
    },
    {
      skillSlug: 'problem-solving',
      text: 'Which algorithmic strategy solves a complex problem by breaking it into overlapping subproblems and storing subproblem results?',
      difficulty: 'HARD',
      points: 30,
      options: [
        { optionId: 'a', text: 'Greedy Choice' },
        { optionId: 'b', text: 'Dynamic Programming (DP)' },
        { optionId: 'c', text: 'Brute Force Search' },
        { optionId: 'd', text: 'Randomized Sampling' },
      ],
      correctOptionId: 'b',
      explanation: 'Dynamic Programming uses memoization or tabulation to solve overlapping subproblems efficiently.',
    },

    // --- Python ---
    {
      skillSlug: 'python',
      text: 'Which built-in Python data structure is mutable and ordered?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'Tuple' },
        { optionId: 'b', text: 'List' },
        { optionId: 'c', text: 'Set' },
        { optionId: 'd', text: 'Frozenset' },
      ],
      correctOptionId: 'b',
      explanation: 'Lists in Python are ordered, mutable sequences.',
    },
    {
      skillSlug: 'python',
      text: 'What is a Python decorator?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'A tool for styling HTML in Python' },
        { optionId: 'b', text: 'A function that takes another function as an argument and extends its behavior without modifying it' },
        { optionId: 'c', text: 'A class inheritance keyword' },
        { optionId: 'd', text: 'A memory garbage collector' },
      ],
      correctOptionId: 'b',
      explanation: 'Decorators wrap a function to modify or enhance its behavior dynamically.',
    },
    {
      skillSlug: 'python',
      text: 'How does Python handle memory management for object references?',
      difficulty: 'HARD',
      points: 30,
      options: [
        { optionId: 'a', text: 'Manual malloc and free' },
        { optionId: 'b', text: 'Reference counting combined with a cyclic garbage collector' },
        { optionId: 'c', text: 'Strict compile-time ownership rules like Rust' },
        { optionId: 'd', text: 'No memory management is performed' },
      ],
      correctOptionId: 'b',
      explanation: 'CPython uses reference counting plus a generational garbage collector to handle reference cycles.',
    },

    // --- Statistics ---
    {
      skillSlug: 'statistics',
      text: 'What measure of central tendency represents the middle value of an ordered dataset?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'Mean' },
        { optionId: 'b', text: 'Median' },
        { optionId: 'c', text: 'Mode' },
        { optionId: 'd', text: 'Variance' },
      ],
      correctOptionId: 'b',
      explanation: 'The median divides an ordered dataset into two equal halves.',
    },
    {
      skillSlug: 'statistics',
      text: 'What does a p-value less than 0.05 signify in hypothesis testing?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'Fail to reject the null hypothesis' },
        { optionId: 'b', text: 'Statistically significant evidence to reject the null hypothesis at the 5% level' },
        { optionId: 'c', text: 'The dataset has 95% missing values' },
        { optionId: 'd', text: 'The sample size is too small' },
      ],
      correctOptionId: 'b',
      explanation: 'p < 0.05 indicates weak support for the null hypothesis, leading to its rejection.',
    },
    {
      skillSlug: 'statistics',
      text: 'What is the Central Limit Theorem (CLT)?',
      difficulty: 'HARD',
      points: 30,
      options: [
        { optionId: 'a', text: 'All datasets are normally distributed' },
        { optionId: 'b', text: 'The sampling distribution of the sample mean approaches a normal distribution as sample size grows, regardless of population shape' },
        { optionId: 'c', text: 'Mean always equals median in large samples' },
        { optionId: 'd', text: 'Standard deviation equals 0 for random samples' },
      ],
      correctOptionId: 'b',
      explanation: 'CLT guarantees that sample means approximate a normal distribution for sufficiently large N.',
    },

    // --- Pandas ---
    {
      skillSlug: 'pandas',
      text: 'Which Pandas object represents a 2-dimensional labeled tabular data structure?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'Series' },
        { optionId: 'b', text: 'DataFrame' },
        { optionId: 'c', text: 'Index' },
        { optionId: 'd', text: 'Panel' },
      ],
      correctOptionId: 'b',
      explanation: 'DataFrame is the core 2D tabular data structure in Pandas.',
    },
    {
      skillSlug: 'pandas',
      text: 'How do you select rows in Pandas by integer-location position?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'df.loc[]' },
        { optionId: 'b', text: 'df.iloc[]' },
        { optionId: 'c', text: 'df.select[]' },
        { optionId: 'd', text: 'df.filter[]' },
      ],
      correctOptionId: 'b',
      explanation: 'iloc accesses rows and columns by integer index, whereas loc accesses by label.',
    },

    // --- NumPy ---
    {
      skillSlug: 'numpy',
      text: 'What is the main N-dimensional array object in NumPy?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'ndarray' },
        { optionId: 'b', text: 'nparray' },
        { optionId: 'c', text: 'matrix' },
        { optionId: 'd', text: 'vector' },
      ],
      correctOptionId: 'a',
      explanation: 'numpy.ndarray is the foundational array object in NumPy.',
    },
    {
      skillSlug: 'numpy',
      text: 'What is broadcasting in NumPy?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'Sending array data over a network socket' },
        { optionId: 'b', text: 'Treating arrays with different shapes during arithmetic operations' },
        { optionId: 'c', text: 'Converting 2D arrays to 1D strings' },
        { optionId: 'd', text: 'Logging array elements to stdout' },
      ],
      correctOptionId: 'b',
      explanation: 'Broadcasting allows element-wise operations on arrays of different shapes without copying data.',
    },

    // --- Machine Learning ---
    {
      skillSlug: 'machine-learning',
      text: 'Which category of machine learning includes algorithms trained on labeled target outcomes?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'Unsupervised Learning' },
        { optionId: 'b', text: 'Supervised Learning' },
        { optionId: 'c', text: 'Reinforcement Learning' },
        { optionId: 'd', text: 'Self-Supervised Learning' },
      ],
      correctOptionId: 'b',
      explanation: 'Supervised learning uses pairs of input features and known ground-truth labels.',
    },
    {
      skillSlug: 'machine-learning',
      text: 'What is the trade-off described by the Bias-Variance Dilemma?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'High bias leads to underfitting; high variance leads to overfitting' },
        { optionId: 'b', text: 'High bias leads to overfitting; high variance leads to underfitting' },
        { optionId: 'c', text: 'Bias and variance always increase simultaneously' },
        { optionId: 'd', text: 'Bias measures training speed; variance measures prediction speed' },
      ],
      correctOptionId: 'a',
      explanation: 'Underfitting occurs with high bias (oversimplified), while overfitting occurs with high variance (overcomplex).',
    },

    // --- Linux ---
    {
      skillSlug: 'linux',
      text: 'Which command changes file permissions in Linux?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'chown' },
        { optionId: 'b', text: 'chmod' },
        { optionId: 'c', text: 'chgrp' },
        { optionId: 'd', text: 'ls -l' },
      ],
      correctOptionId: 'b',
      explanation: 'chmod (change mode) modifies read, write, and execute permissions of files and directories.',
    },
    {
      skillSlug: 'linux',
      text: 'What is the function of the /etc directory in Linux?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'Stores user home directories' },
        { optionId: 'b', text: 'Stores system-wide configuration files' },
        { optionId: 'c', text: 'Stores temporary cached files' },
        { optionId: 'd', text: 'Stores compiled binary executables' },
      ],
      correctOptionId: 'b',
      explanation: '/etc contains administrative and system-wide configuration files in Linux.',
    },

    // --- Networking ---
    {
      skillSlug: 'networking',
      text: 'At which layer of the OSI model does the Internet Protocol (IP) operate?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'Layer 2 (Data Link)' },
        { optionId: 'b', text: 'Layer 3 (Network)' },
        { optionId: 'c', text: 'Layer 4 (Transport)' },
        { optionId: 'd', text: 'Layer 7 (Application)' },
      ],
      correctOptionId: 'b',
      explanation: 'IP is a Network Layer (Layer 3) protocol responsible for packet routing.',
    },
    {
      skillSlug: 'networking',
      text: 'What is the primary difference between TCP and UDP transport protocols?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'TCP is connectionless; UDP is connection-oriented' },
        { optionId: 'b', text: 'TCP provides reliable, ordered, error-checked delivery; UDP is connectionless and low-latency' },
        { optionId: 'c', text: 'UDP encrypts all traffic by default' },
        { optionId: 'd', text: 'TCP only works over Wi-Fi' },
      ],
      correctOptionId: 'b',
      explanation: 'TCP guarantees ordered packet delivery via handshake, whereas UDP prioritizes minimal latency.',
    },

    // --- Docker ---
    {
      skillSlug: 'docker',
      text: 'Which file specifies instructions for building a Docker container image?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'Docker.json' },
        { optionId: 'b', text: 'Dockerfile' },
        { optionId: 'c', text: 'docker-compose.yml' },
        { optionId: 'd', text: 'Containerfile.xml' },
      ],
      correctOptionId: 'b',
      explanation: 'A Dockerfile contains step-by-step commands to assemble a Docker image.',
    },
    {
      skillSlug: 'docker',
      text: 'What is the difference between a Docker image and a Docker container?',
      difficulty: 'MEDIUM',
      points: 20,
      options: [
        { optionId: 'a', text: 'An image is a running instance; a container is a static template' },
        { optionId: 'b', text: 'An image is a read-only template; a container is a runnable isolated instance of an image' },
        { optionId: 'c', text: 'They are identical concepts' },
        { optionId: 'd', text: 'Images only run on Linux; containers run on Windows' },
      ],
      correctOptionId: 'b',
      explanation: 'Containers are execution instances created from immutable Docker images.',
    },

    // --- CI/CD ---
    {
      skillSlug: 'ci-cd',
      text: 'What does Continuous Integration (CI) emphasize in modern software engineering?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'Manual monthly releases' },
        { optionId: 'b', text: 'Frequently merging code changes into a shared repository with automated build and test runs' },
        { optionId: 'c', text: 'Writing documentation in Word files' },
        { optionId: 'd', text: 'Buying cloud servers on demand' },
      ],
      correctOptionId: 'b',
      explanation: 'CI automates building and testing code whenever changes are committed to version control.',
    },

    // --- Security Fundamentals ---
    {
      skillSlug: 'security-fundamentals',
      text: 'What are the three pillars of the CIA triad in cybersecurity?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { optionId: 'a', text: 'Control, Inspection, Audit' },
        { optionId: 'b', text: 'Confidentiality, Integrity, Availability' },
        { optionId: 'c', text: 'Code, Infrastructure, Application' },
        { optionId: 'd', text: 'Cipher, Identity, Authentication' },
      ],
      correctOptionId: 'b',
      explanation: 'Confidentiality, Integrity, and Availability form the foundational CIA security model.',
    },
  ];

  // 4. Idempotent Question Upserts
  let questionsCount = 0;
  const coveredSkillsSet = new Set<string>();

  for (const qData of questionBank) {
    const skillDoc = skillMap.get(qData.skillSlug);
    if (!skillDoc) continue;

    coveredSkillsSet.add(qData.skillSlug);

    // Determine target assessment ID based on skill career association
    const associatedCareerSlug = Array.from(careerMap.keys()).find((cSlug) => {
      const diag = assessmentDocMap.get(cSlug);
      return diag && diag.targetSkillIds.some((id: any) => id.toString() === skillDoc._id.toString());
    });

    const targetAssessment = associatedCareerSlug ? assessmentDocMap.get(associatedCareerSlug) : defaultDiagnostic;

    await QuestionModel.findOneAndUpdate(
      { skillId: skillDoc._id, text: qData.text },
      {
        $set: {
          skillId: skillDoc._id,
          assessmentId: targetAssessment._id,
          text: qData.text,
          options: qData.options,
          correctOptionId: qData.correctOptionId,
          difficulty: qData.difficulty,
          points: qData.points,
          explanation: qData.explanation,
          isActive: true,
        },
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
    questionsCount++;
  }

  return {
    assessmentsProcessed: assessmentsProcessedCount,
    questionsProcessed: questionsCount,
    skillsCoveredCount: coveredSkillsSet.size,
  };
};

// Executable CLI runner
if (typeof require !== 'undefined' && require.main === module) {
  connectDB()
    .then(async () => {
      console.log('Running assessment seed script...');
      const result = await seedAssessmentData();
      console.log('Assessment seed executed successfully:', result);
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Assessment seed failed:', err);
      process.exit(1);
    });
}

