import type { PagedResult } from "./common";

export interface Report {
  id: number;
  type: string;
  name: string;
  description?: string;
  createdAt: string;
  file?: string;
}

export type ReportPagedResult = PagedResult<Report>;

export interface CreateReportPayload {
  type: string;
  name: string;
  filters?: Record<string, any>;
}
