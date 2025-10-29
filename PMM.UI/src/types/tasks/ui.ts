// src/types/tasks/ui.ts

export type TaskModalMode = "create" | "edit" | "view";

export interface TaskModalLabel {
  id: string | number;
  name: string;
  color?: string;
  description?: string;
}

export interface TaskModalUser {
  id: string | number;
  name: string;
}

export interface TaskModalTask {
  Id: number | null;
  Code?: string | null;
  ProjectId?: number | null;
  ProjectCode?: string | null;
  ParentTaskId?: number | null;
  ParentTaskCode?: string | null;
  ParentTaskTitle?: string | null;
  Title?: string | null;
  Description?: string | null;
  Status?: string | null;
  CreatedAt?: string | null;
  CreatedById?: number | null;
  UpdatedAt?: string | null;
  UpdatedById?: number | null;
  PlannedHours?: number | null;
  ActualHours?: number | null;
  AssignedUsers?: TaskModalUser[];
  Labels?: TaskModalLabel[];
  LabelIds?: Array<string | number>;
}

export interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: TaskModalMode;
  taskData?: TaskModalTask | null;
}
