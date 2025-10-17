import apiClient from "../api-client";

export interface UpdateActivityData {
  taskId?: number;
  userId?: number;
  description?: string;
  startTime?: number; // milliseconds
  endTime?: number; // milliseconds
}

export const updateActivity = async (activityId: number, data: UpdateActivityData) => {
  try {
    const response = await apiClient.put(`/Activity/${activityId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
