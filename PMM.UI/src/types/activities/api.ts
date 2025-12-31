// src/types/activities/api.ts

import type { DateTimeString, Nullable, PagedResult } from "../common";

export interface ActivityDto {
  id: number;
  taskId: number;
  userId: number | null;
  machineId: number | null;
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

export interface CreateActivityData {
  taskId: number;
  userId?: number | null;
  machineId?: number | null;
  description: string;
  startTime: number; // milliseconds
  endTime: number; // milliseconds
  isLast?: boolean;
}


export type ActivityListDto = PagedResult<ActivityDto>;

export interface UpdateActivityPayload {
  description: string;
  startTime: DateTimeString;
  endTime: DateTimeString;
  isLast?: boolean;
}
