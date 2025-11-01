
import { ProjectHierarchyDto } from "@/types";
import apiClient from "../api-client";



export async function getProjectHierarchy(id: string): Promise<ProjectHierarchyDto> {
  try {
    const res = await apiClient.get(
      `Project/hierarchy/${encodeURIComponent(id)}`
    );
    const raw = res?.data?.result ?? res?.data;
    if (!raw) throw new Error("Proje bulunamadı");

    return raw;
  } catch (e) {
    // burada isterseniz error logging ekleyin
    throw e;
  }
}
