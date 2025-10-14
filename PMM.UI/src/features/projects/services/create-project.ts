import { useNotification } from "@/hooks/useNotification";
import apiClient from "../../../services/api-client";

export interface CreateProjectData {
  code?: string;
  title?: string;
  plannedHours?: number;
  plannedStartDate?: number; // milliseconds
  plannedDeadline?: number; // milliseconds
  startedAt?: number; // milliseconds
  endAt?: number; // milliseconds
  status?: number;
  priority?: string;
  clientId?: number;
  parentProjectIds?: number[];
  labelIds?: number[];
}

export async function createProject(data: CreateProjectData) {
  try {
    const response = await apiClient.post("/Project", data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    return response.data;
  } catch (error) {
    console.error("Proje oluşturulurken hata oluştu:", error);
    return null;
  }
}
