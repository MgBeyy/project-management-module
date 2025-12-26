import { MachineDtoPagedResult } from "@/types";
import apiClient from "../api-client";

interface MachineQuery {
    search?: string;
    sortBy?: string;
    sortDesc?: boolean;
    page?: number;
    pageSize?: number;
    id?: number;
    name?: string;
    category?: string;
    brand?: string;
    model?: string;
    hourlyCost?: number;
    hourlyCostMin?: number;
    hourlyCostMax?: number;
    currency?: string;
    purchasePrice?: number;
    purchasePriceMin?: number;
    purchasePriceMax?: number;
    purchaseDate?: string;
    purchaseDateMin?: string;
    purchaseDateMax?: string;
    isActive?: boolean;
    status?: string;
}

export async function GetMachines({ query }: { query?: MachineQuery }): Promise<MachineDtoPagedResult> {
    try {
        const response = await apiClient.get("/Machine", {
            params: {
                Search: query?.search,
                SortBy: query?.sortBy,
                SortDesc: query?.sortDesc,
                Page: query?.page,
                PageSize: query?.pageSize,
                Id: query?.id,
                Name: query?.name,
                Category: query?.category,
                Brand: query?.brand,
                Model: query?.model,
                HourlyCost: query?.hourlyCost,
                HourlyCostMin: query?.hourlyCostMin,
                HourlyCostMax: query?.hourlyCostMax,
                Currency: query?.currency,
                PurchasePrice: query?.purchasePrice,
                PurchasePriceMin: query?.purchasePriceMin,
                PurchasePriceMax: query?.purchasePriceMax,
                PurchaseDate: query?.purchaseDate,
                PurchaseDateMin: query?.purchaseDateMin,
                PurchaseDateMax: query?.purchaseDateMax,
                IsActive: query?.isActive,
                Status: query?.status,
            },
        });

        return response.data.result;
    } catch (error) {
        console.error("Error fetching machines:", error);
        throw error;
    }
}
