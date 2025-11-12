import apiClient from "../api-client";
import { ProjectQuery } from "./get-projects";

export const getReport = async ({ query }: { query: ProjectQuery }) => {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/Reports/project-time-latency-direct` + `?${queryParams.toString()}`;
    console.log("🌐 API Request URL for Report:", url);
    const response = await apiClient.get(url, {
      responseType: "blob",
    });

    const headers = response.headers ?? {};
    const contentDisposition = headers["content-disposition"] ?? "";
    const contentType = headers["content-type"] ?? "application/octet-stream";

    
    // filename* (RFC 5987/6266) -> decode et
    const fnStarMatch = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    const fnMatch = contentDisposition.match(
      /filename\s*=\s*"([^"]+)"|filename\s*=\s*([^;]+)/i
    );

    let fileName = "";
    if (fnStarMatch && fnStarMatch[1]) {
      try {
        fileName = decodeURIComponent(fnStarMatch[1]);
      } catch {
        fileName = fnStarMatch[1]; // decode başarısızsa raw değer
      }
    } else if (fnMatch) {
      // Gruplardan hangisi doluysa onu al
      fileName = (fnMatch[1] || fnMatch[2] || "").trim();
    }

    return {
      blob: response.data,
      fileName, // burada isimlendirme yapmıyoruz; gelen adı kullanıyoruz
      contentType,
    };
  } catch (error) {
    console.error("Error fetching report:", error);
    throw error;
  }
};
