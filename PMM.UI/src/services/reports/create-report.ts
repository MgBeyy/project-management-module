import { CreateReportPayload, Report } from "@/types";
import apiClient from "../api-client";

export async function createReport(data: CreateReportPayload): Promise<Report> {
  try {
    let endpoint = "/Reports";
    if (data.type === "ProjectTimeLatency") {
      endpoint = "/project-time-latency";
    } else if (data.type === "TaskReport") {
      endpoint = "/task-report";
    }

    const response = await apiClient.post(endpoint, data);
    return response.data.result;
  } catch (error) {
    throw error;
  }
}
