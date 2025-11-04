import { UserPagedResult } from "@/types";
import apiClient from "../api-client";

interface UserQuery {
  search: string;
  AssignedProjectIds?: number;
  AssignedTaskIds?: number;
  page?: number;
  pageSize?: number;
}

export async function GetUsers({query}: {query: UserQuery}) : Promise<UserPagedResult> {
  try {
    const response = await apiClient.get("/User", {
      params: {...query, pageSize: query.pageSize || 100},
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
