import apiClient from "@/services/api-client";

// Normalized project shape similar to table/store
export interface ProjectDetails {
  Id: number | null;
  Code: string;
  Title: string;
  PlannedStartDate: string;
  PlannedDeadLine: string;
  PlannedHourse: number;
  StartedAt: string | null;
  EndAt: string | null;
  Status: string;
  Priority: string;
}

function normalize(item: any): ProjectDetails {
  return {
    Id: item?.id ?? null,
    Code: item?.code ?? "N/A",
    Title: item?.title ?? "Başlık Yok",
    PlannedStartDate: item?.plannedStartDate ?? "-",
    PlannedDeadLine: item?.plannedDeadLine ?? "-",
    PlannedHourse: typeof item?.plannedHourse === "number" ? item.plannedHourse : 0,
    StartedAt: item?.startedAt ?? null,
    EndAt: item?.endAt ?? null,
    Status: item?.status ?? "Belirtilmemiş",
    Priority: item?.priority ?? "Düşük",
  };
}

// Tries multiple endpoints to improve compatibility
export async function getProjectByCode(code: string): Promise<ProjectDetails | null> {
  // Attempt 1: RESTful by code: /Project/{code}
  try {
    const res = await apiClient.get(`Project/${encodeURIComponent(code)}`);
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
