// src/types/activities/api.ts

import { BaseEntity, DateString } from '../common';

export interface ActivityDto extends BaseEntity {
  title: string;
  description?: string;
  type: ActivityType;
  status: ActivityStatus;
  priority: ActivityPriority;
  startDate?: DateString;
  endDate?: DateString;
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
  tags?: string[];
  attachments?: ActivityAttachment[];
}

export interface ActivityAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: DateString;
}

export interface CreateActivityRequest {
  title: string;
  description?: string;
  type: ActivityType;
  priority?: ActivityPriority;
  startDate?: DateString;
  endDate?: DateString;
  estimatedHours?: number;
  projectId?: number;
  assignedUserId?: number;
  tags?: string[];
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {
  id: number;
  status?: ActivityStatus;
  actualHours?: number;
}

export enum ActivityType {
  TASK = 0,
  BUG = 1,
  FEATURE = 2,
  MEETING = 3,
  REVIEW = 4,
}

export enum ActivityStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  IN_REVIEW = 2,
  DONE = 3,
  CANCELLED = 4,
}

export enum ActivityPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  URGENT = 3,
}