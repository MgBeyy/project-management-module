import { ClientPagedResult } from "@/types";
import apiClient from "../api-client";

interface ClientQuery {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
}

export async function GetClients({ query }: { query?: ClientQuery }): Promise<ClientPagedResult> {
  try {
    const response = await apiClient.get("/Client", {
      params: {
        Search: query?.search,
        Page: query?.page,
        PageSize: query?.pageSize,
        SortBy: query?.sortBy,
        SortDesc: query?.sortDesc
      },
    });

    return response.data.result;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
}
