import { CreateClientPayload, ClientDto } from "@/types";
import apiClient from "../api-client";

export async function createClient(payload: CreateClientPayload): Promise<ClientDto> {
    try {
        const response = await apiClient.post("/Client", payload);
        return response.data.result;
    } catch (error) {
        console.error("Error creating client:", error);
        throw error;
    }
}
