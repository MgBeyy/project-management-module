// src/types/projects/api.ts

import { BaseEntity, DateString } from '../common';

// API'den gelen response türleri
export interface ProjectDto extends BaseEntity {
  // camelCase (API standard)
  code?: string;
  title?: string;
  description?: string;
  plannedStartDate?: DateString;
  plannedDeadline?: DateString;
  plannedHours?: number;
  startedAt?: DateString;
  endAt?: DateString;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  clientId?: string;
  clientName?: string;
  parentProjectIds?: string[];
  parentProjects?: ProjectDto[];
  labelIds?: string[];
  labels?: LabelDto[];
  progress?: number;
  actualHours?: number;

  // PascalCase (mevcut kod uyumluluğu için)
  Id?: number | null;
  Code?: string;
  Title?: string;
  PlannedStartDate?: string;
  PlannedDeadLine?: string;
  PlannedHours?: number;
  StartedAt?: string | null;
  EndAt?: string | null;
  Status?: string;
  Priority?: string;
  rawPlannedStartDate?: number | null;
  rawPlannedDeadline?: number | null;
  rawStartedAt?: number | null;
  rawEndAt?: number | null;
  rawStatus?: number;
  ClientId?: string;
  ParentProjectIds?: string[];
  LabelIds?: string[];
}

// API'ye gönderilen request türleri
export interface CreateProjectRequest {
  code?: string;
  title: string;
  description?: string;
  plannedStartDate?: DateString;
  plannedDeadline?: DateString;
  plannedHours?: number;
  startedAt?: DateString;
  endAt?: DateString;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  clientId?: string;
  parentProjectIds?: string[];
  labelIds?: string[];
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: number;
}

// Enum değerleri
export enum ProjectStatus {
  PLANNED = 0,
  ACTIVE = 1,
  COMPLETED = 2,
  PASSIVE = 3,
}

export enum ProjectPriority {
  HIGH = 0,
  MEDIUM = 1,
  LOW = 2,
}

// Label türleri
export interface LabelDto extends BaseEntity {
  name: string;
  description?: string;
  color: string;
}

// Client türü (basit versiyon)
export interface ClientDto extends BaseEntity {
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
}