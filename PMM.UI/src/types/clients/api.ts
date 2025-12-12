import { PagedResult } from "../common";

export interface ClientDto {
    id: number;
    name: string;
}

export type ClientPagedResult = PagedResult<ClientDto>;

export interface CreateClientPayload {
    name: string;
}

export interface UpdateClientPayload {
    name: string;
}
