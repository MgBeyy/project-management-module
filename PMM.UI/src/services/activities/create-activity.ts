import { ActivityDto, CreateActivityData } from "@/types";
import apiClient from "../api-client";



export const createActivity = async (data: CreateActivityData) : Promise<ActivityDto> => {
  try {
    const response = await apiClient.post("/Activity", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
