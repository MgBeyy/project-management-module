import apiClient from "../api-client";

export async function updateLabel(labelId: string | number, labelData: any) {
  try {
    const response = await apiClient.put(`/Label/${labelId}`, labelData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    console.error("Label güncellenirken hata oluştu:", error);
    throw error;
  }
}
