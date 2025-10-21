import apiClient from "../api-client";
import type { ProjectFileDto } from "@/types";

type AnyRecord = Record<string, unknown>;

const asRecord = (value: unknown): AnyRecord | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as AnyRecord)
    : null;

const asNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

const asString = (value: unknown): string | null => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return null;
};

const findFirstArray = (
  value: unknown,
  visited = new Set<unknown>(),
): unknown[] | null => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  if (visited.has(value)) {
    return null;
  }

  visited.add(value);

  const record = value as AnyRecord;
  for (const key of ["data", "Data", "result", "Result"]) {
    if (key in record) {
      const found = findFirstArray(record[key], visited);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

const findRecordWithKey = (
  value: unknown,
  keys: string[],
  visited = new Set<unknown>(),
): AnyRecord | null => {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  if (visited.has(record)) {
    return null;
  }

  visited.add(record);

  if (keys.some(key => key in record)) {
    return record;
  }

  for (const nestedKey of ["result", "Result", "data", "Data"]) {
    if (nestedKey in record) {
      const nested = findRecordWithKey(record[nestedKey], keys, visited);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
};

const readNumberFromPayload = (
  payload: unknown,
  keys: string[],
  fallback: number,
): number => {
  const record = findRecordWithKey(payload, keys);
  if (!record) {
    return fallback;
  }

  for (const key of keys) {
    if (key in record) {
      const numeric = asNumber(record[key]);
      if (numeric !== null) {
        return numeric;
      }
    }
  }

  return fallback;
};

export const normalizeProjectFile = (raw: unknown): ProjectFileDto | null => {
  const source = asRecord(raw);

  if (!source) {
    return null;
  }

  const id = asNumber(source.id ?? source.Id);
  if (id === null) {
    return null;
  }

  const projectId = asNumber(source.projectId ?? source.ProjectId) ?? 0;
  const createdById = asNumber(source.createdById ?? source.CreatedById) ?? 0;
  const updatedByIdValue = source.updatedById ?? source.UpdatedById;
  const updatedById =
    updatedByIdValue === undefined || updatedByIdValue === null
      ? null
      : asNumber(updatedByIdValue);

  const descriptionValue = source.description ?? source.Description;
  const description =
    descriptionValue === undefined || descriptionValue === null
      ? null
      : String(descriptionValue);

  const updatedAtValue = source.updatedAt ?? source.UpdatedAt;
  const resolvedUpdatedAt =
    updatedAtValue === undefined || updatedAtValue === null
      ? null
      : String(updatedAtValue);

  return {
    id,
    file: asString(source.file ?? source.File) ?? "",
    title: asString(source.title ?? source.Title) ?? "Dosya",
    description,
    projectId,
    createdById,
    createdAt: asString(source.createdAt ?? source.CreatedAt) ?? "",
    updatedById: updatedById ?? null,
    updatedAt: resolvedUpdatedAt,
  };
};

const extractFiles = (payload: unknown): ProjectFilesResult => {
  const rawItems = findFirstArray(payload) ?? [];
  const files = rawItems
    .map(normalizeProjectFile)
    .filter((file): file is ProjectFileDto => file !== null);

  const totalRecords = readNumberFromPayload(
    payload,
    ["totalRecords", "TotalRecords"],
    files.length,
  );

  const page = readNumberFromPayload(
    payload,
    ["page", "Page"],
    1,
  );

  const pageSize = readNumberFromPayload(
    payload,
    ["pageSize", "PageSize"],
    files.length || 10,
  );

  return {
    files,
    totalRecords,
    page,
    pageSize,
  };
};

export interface ProjectFilesQuery {
  projectId: number;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ProjectFilesResult {
  files: ProjectFileDto[];
  totalRecords: number;
  page: number;
  pageSize: number;
}

export async function getProjectFiles({
  projectId,
  page = 1,
  pageSize = 50,
  search,
}: ProjectFilesQuery): Promise<ProjectFilesResult> {
  const params: Record<string, unknown> = {
    ProjectId: projectId,
    page,
    pageSize,
  };

  if (typeof search === "string" && search.trim().length > 0) {
    params.Search = search.trim();
  }

  const response = await apiClient.get("/File", { params });

  return extractFiles(response.data);
}
