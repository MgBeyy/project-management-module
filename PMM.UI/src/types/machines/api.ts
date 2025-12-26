import { PagedResult } from "../common";

export interface MachineDto {
    id: number;
    name: string;
    category?: string;
    brand?: string;
    model?: string;
    hourlyCost?: number;
    currency?: string;
    purchasePrice?: number;
    purchaseDate?: string; // date-time
    isActive: boolean;
    status: string; // Available | InUse | OutOfService | Maintenance
}

export type MachineDtoPagedResult = PagedResult<MachineDto>;

export interface CreateMachineForm {
    name: string;
    category?: string;
    brand?: string;
    model?: string;
    hourlyCost?: number;
    currency?: string;
    purchasePrice?: number;
    purchaseDate?: string;
    isActive?: boolean;
    status?: string;
}

export interface UpdateMachineForm {
    name: string;
    category?: string;
    brand?: string;
    model?: string;
    hourlyCost?: number;
    currency?: string;
    purchasePrice?: number;
    purchaseDate?: string;
    isActive?: boolean;
    status?: string;
}
