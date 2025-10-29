// src/types/common/index.ts
// Shared primitives and helpers for API shapes that are currently in use.

export type DateString = string;
export type DateTimeString = string;
export type Nullable<T> = T | null;

export interface ApiResponse<T = unknown> {
  version?: string | null;
  statusCode: number;
  message?: string | null;
  isError?: boolean | null;
  responseException?: unknown;
  result?: T | null;
}

export interface PagedResult<T> {
  page?: number;
  pageSize?: number;
  totalRecords: number;
  totalPages: number;
  data: T[];
}

export interface IdNameDto {
  id: number;
  name: string | null;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectOption extends SelectOption {
  key: string;
  color?: string;
  description?: string;
}
