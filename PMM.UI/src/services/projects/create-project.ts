import apiClient from "../api-client";
import type { CreateProjectPayload } from "@/types";

export async function createProject(data: CreateProjectPayload) {
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
    throw error;
  }
}
