import apiClient from "../api-client";

export interface UpdateProjectData {
  title: string;
  plannedStartDate?: number | null;
  plannedDeadline?: number | null;
  plannedHours?: number | null;
  startedAt?: number | null;
  endAt?: number | null;
  status: number;
  priority: string;
  parentProjectIds?: number[];
  labelIds?: number[];
}

export async function updateProject(projectId: number, data: UpdateProjectData) {
  try {
    const response = await apiClient.put(`/Project/${projectId}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    return response.data;
  } catch (error) {
    console.error("Proje güncellenirken hata oluştu:", error);
    throw error;
  }
}
