import { CreateReportPayload, Report } from "@/types";
import apiClient from "../api-client";

export async function createReport(data: CreateReportPayload): Promise<Report> {
  try {
    const response = await apiClient.post("/Reports", data);
    return response.data.result;
  } catch (error) {
    throw error;
  }
}
