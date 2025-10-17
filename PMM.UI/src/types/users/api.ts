// src/types/users/api.ts

import { BaseEntity } from '../common';

export interface UserDto extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  department?: string;
  position?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  permissions?: string[];
}

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  position?: string;
  password: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: number;
  isActive?: boolean;
  permissions?: string[];
}

export interface UserProfile extends UserDto {
  phoneNumber?: string;
  address?: string;
  bio?: string;
  skills?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

export enum UserRole {
  ADMIN = 0,
  MANAGER = 1,
  DEVELOPER = 2,
  TESTER = 3,
  USER = 4,
}