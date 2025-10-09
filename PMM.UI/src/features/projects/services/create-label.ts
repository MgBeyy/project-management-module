import apiClient from "../../../services/api-client";

export async function createLabel(labelData: any) {
  try {
    const response = await apiClient.post("/Label", labelData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    console.error("Label oluşturulurken hata oluştu:", error);
    return null;
  }
}
