import { UserPagedResult } from "@/types";
import apiClient from "../api-client";

export async function GetUsers(search?: string) : Promise<UserPagedResult> {
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
    });

    return response.data.result;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}
