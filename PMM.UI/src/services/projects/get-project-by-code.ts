import apiClient from "@/services/api-client";
import { formatDate, formatDateTime } from "@/utils/retype";

export interface Label {
  id: number;
  name: string;
  color: string;
  description: string | null;
  createdAt: string;
  createdById: number;
  updatedAt: string | null;
  updatedById: number | null;
}

// Normalized project shape similar to table/store
export interface ProjectDetails {
  Id: number | null;
  Code: string;
  Title: string;
  PlannedStartDate: string;
  PlannedDeadLine: string;
  PlannedHours: number | null;
  StartedAt: string | null;
  EndAt: string | null;
  Status: string;
  Priority: string;
  ParentProjectIds: number[];
  ClientId: number | null;
  Labels: Label[];
  AssignedUsers: any[]; // Add assigned users
  CreatedById: number;
  CreatedAt: string;
  UpdatedById: number | null;
  UpdatedAt: string | null;
}

function normalize(item: any): ProjectDetails {
  return {
    Id: item?.id ?? null,
    Code: item?.code ?? "N/A",
    Title: item?.title ?? "Başlık Yok",
    PlannedStartDate: formatDate(item?.plannedStartDate),
    PlannedDeadLine: formatDate(item?.plannedDeadline ?? item?.plannedDeadLine),
    PlannedHours: item?.plannedHours ?? item?.plannedHours ?? null,
    StartedAt: formatDateTime(item?.startedAt),
    EndAt: formatDateTime(item?.endAt),
    Status: item?.status ?? "Belirtilmemiş",
    Priority: item?.priority ?? "Düşük",
    ParentProjectIds: item?.parentProjectIds ?? [],
    ClientId: item?.clientId ?? null,
    Labels: item?.labels ?? [],
    AssignedUsers: item?.assignedUsers ?? [],
    CreatedById: item?.createdById ?? 0,
    CreatedAt: formatDateTime(item?.createdAt),
    UpdatedById: item?.updatedById ?? null,
    UpdatedAt: formatDateTime(item?.updatedAt),
  };
}

// Tries multiple endpoints to improve compatibility
export async function getProjectByCode(code: string): Promise<ProjectDetails | null> {
  // Attempt 1: RESTful by code: /Project/{code}
  try {
    const res = await apiClient.get(`Project/detailed/${encodeURIComponent(code)}`);
    const raw = res.data?.result ?? res.data;
    if (raw) {
      return normalize(raw);
    }
  } catch (e) {
    // silently fall through to next option
  }

  // Attempt 2: query param: /Project?Code={code}
  try {
    const res = await apiClient.get(`Project?Code=${encodeURIComponent(code)}&page=1&pageSize=1`);
    const list = res.data?.result?.data ?? res.data?.data ?? res.data;
    if (Array.isArray(list) && list.length > 0) {
      return normalize(list[0]);
    }
  } catch (e) {
    // ignore, return null below
  }

  return null;
}
