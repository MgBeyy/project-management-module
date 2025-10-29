import { ActivityListDto } from "@/types";
import apiClient from "../api-client";

type ActivityQuery = {
  page?: number;
  pageSize?: number;
  id?: number;
  taskId?: number;
  userId?: number;
  description?: string;
  startTime?: number;
  startTimeMin?: number;
  startTimeMax?: number;
  endTime?: number;
  endTimeMin?: number;
  endTimeMax?: number;
  totalHours?: number;
  totalHoursMin?: number;
  totalHoursMax?: number;
  createdAt?: number;
  createdAtMin?: number;
  createdAtMax?: number;
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
};

export async function GetActivities({ query }: { query: ActivityQuery }): Promise<ActivityListDto> {
  try {
    const response = await apiClient.get("/Activity", {
      params: query,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    return response.data.result;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
}
