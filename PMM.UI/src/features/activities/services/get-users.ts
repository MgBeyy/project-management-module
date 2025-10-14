import apiClient from "../../../services/api-client";

export async function GetUsers(search?: string) {
  try {
    const response = await apiClient.get("/User", {
      params: {
        Search: search,
        page: 1,
        pageSize: 100,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}
