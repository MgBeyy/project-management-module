import { CreateUserPayload, UserDto } from "@/types";
import apiClient from "../api-client";

export async function createUser(data: CreateUserPayload): Promise<UserDto> {
  try {
    const response = await apiClient.post("/User", data);
    return response.data.result;
  } catch (error) {
    throw error;
  }
}
