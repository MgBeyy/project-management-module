// src/types/index.ts
// Centralised re-export surface for the data shapes used by the UI.

export * from "./common";
export * from "./projects";
export * from "./activities";
export * from "./tasks";
export * from "./users";
export * from "./files";

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
  ActivityPagedResult,
  CreateActivityPayload,
  UpdateActivityPayload,
} from "./activities";

export type {
  CreateProjectPayload,
  DetailedProjectDto,
  ProjectDto,
  ProjectAssignmentItemPayload,
  ProjectAssignmentRole,
  ProjectAssignmentWithUserDto,
  ProjectPagedResult,
  ProjectPriority,
  ProjectStatus,
  UpdateProjectPayload,
} from "./projects";

export type {
  CreateTaskPayload,
  TaskDto,
  TaskPagedResult,
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

export type * from "./label";

