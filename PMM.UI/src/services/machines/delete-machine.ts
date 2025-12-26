import apiClient from "../api-client";

export async function deleteMachine(id: number): Promise<void> {
    try {
        await apiClient.delete(`/Machine/${id}`);
    } catch (error) {
        console.error("Error deleting machine:", error);
        throw error;
    }
}
