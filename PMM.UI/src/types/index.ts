// src/types/index.ts

// Tüm type'ları merkezi olarak export et
export * from './common';

// Domain bazlı export'lar
export * from './projects';
export * from './activities';
export * from './tasks';
export * from './users';

// Belirli türleri yeniden export et (kolay erişim için)
export type {
  BaseEntity,
  ApiResponse,
  PaginatedResponse,
  SelectOption,
  MultiSelectOption,
  FormMode,
  LoadingState,
} from './common';

export type {
  ProjectDto,
  ProjectStatus,
  ProjectPriority,
  LabelDto,
  ClientDto,
} from './projects';

export type {
  ActivityDto,
  ActivityType,
  ActivityStatus,
  ActivityPriority,
} from './activities';

export type {
  TaskDto,
  TaskStatus,
  TaskPriority,
} from './tasks';

export type {
  UserDto,
  UserRole,
} from './users';