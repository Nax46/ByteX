import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import http from 'http';
import { AddressInfo } from 'net';
import app from '../src/app';
import { User, UserRole } from '../src/models/User';
import { StudentProfile } from '../src/models/StudentProfile';
import { AssessmentAttempt, AssessmentStatus } from '../src/models/AssessmentAttempt';
import { hashPassword, comparePassword } from '../src/utils/password';
import { signToken, verifyToken } from '../src/utils/jwt';

let mongoServer: MongoMemoryServer;
let server: http.Server;
let baseUrl: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  server = app.listen(0);
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}/api`;
});

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Task 1 — Backend Foundation & Health Route', () => {
  it('GET /api/health should return status 200 with success format', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('ok');
    expect(data.message).toBe('Success');
  });

  it('GET /api/nonexistent-route should return 404 with error format', async () => {
    const res = await fetch(`${baseUrl}/nonexistent-route`);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.message).toContain('not found');
  });
});

describe('Task 2 — User Model & Password Utilities', () => {
  it('should hash password and verify comparison correctly', async () => {
    const plain = 'SecretPassword123!';
    const hashed = await hashPassword(plain);

    expect(hashed).not.toBe(plain);
    expect(await comparePassword(plain, hashed)).toBe(true);
    expect(await comparePassword('WrongPassword', hashed)).toBe(false);
  });

  it('User model should hide passwordHash in default queries and toJSON serialization', async () => {
    const user = await User.create({
      email: 'security_test@skillpath.dev',
      passwordHash: await hashPassword('SecurePass123'),
      role: UserRole.STUDENT,
    });

    // Default find does not project passwordHash
    const fetched = await User.findById(user._id);
    expect(fetched).toBeDefined();
    expect(fetched?.passwordHash).toBeUndefined();

    // toJSON deletes passwordHash
    const json = fetched?.toJSON();
    expect(json?.passwordHash).toBeUndefined();
    expect(json?.__v).toBeUndefined();
  });
});

describe('Task 3 — JWT & Auth Middleware', () => {
  it('should sign and verify JWT tokens with user payload', () => {
    const payload = { userId: new mongoose.Types.ObjectId().toString(), role: UserRole.STUDENT };
    const token = signToken(payload);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
  });

  it('protected routes should reject unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/auth/me`);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toContain('No token provided');
  });
});

describe('Task 4 — Authentication APIs', () => {
  const testEmail = 'auth_flow@student.edu';
  const testPass = 'Password123!';
  let authToken = '';

  it('POST /api/auth/register should create account and issue token', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Auth Flow Student',
        email: testEmail,
        password: testPass,
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.token).toBeDefined();
    expect(data.data.user.email).toBe(testEmail);
    expect(data.data.user.passwordHash).toBeUndefined();

    authToken = data.data.token;
  });

  it('POST /api/auth/register should reject duplicate email with 409', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPass,
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.message).toContain('Email already registered');
  });

  it('POST /api/auth/login should authenticate valid credentials', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPass,
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.token).toBeDefined();
    expect(data.data.user.email).toBe(testEmail);
  });

  it('POST /api/auth/login should reject invalid credentials with 401', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'IncorrectPassword',
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Invalid email or password');
  });

  it('GET /api/auth/me should return current user info when authenticated', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe(testEmail);
    expect(data.data.user.passwordHash).toBeUndefined();
  });
});

describe('Task 5 — Student Profile & Onboarding API', () => {
  let userToken = '';

  beforeAll(async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'profile_test@student.edu',
        password: 'Password123!',
      }),
    });
    const data = await res.json();
    userToken = data.data.token;
  });

  it('POST /api/profile/onboarding should complete onboarding and save profile', async () => {
    const res = await fetch(`${baseUrl}/profile/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        fullName: 'Alex Morgan',
        education: 'B.Tech Computer Science',
        college: 'State University',
        semester: 6,
        interests: ['React', 'Node.js', 'AI'],
        targetCareer: 'Full Stack Engineer',
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.profile.fullName).toBe('Alex Morgan');
    expect(data.data.profile.targetCareer).toBe('Full Stack Engineer');
  });

  it('GET /api/profile should retrieve authenticated student profile', async () => {
    const res = await fetch(`${baseUrl}/profile`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.profile.fullName).toBe('Alex Morgan');
  });

  it('PUT /api/profile should update student profile fields', async () => {
    const res = await fetch(`${baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        fullName: 'Alex Morgan Jr.',
        semester: 7,
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.profile.fullName).toBe('Alex Morgan Jr.');
    expect(data.data.profile.semester).toBe(7);
  });
});

describe('Task 6 — Assessment API Layer', () => {
  let userToken = '';
  let attemptId = '';

  beforeAll(async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'assessment_test@student.edu',
        password: 'Password123!',
      }),
    });
    const data = await res.json();
    userToken = data.data.token;
  });

  it('POST /api/assessment/start should initialize an attempt in IN_PROGRESS state', async () => {
    const res = await fetch(`${baseUrl}/assessment/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.attempt.status).toBe(AssessmentStatus.IN_PROGRESS);
    attemptId = data.data.attempt.id;
    expect(attemptId).toBeDefined();
  });

  it('GET /api/assessment/:attemptId should return the created attempt', async () => {
    const res = await fetch(`${baseUrl}/assessment/${attemptId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.attempt.id).toBe(attemptId);
  });

  it('POST /api/assessment/:attemptId/submit should complete the attempt', async () => {
    const res = await fetch(`${baseUrl}/assessment/${attemptId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        answers: [],
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.attempt.status).toBe(AssessmentStatus.SUBMITTED);
  });

  it('GET /api/assessment/history should list user attempts', async () => {
    const res = await fetch(`${baseUrl}/assessment/history`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.attempts)).toBe(true);
    expect(data.data.attempts.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Task 7 — Dashboard Aggregation API', () => {
  let userToken = '';

  beforeAll(async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dashboard_test@student.edu',
        password: 'Password123!',
      }),
    });
    const data = await res.json();
    userToken = data.data.token;
  });

  it('GET /api/dashboard should return aggregated dashboard structure', async () => {
    const res = await fetch(`${baseUrl}/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.profile.completed).toBe(false);
    expect(data.data.onboarding.completed).toBe(false);
    expect(data.data.assessment.hasActiveAttempt).toBe(false);
    expect(data.data.assessment.latestAttempt).toBeNull();
  });
});
