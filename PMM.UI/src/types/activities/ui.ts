// src/types/activities/ui.ts

import { FormMode } from '../common';
import { ActivityDto } from './api';

export interface ActivityModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  activityData?: ActivityDto | null;
  mode?: FormMode;
}

export interface ActivityFormValues {
  title: string;
  description?: string;
  type: number;
  status?: number;
  priority?: number;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  projectId?: number;
  assignedUserId?: number;
  tags?: string[];
}

export interface ActivityListProps {
  activities: ActivityDto[];
  loading?: boolean;
  onEdit?: (activity: ActivityDto) => void;
  onDelete?: (activityId: number) => void;
  onView?: (activity: ActivityDto) => void;
  onStatusChange?: (activityId: number, status: number) => void;
}

export interface ActivityFilters {
  type?: number[];
  status?: number[];
  priority?: number[];
  projectId?: number[];
  assignedUserId?: number[];
  dateRange?: [string, string];
  tags?: string[];
  searchText?: string;
}

export interface ActivityQueryParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: ActivityFilters;
}