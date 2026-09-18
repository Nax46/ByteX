import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Securely hashes a plaintext password using bcryptjs.
 * @param password Plaintext password to hash
 * @returns Promise resolving to hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compares a plaintext password against a stored bcrypt hash.
 * @param password Plaintext password to compare
 * @param passwordHash Stored bcrypt password hash
 * @returns Promise resolving to true if matching, false otherwise
 */
export const comparePassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  if (!password || !passwordHash) {
    return false;
  }
  return bcrypt.compare(password, passwordHash);
};
