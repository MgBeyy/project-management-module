// src/types/projects/api.ts

import type {
  DateString,
  DateTimeString,
  IdNameDto,
  Nullable,
  PagedResult,
} from "../common";
import type { TaskDto } from "../tasks";

export type ProjectStatus =
  | "Active"
  | "Inactive"
  | "Completed"
  | "Planned"
  | "WaitingForApproval";

export type ProjectPriority = "High" | "Regular" | "Low";

export interface LabelDto {
  id: number;
  name: string | null;
  color: string | null;
  description: string | null;
  createdAt: DateTimeString;
  createdById: number;
  updatedAt: Nullable<DateTimeString>;
  updatedById: Nullable<number>;
}

export interface ClientDto {
  id: number;
  name: string | null;
}

export interface ProjectDto {
  id: number;
  code: string | null;
  title: string | null;
  plannedStartDate: Nullable<DateString>;
  plannedDeadline: Nullable<DateString>;
  plannedHours: Nullable<number>;
  actualHours: Nullable<number>;
  startedAt: Nullable<DateString>;
  endAt: Nullable<DateString>;
  status: ProjectStatus;
  priority: ProjectPriority;
  parentProjectIds: Nullable<number[]>;
  clientId: Nullable<number>;
  labels: Nullable<LabelDto[]>;
  createdById: Nullable<number>;
  createdAt: DateTimeString;
  updatedById: Nullable<number>;
  updatedAt: Nullable<DateTimeString>;
}

export type ProjectPagedResult = PagedResult<ProjectDto>;

export type ProjectAssignmentRole = "Member" | "Manager" | "Reviewer";

export interface ProjectAssignmentItemPayload {
  userId: number;
  role: ProjectAssignmentRole;
  startedAt?: Nullable<DateString>;
  endAt?: Nullable<DateString>;
  expectedHours?: Nullable<number>;
}

export interface CreateProjectPayload {
  code: string;
  title: string;
  plannedStartDate?: Nullable<number>;
  plannedDeadline?: Nullable<number>;
  plannedHours?: Nullable<number>;
  startedAt?: Nullable<number>;
  endAt?: Nullable<number>;
  status?: Nullable<ProjectStatus>;
  priority?: ProjectPriority;
  parentProjectIds?: Nullable<number[]>;
  clientId?: Nullable<number>;
  labelIds?: Nullable<number[]>;
  assignedUsers?: Nullable<ProjectAssignmentItemPayload[]>;
}

export interface UpdateProjectPayload {
  title: string;
  plannedStartDate?: Nullable<number>;
  plannedDeadline?: Nullable<number>;
  plannedHours?: Nullable<number>;
  startedAt?: Nullable<number>;
  endAt?: Nullable<number>;
  status?: Nullable<ProjectStatus>;
  priority?: ProjectPriority;
  parentProjectIds?: Nullable<number[]>;
  labelIds?: Nullable<number[]>;
  assignedUsers?: Nullable<ProjectAssignmentItemPayload[]>;
  clientId?: Nullable<number>;
}

export interface ProjectAssignmentWithUserDto {
  id: number;
  projectId: number;
  userId: number;
  user: IdNameDto | null;
  role: ProjectAssignmentRole;
  startedAt: Nullable<DateString>;
  endAt: Nullable<DateString>;
  expectedHours: Nullable<number>;
  spentHours: Nullable<number>;
  createdAt: DateTimeString;
  createdById: Nullable<number>;
  updatedAt: Nullable<DateTimeString>;
  updatedById: Nullable<number>;
}

export interface DetailedProjectDto {
  id: number;
  code: string | null;
  title: string | null;
  plannedStartDate: Nullable<number>;
  plannedDeadline: Nullable<number>;
  plannedHours: Nullable<number>;
  actualHours: Nullable<number>;
  startedAt: Nullable<number>;
  endAt: Nullable<number>;
  status: ProjectStatus;
  priority: ProjectPriority;
  parentProjects: Nullable<ProjectDto[]>;
  childProjects: Nullable<ProjectDto[]>;
  clientId: Nullable<number>;
  client: ClientDto | null;
  labels: Nullable<LabelDto[]>;
  assignedUsers: Nullable<ProjectAssignmentWithUserDto[]>;
  tasks: Nullable<TaskDto[]>;
  createdAt: number;
  createdById: Nullable<number>;
  createdByUser: IdNameDto | null;
  updatedAt: Nullable<number>;
  updatedById: Nullable<number>;
  updatedByUser: IdNameDto | null;
}

export interface CreateLabelPayload {
  name: string;
  color?: Nullable<string>;
  description?: Nullable<string>;
}

export type UpdateLabelPayload = CreateLabelPayload;
