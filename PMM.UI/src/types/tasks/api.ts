// src/types/tasks/api.ts

import type {
  DateTimeString,
  IdNameDto,
  Nullable,
  PagedResult,
} from "../common";
import { LabelDto } from "../label/api";

export type TaskStatus =
  | "Todo"
  | "InProgress"
  | "Done"
  | "Inactive"
  | "WaitingForApproval";

export interface TaskDto {
  id: number;
  code: string | null;
  projectId: number;
  projectCode: string | null;
  parentTaskId: Nullable<number>;
  title: string | null;
  description: string | null;
  status: TaskStatus;
  createdAt: DateTimeString;
  createdById: number;
  updatedAt: Nullable<DateTimeString>;
  updatedById: Nullable<number>;
  plannedHours: Nullable<number>;
  actualHours: Nullable<number>;
  isLast: boolean;
  labels: Nullable<LabelDto[]>;
  assignedUsers: Nullable<IdNameDto[]>;
  subTasks: Nullable<TaskDto[]>;
}

export type TaskListDto = PagedResult<TaskDto>;

export interface CreateTaskPayload {
  code: string;
  projectId: number;
  parentTaskId?: Nullable<number>;
  title: string;
  description?: Nullable<string>;
  status?: TaskStatus;
  plannedHours?: Nullable<number>;
  actualHours?: Nullable<number>;
  labelIds?: Nullable<number[]>;
  assignedUserIds?: Nullable<number[]>;
  isLast?: boolean;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: Nullable<string>;
  status?: TaskStatus;
  plannedHours?: Nullable<number>;
  actualHours?: Nullable<number>;
  labelIds?: Nullable<number[]>;
  assignedUserIds?: Nullable<number[]>;
  isLast?: boolean;
}

export type TaskQuery = {
  page?: number;
  pageSize?: number;
  id?: number;
  projectId?: number;
  projectCode?: string;
  parentTaskId?: number;
  title?: string;
  description?: string;
  status?: TaskStatus;
  plannedHours?: number;
  plannedHoursMin?: number;
  plannedHoursMax?: number;
  actualHours?: number;
  actualHoursMin?: number;
  actualHoursMax?: number;
  createdAt?: number;
  createdAtMin?: number;
  createdAtMax?: number;
  createdById?: number;
  updatedAt?: number;
  updatedAtMin?: number;
  updatedAtMax?: number;
  updatedById?: number;
  assignedUserId?: number;
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
};

