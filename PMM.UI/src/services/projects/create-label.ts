import { CreateLabelPayload } from "@/types";
import apiClient from "../api-client";

export async function createLabel(labelData: CreateLabelPayload) {
  try {
    const response = await apiClient.post("Label", labelData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Label oluşturulurken hata oluştu:", error);
    return null;
  }
}
