import { CreateMachineForm, MachineDto } from "@/types";
import apiClient from "../api-client";

export async function createMachine(data: CreateMachineForm): Promise<MachineDto> {
    try {
        const response = await apiClient.post("/Machine", data);
        return response.data.result;
    } catch (error) {
        console.error("Error creating machine:", error);
        throw error;
    }
}
