import { FullProjectHierarchyDto } from "@/types";
import apiClient from "../api-client";

export type ProjectStatus =
  | "Active"
  | "Inactive"
  | "Completed"
  | "Planned"
  | "WaitingForApproval";

export type ProjectPriority = "High" | "Regular" | "Low";

export type ProjectHierarchyQuery = {
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
  id?: number;
  code?: string;
  title?: string;
  plannedStartDate?: string | Date | null;
  plannedStartDateMin?: string | Date | null;
  plannedStartDateMax?: string | Date | null;
  plannedDeadline?: string | Date | null;
  plannedDeadlineMin?: string | Date | null;
  plannedDeadlineMax?: string | Date | null;
  plannedHours?: number;
  plannedHoursMin?: number;
  plannedHoursMax?: number;
  actualHours?: number;
  actualHoursMin?: number;
  actualHoursMax?: number;
  startedAt?: string | Date | null;
  endAt?: string | Date | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  parentProjectId?: number;
  clientId?: number;
  labelIds?: string;
  page?: number;
  pageSize?: number;
};

export async function GetProjectsHierarchy({
  query,
}: {
  query: ProjectHierarchyQuery;
}): Promise<{ data: FullProjectHierarchyDto[]; totalRecords: number }> {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        // Convert camelCase to PascalCase for API
        const apiKey = key.charAt(0).toUpperCase() + key.slice(1);
        queryParams.append(apiKey, value.toString());
      }
    });

    // /Project/query-hierarchy endpoint'ini kullan
    const url = `Project/query-hierarchy?${queryParams.toString()}`;
    console.log("🌐 API Request URL:", url);

    const response = await apiClient.get(url);
    console.log("✅ API Response:", response);
    console.log("✅ Full Request URL:", response.config.url);

    // Backend'den direkt array dönüyor (paging yok)
    const hierarchyData = response.data.result || [];
    
    // Toplam kayıt sayısını recursive hesapla (tüm child projeleri say)
    const countAllProjects = (projects: any[]): number => {
      let count = 0;
      projects.forEach((project: any) => {
        count++; // Mevcut proje
        if (project.childProjects && Array.isArray(project.childProjects)) {
          count += countAllProjects(project.childProjects);
        }
      });
      return count;
    };
    
    return {
      data: hierarchyData,
      totalRecords: countAllProjects(hierarchyData)
    };
  } catch (error: any) {
    console.error("Error fetching project hierarchy:", error);
    throw error;
  }
}
