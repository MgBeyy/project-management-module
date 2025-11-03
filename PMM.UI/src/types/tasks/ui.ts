// src/types/tasks/ui.ts

import { IdNameDto } from "../common";
import { LabelDto } from "../label/api";

export type TaskModalMode = "create" | "edit" | "view";

export interface TaskModalTask {
  id: number | null;
  code?: string | null;
  projectId?: number | null;
  projectCode?: string | null;
  parentTaskId?: number | null;
  parentTaskCode?: string | null;
  parentTaskTitle?: string | null;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  createdAt?: number | null;
  createdById?: number | null;
  updatedAt?: number | null;
  updatedById?: number | null;
  plannedHours?: number | null;
  actualHours?: number | null;
  assignedUsers?: IdNameDto[];
  labels?: LabelDto[];
}

export interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: TaskModalMode;
  taskData?: TaskModalTask | null;
}
export enum TaskStatus {
  TODO = "Todo",
  IN_PROGRESS = "InProgress",
  DONE = "Done",
  INACTIVE = "Inactive",
  WAITING_FOR_APPROVAL = "WaitingForApproval",
}
