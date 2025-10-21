import apiClient from "../api-client";

export interface CreateTaskData {
  code: string;
  projectId: number;
  parentTaskId?: number | null;
  title: string;
  description?: string;
  status?: number;
  plannedHours?: number | null;
  actualHours?: number | null;
}

export const createTask = async (data: CreateTaskData) => {
  try {
    const response = await apiClient.post("/Task", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
