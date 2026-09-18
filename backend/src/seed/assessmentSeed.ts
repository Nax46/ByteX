import { connectDB, disconnectDB } from '../config/database.js';
import { SkillModel } from '../models/Skill.js';
import { CareerModel } from '../models/Career.js';
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

  const career = await CareerModel.findOne({ slug: 'full-stack-developer' });

  // 2. Idempotent Diagnostic Assessment Definition
  const diagnosticAssessment = await AssessmentModel.findOneAndUpdate(
    { slug: 'full-stack-developer-diagnostic' },
    {
      $set: {
        title: 'Full Stack Developer Diagnostic Assessment',
        slug: 'full-stack-developer-diagnostic',
        type: 'DIAGNOSTIC',
        description: 'Comprehensive diagnostic evaluation covering core full stack web development skills.',
        targetCareerId: career?._id,
        targetSkillIds: Array.from(skillMap.values()).map((s) => s._id),
        durationMinutes: 45,
        version: 1,
        isActive: true,
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  // 3. Question Bank Definitions (Covering all 9 core skills across EASY, MEDIUM, HARD)
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
  ];

  // 4. Idempotent Question Upserts
  let questionsCount = 0;
  const coveredSkillsSet = new Set<string>();

  for (const qData of questionBank) {
    const skillDoc = skillMap.get(qData.skillSlug);
    if (!skillDoc) continue;

    coveredSkillsSet.add(qData.skillSlug);

    await QuestionModel.findOneAndUpdate(
      { skillId: skillDoc._id, text: qData.text },
      {
        $set: {
          skillId: skillDoc._id,
          assessmentId: diagnosticAssessment._id,
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
    assessmentsProcessed: 1,
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
