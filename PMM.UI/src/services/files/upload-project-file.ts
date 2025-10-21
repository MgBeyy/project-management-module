import apiClient from "../api-client";
import type { ProjectFileDto, UploadProjectFilePayload } from "@/types";
import { normalizeProjectFile } from "./get-project-files";

export async function uploadProjectFile({
  projectId,
  file,
  title,
  description,
}: UploadProjectFilePayload): Promise<ProjectFileDto> {
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
  });

  const payload = response.data?.result ?? response.data;
  const normalized = normalizeProjectFile(payload);

  if (!normalized) {
    throw new Error("Sunucudan dönen dosya bilgisi çözümlenemedi.");
  }

  return normalized;
}
