import apiClient from "../../../services/api-client";

export async function GetProjects() {
  try {
    const response = await apiClient.get(`/Project`);
    return response;
  } catch (error: any) {
    return error.response;
  }
}
