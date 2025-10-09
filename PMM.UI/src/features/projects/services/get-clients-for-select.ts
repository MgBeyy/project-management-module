import apiClient from "../../../services/api-client"; // dosya yolunu kendi yapına göre düzenle

export async function getClientsForSelect(searchText: string) {
  try {
    const res = await apiClient.get("/Client", {
      params: {
        Search: searchText.trim(),
        limit: 50,
      },
      timeout: 5000, // 5 saniye timeout
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Interceptor zaten toast mesajlarını gösteriyor.
    // İstersen sadece veriyi return edebilirsin:
    return res.data.result?.data || [];
  } catch (error) {
    console.error("❌ Client verisi alınamadı:", error);
    // Interceptor zaten hata toast'ını gösterecek.
    return [];
  }
}
