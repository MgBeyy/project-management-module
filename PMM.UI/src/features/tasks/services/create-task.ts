import apiClient from "../../../services/api-client";

export interface CreateTaskData {
  projectId: number;
  parentTaskId?: number | null;
  title: string;
  description?: string;
  status?: number;
  plannedHours?: number | null;
}

export const createTask = async (data: CreateTaskData) => {
  try {
    const response = await apiClient.post("/Task", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
