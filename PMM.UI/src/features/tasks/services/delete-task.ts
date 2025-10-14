import apiClient from "../../../services/api-client";

export async function deleteTask(taskId: number) {
  try {
    const response = await apiClient.delete(`/Task/${taskId}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    return response.data;
  } catch (error) {
    console.error("Görev silinirken hata oluştu:", error);
    throw error;
  }
}
