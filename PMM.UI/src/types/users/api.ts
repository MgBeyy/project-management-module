// src/types/users/api.ts

import type { PagedResult } from "../common";

export interface UserDto {
  id: number;
  name: string | null;
  email: string | null;
}

export type UserPagedResult = PagedResult<UserDto>;

export interface CreateUserPayload {
  name: string;
  email: string;
}
export interface ClientDto {
  id: number;
  name: string | null;
}
export interface ClientListDto {
  data: ClientDto[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}
export type UpdateUserPayload = CreateUserPayload;
