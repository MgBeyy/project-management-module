import { TaskListDto, TaskQuery } from "@/types";
import apiClient from "../api-client";




export async function GetTasks({ query }: { query: TaskQuery }) : Promise<TaskListDto> {
  try {
    const response = await apiClient.get("/Task", {
      params: query,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    console.log("GetTasks response:", response.data);
    return response.data.result;
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}
