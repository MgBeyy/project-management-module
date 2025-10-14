import apiClient from "../../../services/api-client";

export async function deleteProject(projectId: number) {
  try {
    const response = await apiClient.delete(`/Project/${projectId}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    return response.data;
  } catch (error) {
    console.error("Proje silinirken hata oluştu:", error);
    throw error;
  }
}
