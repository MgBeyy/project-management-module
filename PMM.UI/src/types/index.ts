// src/types/index.ts
// Centralised re-export surface for the data shapes used by the UI.

export * from "./common";
export * from "./projects";
export * from "./activities";
export * from "./tasks";
export * from "./users";
export * from "./files";
export * from "./clients";
export * from "./machines";


export type {
  ApiResponse,
  DateString,
  DateTimeString,
  IdNameDto,
  MultiSelectOption,
  Nullable,
  PagedResult,
  SelectOption,
} from "./common";

export type {
  ActivityDto,
  ActivityListDto,
  CreateActivityData,
  UpdateActivityPayload,
} from "./activities";

export type {
  CreateProjectPayload,
  DetailedProjectDto,
  FullProjectHierarchyDto,
  ProjectDto,
  ProjectHierarchyDto,
  ProjectAssignmentItemPayload,
  ProjectAssignmentRole,
  ProjectAssignmentWithUserDto,
  ProjectPriority,
  ProjectStatus,
  UpdateProjectPayload,
} from "./projects";

export type {
  CreateTaskPayload,
  TaskDto,
  TaskListDto,
  TaskStatus,
  UpdateTaskPayload,
} from "./tasks";

export type {
  CreateUserPayload,
  UpdateUserPayload,
  UserDto,
  UserPagedResult,
} from "./users";

export type {
  ProjectFileDto,
  ProjectFilePagedResult,
  UploadProjectFilePayload,
} from "./files";

export type {
  ClientDto,
  ClientPagedResult,
  CreateClientPayload,
  UpdateClientPayload,
} from "./clients";


export type { Report, ReportPagedResult, CreateReportPayload } from "./reports";

export type * from "./label";
