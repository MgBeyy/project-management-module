import apiClient from "../../../services/api-client";

export interface UpdateTaskData {
  projectId?: number;
  parentTaskId?: number | null;
  title?: string;
  description?: string;
  status?: number;
  weight?: number;
  plannedHours?: number | null;
  actualHours?: number | null;
}

export const updateTask = async (taskId: number, data: UpdateTaskData) => {
  try {
    const response = await apiClient.put(`/Task/${taskId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
