import apiClient from "../../../services/api-client";

export async function createProject(data: any) {
  try {
    const response = await apiClient.post("/Project", data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    return response.data;
  } catch (error) {
    console.error("Proje oluşturulurken hata oluştu:", error);
    return null;
  }
}
