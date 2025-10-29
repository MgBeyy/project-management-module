// src/types/activities/api.ts

import type { DateTimeString, Nullable, PagedResult } from "../common";

export interface ActivityDto {
  id: number;
  taskId: number;
  userId: number;
  description: string | null;
  startTime: DateTimeString;
  endTime: DateTimeString;
  totalHours: number;
  isLast: boolean;
  createdAt: DateTimeString;
  createdById: number;
  updatedAt: Nullable<DateTimeString>;
  updatedById: Nullable<number>;
}

export type ActivityPagedResult = PagedResult<ActivityDto>;

export interface CreateActivityPayload {
  taskId: number;
  userId: number;
  description: string;
  startTime: DateTimeString;
  endTime: DateTimeString;
  isLast?: boolean;
}

export interface UpdateActivityPayload {
  description: string;
  startTime: DateTimeString;
  endTime: DateTimeString;
  isLast?: boolean;
}
