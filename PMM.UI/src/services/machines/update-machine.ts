import { UpdateMachineForm, MachineDto } from "@/types";
import apiClient from "../api-client";

export async function updateMachine(id: number, data: UpdateMachineForm): Promise<MachineDto> {
    try {
        const response = await apiClient.put(`/Machine/${id}`, data);
        return response.data.result;
    } catch (error) {
        console.error("Error updating machine:", error);
        throw error;
    }
}
