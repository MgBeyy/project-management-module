import apiClient from "../api-client";
import type { UpdateProjectPayload } from "@/types";

export async function updateProject(projectId: number, data: UpdateProjectPayload) {
  try {
    const response = await apiClient.put(`/Project/${projectId}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Proje güncellenirken hata oluştu:", error);
    throw error;
  }
}
