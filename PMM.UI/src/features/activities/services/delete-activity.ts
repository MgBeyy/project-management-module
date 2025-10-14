import apiClient from "../../../services/api-client";

export const deleteActivity = async (activityId: number) => {
  try {
    const response = await apiClient.delete(`/Activity/${activityId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
