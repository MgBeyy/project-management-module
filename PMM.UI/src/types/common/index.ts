// src/types/common/index.ts

// Ortak kullanılan temel türler

export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
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

// Form durumları için
export type FormMode = 'create' | 'edit' | 'view';

// API istek durumları için
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Tarih türleri
export type DateString = string; // ISO format: "2023-12-25T10:30:00Z"
export type Timestamp = number; // Unix timestamp

// Enum türleri için base
export interface EnumValue {
  value: number;
  label: string;
  color?: string;
}