// src/types/projects/ui.ts

import { FormMode } from '../common';
import { ProjectDto } from './api';

// Modal props
export interface ProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectData?: ProjectDto | null;
  mode?: FormMode;
}

// Form değerleri
export interface ProjectFormValues {
  code?: string;
  title: string;
  description?: string;
  plannedStartDate?: string; // dayjs object için
  plannedDeadline?: string;
  plannedHours?: number;
  startedAt?: string;
  endAt?: string;
  status?: number;
  priority?: number;
  customer?: string;
  parentProjects?: string[];
  labels?: string[];
}

// Liste bileşeni props
export interface ProjectListProps {
  projects: ProjectDto[];
  loading?: boolean;
  onEdit?: (project: ProjectDto) => void;
  onDelete?: (projectId: number) => void;
  onView?: (project: ProjectDto) => void;
}

// Tablo sütun tanımları
export interface ProjectTableColumn {
  key: string;
  title: string;
  dataIndex: keyof ProjectDto;
  sorter?: boolean;
  width?: string | number;
  render?: (value: any, record: ProjectDto) => React.ReactNode;
}

// Filtreleme ve arama
export interface ProjectFilters {
  status?: number[];
  priority?: number[];
  clientId?: string[];
  labelIds?: string[];
  dateRange?: [string, string];
  searchText?: string;
}

export interface ProjectQueryParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: ProjectFilters;
}