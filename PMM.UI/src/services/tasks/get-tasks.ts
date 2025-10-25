import apiClient from "../api-client";

export enum TaskStatus {
  TODO = "Todo",
  IN_PROGRESS = "InProgress",
  DONE = "Done",
  INACTIVE = "InActive",
}

type TaskQuery = {
  page?: number;
  pageSize?: number;
  Id?: number;
  ProjectId?: number;
  ProjectCode?: string;
  ParentTaskId?: number;
  Title?: string;
  Description?: string;
  Status?: TaskStatus;
  PlannedHours?: number;
  PlannedHoursMin?: number;
  PlannedHoursMax?: number;
  ActualHours?: number;
  ActualHoursMin?: number;
  ActualHoursMax?: number;
  CreatedAt?: number;
  CreatedAtMin?: number;
  CreatedAtMax?: number;
  CreatedById?: number;
  UpdatedAt?: number;
  UpdatedAtMin?: number;
  UpdatedAtMax?: number;
  UpdatedById?: number;
  Search?: string;
  SortBy?: string;
  SortDesc?: boolean;
};

export async function GetTasks({ query }: { query: TaskQuery }) {
  try {
    const response = await apiClient.get("/Task", {
      params: query,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000,
    });
    console.log("GetTasks response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}
