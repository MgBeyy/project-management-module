import apiClient from "../../../services/api-client";

export interface CreateActivityData {
  taskId: number;
  userId: number;
  description: string;
  startTime: number; // milliseconds
  endTime: number; // milliseconds
}

export const createActivity = async (data: CreateActivityData) => {
  try {
    const response = await apiClient.post("/Activity", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
