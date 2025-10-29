import { Nullable } from "../common";

export interface LabelDto {
  id: number;
  name: string;
  color: string;
  description: string | null;
  createdAt: number;
  createdById: number;
  updatedAt: Nullable<number>;
  updatedById: Nullable<number>;
}
export interface CreateLabelPayload {
  name: string;
  color?: Nullable<string>;
  description?: Nullable<string>;
}

export type UpdateLabelPayload = CreateLabelPayload;
