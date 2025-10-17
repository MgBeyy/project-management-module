import axios from "axios";
import { showNotification } from "@/utils/notification";

const myBaseURL = import.meta.env.VITE_APP_API_URL;
console.log("🌍 Base URL:", myBaseURL);
const apiClient = axios.create({
  baseURL: myBaseURL + "/api",
  withCredentials: true,
});
// apiClient.interceptors.request.use(config => {
//   const language =
//     localStorage.getItem("language-option") || appSettings.DEFAULT_LANGUAGE;
//   config.headers["Accept-Language"] = language;
//   return config;
// });
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ API Interceptor Response yakalandı:", response);
    return response;
  },
  (error) => {
    console.log("🚨 API Interceptor Error yakalandı:", error);

    if (!error.response) {
      // Network hatası
      console.log("📡 Network error - notification gösteriliyor");
      showNotification.error(
        "Bağlantı Hatası",
        "İnternet bağlantınızı kontrol edin"
      );
    } else {
      const status = error.response.status;
      const errorMessage =
        error.response.data?.message || error.response.data?.title;

      if (status >= 400 && status < 500) {
        showNotification.error(
          "Hata",
          errorMessage || "İstek işlenirken bir hata oluştu"
        );
      }
      // 500'lü hatalar: Genel mesaj göster
      else if (status >= 500) {
        showNotification.error("Sunucu Hatası", "Beklenmedik bir hata oluştu");
      }
      // Diğer durumlar
      else {
        showNotification.error(
          "Hata",
          errorMessage || "Beklenmedik bir hata oluştu"
        );
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
