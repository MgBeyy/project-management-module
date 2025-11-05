import apiClient from "../api-client";

export type TaskStatus =
  | "Todo"
  | "InProgress"
  | "Done"
  | "Inactive"
  | "WaitingForApproval";

export type TaskHierarchyQuery = {
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
  id?: number;
  code?: string;
  title?: string;
  description?: string;
  projectId?: number;
  parentTaskId?: number;
  status?: TaskStatus;
  priority?: string;
  plannedStartDate?: string | Date | null;
  plannedStartDateMin?: string | Date | null;
  plannedStartDateMax?: string | Date | null;
  plannedEndDate?: string | Date | null;
  plannedEndDateMin?: string | Date | null;
  plannedEndDateMax?: string | Date | null;
  plannedHours?: number;
  plannedHoursMin?: number;
  plannedHoursMax?: number;
  actualHours?: number;
  actualHoursMin?: number;
  actualHoursMax?: number;
  createdAt?: number;
  createdAtMin?: number;
  createdAtMax?: number;
  assignedUserId?: number;
  labelIds?: string;
  page?: number;
  pageSize?: number;
};

export async function GetTasksHierarchy({
  query,
}: {
  query: TaskHierarchyQuery;
}): Promise<{ data: any[]; totalRecords: number }> {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        // Convert camelCase to PascalCase for API
        const apiKey = key.charAt(0).toUpperCase() + key.slice(1);
        queryParams.append(apiKey, value.toString());
      }
    });

    // /Task/query-hierarchy endpoint'ini kullan
    const url = `Task/query-hierarchy?${queryParams.toString()}`;
    console.log("🌐 API Request URL:", url);

    const response = await apiClient.get(url);
    console.log("✅ API Response:", response);
    console.log("✅ Response Data:", response.data);

    // Backend'den gelen response yapısını kontrol et
    // Eğer response.data direkt array ise
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        totalRecords: response.data.length
      };
    }
    
    // Eğer response.data.result yapısı varsa
    const result = response.data.result || response.data;
    
    // Backend'den gelen data zaten hierarchy yapısında
    return {
      data: result.data || result || [],
      totalRecords: result.totalRecords || (result.data || result || []).length
    };
  } catch (error: any) {
    console.error("Error fetching task hierarchy:", error);
    throw error;
  }
}
