// src/types/tasks/api.ts

import { BaseEntity, DateString } from '../common';

export interface TaskDto extends BaseEntity {
  title: string;
  description?: string;
  code: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: DateString;
  completedAt?: DateString;
  estimatedHours?: number;
  actualHours?: number;
  projectId?: number;
  project?: {
    id: number;
    title: string;
    code: string;
  };
  assignedUserId?: number;
  assignedUser?: {
    id: number;
    name: string;
    email: string;
  };
  parentTaskId?: number;
  subtasks?: TaskDto[];
  dependencies?: TaskDependency[];
}

export interface TaskDependency {
  id: number;
  taskId: number;
  dependsOnTaskId: number;
  dependencyType: DependencyType;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: DateString;
  estimatedHours?: number;
  projectId?: number;
  assignedUserId?: number;
  parentTaskId?: number;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: number;
  status?: TaskStatus;
  actualHours?: number;
  completedAt?: DateString;
}

export enum TaskStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  IN_REVIEW = 2,
  DONE = 3,
  CANCELLED = 4,
}

export enum TaskPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  URGENT = 3,
}

export enum DependencyType {
  FINISH_TO_START = 0,
  START_TO_START = 1,
  FINISH_TO_FINISH = 2,
  START_TO_FINISH = 3,
}