import apiClient from "../api-client";

export interface DownloadedFile {
  blob: Blob;
  fileName: string;
  contentType: string;
}
export async function downloadProjectFile(fileId: number): Promise<DownloadedFile> {
  const response = await apiClient.get(`/File/${fileId}/download`, {
    responseType: "blob",
  });

  const headers = response.headers ?? {};
  const contentDisposition = headers["content-disposition"] ?? "";
  const contentType = headers["content-type"] ?? "application/octet-stream";

  // filename* (RFC 5987/6266) -> decode et
  const fnStarMatch = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  // klasik filename=
  const fnMatch = contentDisposition.match(/filename\s*=\s*"([^"]+)"|filename\s*=\s*([^;]+)/i);

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
    fileName,           // burada isimlendirme yapmıyoruz; gelen adı kullanıyoruz
    contentType,
  };
}
