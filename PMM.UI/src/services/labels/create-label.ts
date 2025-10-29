import { CreateLabelPayload, LabelDto } from "@/types";
import apiClient from "../api-client";

export async function createLabel(labelData: CreateLabelPayload) : Promise<LabelDto> {
  try {
    const response = await apiClient.post("Label", labelData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    return error.response;
  }
}
