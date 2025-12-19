import apiClient from "../api-client";

export async function deleteReport(id: number): Promise<void> {
  try {
    await apiClient.delete(`/Reports/${id}`);
  } catch (error) {
    throw error;
  }
}
