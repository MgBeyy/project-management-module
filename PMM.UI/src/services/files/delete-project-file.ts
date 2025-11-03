import apiClient from "../api-client";

export interface DeleteProjectFilePayload {
  fileId: number;
}

export async function deleteProjectFile({ fileId }: DeleteProjectFilePayload): Promise<void> {
  await apiClient.delete(`/File/${fileId}`);
}
