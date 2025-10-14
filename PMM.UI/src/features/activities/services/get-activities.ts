import apiClient from "../../../services/api-client";

type ActivityQuery = {
  page?: number;
  pageSize?: number;
  Id?: number;
  TaskId?: number;
  UserId?: number;
  Description?: string;
  StartTime?: number;
  StartTimeMin?: number;
  StartTimeMax?: number;
  EndTime?: number;
  EndTimeMin?: number;
  EndTimeMax?: number;
  TotalHours?: number;
  TotalHoursMin?: number;
  TotalHoursMax?: number;
  CreatedAt?: number;
  CreatedAtMin?: number;
  CreatedAtMax?: number;
  Search?: string;
  SortBy?: string;
  SortDesc?: boolean;
};

export async function GetActivities({ query }: { query: ActivityQuery }) {
  try {
    const response = await apiClient.get("/Activity", {
      params: query,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
}
