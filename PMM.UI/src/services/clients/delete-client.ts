import apiClient from "../api-client";

export async function deleteClient(id: number): Promise<void> {
    try {
        await apiClient.delete(`/Client/${id}`);
    } catch (error) {
        console.error("Error deleting client:", error);
        throw error;
    }
}
