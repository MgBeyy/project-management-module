import apiClient from "../api-client";

export async function deleteUser(userId: number): Promise<void> {
  try {
    await apiClient.delete(`/User/${userId}`);
  } catch (error) {
    throw error;
  }
}
