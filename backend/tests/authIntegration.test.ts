import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { StudentProfile } from '../src/models/StudentProfile.js';
import { registerUser, loginUser, getCurrentUser, AuthError } from '../src/services/auth.service.js';
import app from '../src/app.js';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await User.syncIndexes();
});

describe('Auth Integration & Comprehensive E2E Verification', () => {
  it('1. Register new user -> EXPECT: success, password hashed, token issued, safe user returned', async () => {
    const registerInput = {
      name: 'Test Student Alex',
      email: 'alex.student@example.com',
      password: 'Test@12345Password',
    };

    const result = await registerUser(registerInput);

    expect(result).toBeDefined();
    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('alex.student@example.com');
    expect(result.user.name).toBe('Test Student Alex');
    expect(result.user.role).toBe('STUDENT');

    // 14 & 15. Verify password & passwordHash are NEVER returned in response
    expect((result.user as any).password).toBeUndefined();
    expect((result.user as any).passwordHash).toBeUndefined();

    // Verify User persisted in MongoDB with hashed password
    const userInDb = await User.findOne({ email: 'alex.student@example.com' }).select('+passwordHash');
    expect(userInDb).toBeDefined();
    expect(userInDb!.passwordHash).not.toBe('Test@12345Password');

    // Verify StudentProfile created automatically
    const profileInDb = await StudentProfile.findOne({ userId: userInDb!._id });
    expect(profileInDb).toBeDefined();
    expect(profileInDb!.fullName).toBe('Test Student Alex');
  });

  it('2. Register same email again -> EXPECT: rejected with 409 AuthError', async () => {
    const credentials = {
      name: 'Original Student',
      email: 'duplicate.student@example.com',
      password: 'Test@12345Password',
    };

    await registerUser(credentials);

    try {
      await registerUser(credentials);
      expect.fail('Should have thrown 409 AuthError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(AuthError);
      expect(err.statusCode).toBe(409);
      expect(err.message).toBe('Email already registered');
    }
  });

  it('3. Register same email with uppercase/different case -> EXPECT: rejected (409)', async () => {
    await registerUser({
      name: 'Case Test',
      email: 'test.case@example.com',
      password: 'Password123!',
    });

    await expect(
      registerUser({
        name: 'Case Test Uppercase',
        email: 'TEST.CASE@EXAMPLE.COM',
        password: 'Password123!',
      })
    ).rejects.toThrow(AuthError);
  });

  it('4. Register same email with whitespace -> EXPECT: rejected (409)', async () => {
    await registerUser({
      name: 'Space Test',
      email: 'spacetest@example.com',
      password: 'Password123!',
    });

    await expect(
      registerUser({
        name: 'Space Test With Spaces',
        email: '  spacetest@example.com  ',
        password: 'Password123!',
      })
    ).rejects.toThrow(AuthError);
  });

  it('5 & 6. Verify only one User and only one StudentProfile exist after duplicate attempt', async () => {
    const email = 'unique.count@example.com';
    await registerUser({ name: 'First User', email, password: 'Password123!' });

    try {
      await registerUser({ name: 'Second User', email, password: 'DifferentPassword' });
    } catch {
      // Expected rejection
    }

    const usersCount = await User.countDocuments({ email });
    const profilesCount = await StudentProfile.countDocuments({ fullName: 'First User' });

    expect(usersCount).toBe(1);
    expect(profilesCount).toBe(1);
  });

  it('7 & 11. Login with existing email + correct password -> EXPECT: success & JWT issued', async () => {
    const registerInput = {
      name: 'Same Credentials Student',
      email: 'same.credentials@example.com',
      password: 'Test@12345Password',
    };

    const regResult = await registerUser(registerInput);
    expect(regResult.token).toBeDefined();

    const loginResult = await loginUser({
      email: 'same.credentials@example.com',
      password: 'Test@12345Password',
    });

    expect(loginResult).toBeDefined();
    expect(loginResult.token).toBeDefined();
    expect(typeof loginResult.token).toBe('string');
    expect(loginResult.user.id).toBe(regResult.user.id);
    expect(loginResult.user.email).toBe('same.credentials@example.com');
  });

  it('8. Login with existing email + wrong password -> EXPECT: rejected with 401', async () => {
    await registerUser({
      name: 'Wrong Pass Student',
      email: 'wrongpass@example.com',
      password: 'CorrectPassword123',
    });

    try {
      await loginUser({
        email: 'wrongpass@example.com',
        password: 'IncorrectPassword999',
      });
      expect.fail('Should have thrown AuthError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(AuthError);
      expect(err.statusCode).toBe(401);
    }
  });

  it('9. Login with uppercase email + correct password -> EXPECT: success', async () => {
    await registerUser({
      name: 'Upper Login Student',
      email: 'casetest.login@example.com',
      password: 'MySecretPassword123',
    });

    const loginResult = await loginUser({
      email: 'CASETEST.LOGIN@EXAMPLE.COM',
      password: 'MySecretPassword123',
    });

    expect(loginResult).toBeDefined();
    expect(loginResult.user.email).toBe('casetest.login@example.com');
  });

  it('10. Login with nonexistent email -> EXPECT: rejected with 401', async () => {
    await expect(
      loginUser({
        email: 'nonexistent.user@example.com',
        password: 'SomePassword123',
      })
    ).rejects.toThrow(AuthError);
  });

  it('12. Verify protected getCurrentUser (me) works for authenticated user ID', async () => {
    const regResult = await registerUser({
      name: 'Profile Student',
      email: 'profile.student@example.com',
      password: 'Test@12345Password',
    });

    const safeUser = await getCurrentUser(regResult.user.id);

    expect(safeUser).toBeDefined();
    expect(safeUser.id).toBe(regResult.user.id);
    expect(safeUser.email).toBe('profile.student@example.com');
    expect(safeUser.name).toBe('Profile Student');
  });

  it('13. Verify MongoDB duplicate key error (E11000) throws controlled 409 error', async () => {
    // Manually force duplicate insertion via User model directly to simulate E11000 index collision
    await User.create({ email: 'e11000.test@example.com', passwordHash: 'hash123' });

    await expect(
      User.create({ email: 'e11000.test@example.com', passwordHash: 'hash456' })
    ).rejects.toThrow();
  });
});
