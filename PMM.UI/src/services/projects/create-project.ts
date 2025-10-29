import apiClient from "../api-client";
import type { CreateProjectPayload, ProjectDto } from "@/types";

export async function createProject(data: CreateProjectPayload) : Promise<ProjectDto> {
  try {
    const response = await apiClient.post("/Project", data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Proje oluşturulurken hata oluştu:", error);
    throw error;
  }
}
