// src/types/projects/ui.ts

import { ProjectData } from "@/store/zustand/projects-store";
import type { ProjectPriority, ProjectStatus } from "./api";

export type ProjectModalMode = "create" | "edit" | "view";

export interface ProjectModalLabel {
  id: number | string;
  name?: string | null;
  description?: string | null;
  color?: string | null;
}

export interface ProjectModalParentProject {
  id?: number | string | null;
  code?: string | null;
  title?: string | null;
}

export interface ProjectModalProject {
  Id: number | null;
  Code?: string | null;
  Title?: string | null;
  Labels?: ProjectModalLabel[] | null;
  labels?: ProjectModalLabel[] | null;
  LabelIds?: Array<number | string> | null;
  PlannedStartDate?: string | null;
  PlannedDeadLine?: string | null;
  PlannedHours?: number | null;
  StartedAt?: string | null;
  EndAt?: string | null;
  Status?: ProjectStatus | string | null;
  Priority?: ProjectPriority | string | null;
  ClientId?: number | null;
  Client?: { Name?: string | null } | null;
  ClientName?: string | null;
  ParentProjectIds?: Array<number | string> | null;
  ParentProjects?: ProjectModalParentProject[] | null;
  AssignedUsers?: Array<{
    userId?: number;
    id?: number;
    role?: string;
    user?: { name?: string | null };
  }> | null;
  rawPlannedStartDate?: number | null;
  rawPlannedDeadline?: number | null;
  rawStartedAt?: number | null;
  rawEndAt?: number | null;
  rawStatus?: number | null;
}

export interface ProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectData?: ProjectData | null;
  mode?: ProjectModalMode;
}

