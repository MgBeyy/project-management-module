// src/types/files/index.ts
export interface ProjectFileDto {
  id: number;
  file: string;
  title: string;
  description?: string | null;
  projectId: number;
  createdById: number;
  createdAt: string;
  updatedById?: number | null;
  updatedAt?: string | null;
}

export interface UploadProjectFilePayload {
  projectId: number;
  file: File;
  title?: string;
  description?: string;
}
