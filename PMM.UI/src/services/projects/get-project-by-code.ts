import apiClient from "@/services/api-client";
import { DetailedProjectDto } from "@/types";

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



function normalize(item: any): DetailedProjectDto {
  return {
    id: item?.id ?? null,
    code: item?.code ?? "N/A",
    title: item?.title ?? "Başlık Yok",
    plannedStartDate: item?.plannedStartDate,
    plannedDeadline: item?.plannedDeadline ?? null,
    plannedHours: item?.plannedHours ?? item?.plannedHours ?? null,
    startedAt: item?.startedAt,
    endAt: item?.endAt,
    status: item?.status ?? "Belirtilmemiş",
    priority: item?.priority ?? "Düşük",
    parentProjects: item?.parentProjects ?? [],
    clientId: item?.clientId ?? null,
    labels: item?.labels ?? [],
    assignedUsers: item?.assignedUsers ?? [],
    createdById: item?.createdById ?? 0,
    createdAt: item?.createdAt ?? null,
    updatedById: item?.updatedById ?? null,
    updatedAt: item?.updatedAt ?? null,
    actualHours: item?.actualHours ?? null,
    childProjects: item?.childProjects ?? [],
    client: item?.client ?? null,
    tasks: item?.tasks ?? [],
    createdByUser: item?.createdByUser ?? null,
    updatedByUser: item?.updatedByUser ?? null,
  };
}

// Tries multiple endpoints to improve compatibility
export async function getProjectById(id: string): Promise<DetailedProjectDto | null> {
  // Attempt 1: RESTful by id: /Project/{id}
  try {
    const res = await apiClient.get(`Project/detailed/${encodeURIComponent(id)}`);
    const raw = res.data?.result ?? res.data;
    if (raw) {
      return normalize(raw);
    }
  } catch (e) {
    // silently fall through to next option
  }

  // Attempt 2: query param: /Project?Id={id}
  try {
    const res = await apiClient.get(`Project?Id=${encodeURIComponent(id)}&page=1&pageSize=1`);
    const list = res.data?.result?.data ?? res.data?.data ?? res.data;
    if (Array.isArray(list) && list.length > 0) {
      return normalize(list[0]);
    }
  } catch (e) {
    // ignore, return null below
  }

  return null;
}
