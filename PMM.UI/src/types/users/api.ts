// src/types/users/api.ts

import type { PagedResult } from "../common";

export interface UserDto {
  id: number;
  name: string | null;
  email: string | null;
  isActive: boolean;
  capacity?: number;
  capacityPercent?: number;
  availableWorkHoursForOneMonth?: number;
  allocatedWorkHoursForOneMonth?: number;
  activeTasksCount?: number;
  todoTasksCount?: number;
}

export type UserPagedResult = PagedResult<UserDto>;

export interface CreateUserPayload {
  name: string;
  email: string;
}

export type UpdateUserPayload = CreateUserPayload;
