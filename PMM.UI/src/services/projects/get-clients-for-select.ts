import apiClient from "../api-client";

export async function getClientsForSelect(searchText: string, url: string) {
  try {
    const res = await apiClient.get(url, {
      params: {
        Search: searchText.trim(),
        limit: 50,
      },
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
