import apiClient from "../../../services/api-client";

export async function getClientsForSelect(searchText: string, url: string) {
  try {
    const res = await apiClient.get(url, {
      params: {
        Search: searchText.trim(),
        limit: 50,
      },
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return res.data.result || [];
  } catch (error) {
    console.error("Client verisi alınamadı:", error);
    return [];
  }
}
