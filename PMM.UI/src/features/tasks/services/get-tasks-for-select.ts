import apiClient from "../../../services/api-client";

interface TaskSelectQuery {
  searchText?: string;
  projectId?: number;
  page?: number;
  pageSize?: number;
}

export async function getTasksForSelect({
  searchText = "",
  projectId,
  page = 1,
  pageSize = 20,
}: TaskSelectQuery = {}) {
  try {
    const params: Record<string, any> = {
      page,
      pageSize,
    };

    const trimmedSearch = searchText.trim();
    if (trimmedSearch) {
      params.Search = trimmedSearch;
    }

    if (projectId !== undefined && projectId !== null) {
      params.ProjectId = projectId;
    }

    const response = await apiClient.get("/Task", {
      params,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    console.error("Üst görev verileri alınamadı:", error);
    return [];
  }
}
