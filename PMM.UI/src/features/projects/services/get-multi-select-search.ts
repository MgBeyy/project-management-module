import apiClient from "../../../services/api-client";

export default async function getMultiSelectSearch(
  searchText: any,
  apiUrl: any
) {
  try {
    const response = await apiClient.get(apiUrl, {
      params: {
        Search: searchText.trim(),
      },
    });

    return response.data.result || [];
  } catch (error) {
    console.error("API Hatası:", error);
    return [];
  }
}
