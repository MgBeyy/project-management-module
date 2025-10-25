import apiClient from "../api-client";
import type { ProjectFileDto, UploadProjectFilePayload } from "@/types";
import { normalizeProjectFile } from "./get-project-files";

export async function uploadProjectFile({
  projectId,
  file,
  title,
  description,
  onProgress,
}: UploadProjectFilePayload & { onProgress?: (progress: number) => void }): Promise<ProjectFileDto> {
  const formData = new FormData();
  formData.append("ProjectId", projectId.toString());
  formData.append("FileContent", file);
  formData.append("Title", title ?? file.name);

  if (description && description.trim().length > 0) {
    formData.append("Description", description.trim());
  }

  const response = await apiClient.post("/File", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  const payload = response.data?.result ?? response.data;
  const normalized = normalizeProjectFile(payload);

  if (!normalized) {
    throw new Error("Sunucudan dönen dosya bilgisi çözümlenemedi.");
  }

  return normalized;
}
