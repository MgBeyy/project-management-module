// src/types/tasks/ui.ts

import { FormMode } from '../common';
import { TaskDto } from './api';

export interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  taskData?: TaskDto | null;
  mode?: FormMode;
}

export interface TaskFormValues {
  title: string;
  description?: string;
  status?: number;
  priority?: number;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  projectId?: number;
  assignedUserId?: number;
  parentTaskId?: number;
}

export interface TaskListProps {
  tasks: TaskDto[];
  loading?: boolean;
  onEdit?: (task: TaskDto) => void;
  onDelete?: (taskId: number) => void;
  onView?: (task: TaskDto) => void;
  onStatusChange?: (taskId: number, status: number) => void;
}

export interface TaskFilters {
  status?: number[];
  priority?: number[];
  projectId?: number[];
  assignedUserId?: number[];
  dueDateRange?: [string, string];
  searchText?: string;
}

export interface TaskQueryParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: TaskFilters;
}