import { ReportPagedResult } from "@/types";
import apiClient from "../api-client";

interface ReportQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function GetReports({
  query,
}: {
  query?: ReportQuery;
}): Promise<ReportPagedResult> {
  try {
    const response = await apiClient.get("/Reports", {
      params: { ...query, pageSize: query?.pageSize || 100 },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data.result;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
}
