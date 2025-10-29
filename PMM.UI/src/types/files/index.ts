// src/types/files/index.ts

import type { DateTimeString, Nullable, PagedResult } from "../common";

export interface ProjectFileDto {
  id: number;
  file: string | null;
  title: string | null;
  description: Nullable<string>;
  projectId: number;
  createdById: number;
  createdAt: DateTimeString;
  updatedById: Nullable<number>;
  updatedAt: Nullable<DateTimeString>;
}

export type ProjectFilePagedResult = PagedResult<ProjectFileDto>;

export interface UploadProjectFilePayload {
  projectId: number;
  file: File;
  title?: string;
  description?: string;
}
