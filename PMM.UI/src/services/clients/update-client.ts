import { UpdateClientPayload, ClientDto } from "@/types";
import apiClient from "../api-client";

export async function updateClient(id: number, payload: UpdateClientPayload): Promise<ClientDto> {
    try {
        const response = await apiClient.put(`/Client/${id}`, payload);
        return response.data.result;
    } catch (error) {
        console.error("Error updating client:", error);
        throw error;
    }
}
