import { UserRole } from '../models/User';

export interface AuthTokenPayload {
  userId: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
}
