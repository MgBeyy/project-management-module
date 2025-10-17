// src/types/users/ui.ts

import { FormMode } from '../common';
import { UserDto, UserProfile } from './api';

export interface UserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userData?: UserDto | null;
  mode?: FormMode;
}

export interface UserFormValues {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: number;
  department?: string;
  position?: string;
  password?: string;
  confirmPassword?: string;
  isActive?: boolean;
}

export interface UserListProps {
  users: UserDto[];
  loading?: boolean;
  onEdit?: (user: UserDto) => void;
  onDelete?: (userId: number) => void;
  onView?: (user: UserDto) => void;
  onToggleActive?: (userId: number, isActive: boolean) => void;
}

export interface UserFilters {
  role?: number[];
  department?: string[];
  isActive?: boolean;
  searchText?: string;
}

export interface UserQueryParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: UserFilters;
}

export interface UserProfileProps {
  user: UserProfile;
  isOwnProfile?: boolean;
  onEdit?: () => void;
}