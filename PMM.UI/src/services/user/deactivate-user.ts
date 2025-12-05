import apiClient from "../api-client";

export async function deactivateUser(userId: number): Promise<void> {
    try {
        await apiClient.put(`/User/${userId}/deactivate`);
    } catch (error) {
        throw error;
    }
}
