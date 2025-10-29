// src/types/projects/ui.ts

import { ProjectDto } from "./api";


export type ProjectModalMode = "create" | "edit" | "view";

export interface ProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectData?: ProjectDto | null;
  mode?: ProjectModalMode;
}

export interface CreateLabelModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialData?: {
    id?: string;
    name?: string;
    description?: string;
    color?: string;
  };
  onSuccess?: (labelData: any) => void;
  onCancel: () => void;
}