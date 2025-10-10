import apiClient from "../../../services/api-client";

export enum ProjectStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  COMPLETED = "completed",
  PLANNED = "planned",
}

export enum ProjectPriority {
  DUSUK = "Low",
  ORTA = "Regular",
  YUKSEK = "High",
}

type ProjectQuery = {
  page?: number;
  pageSize?: number;
  Code?: string;
  Title?: string;
  PlannedStartDate?: string | Date | null;
  PlannedDeadLine?: string | Date | null;
  PlannedHourse?: number;
  StartedAt?: string | Date | null;
  EndAt?: string | Date | null;
  Status?: ProjectStatus;
  Priority?: ProjectPriority;
};

export async function GetProjects({ query }: { query: ProjectQuery }) {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const url = `Project?${queryParams.toString()}`;
    console.log("🌐 API Request URL:", url);

    const response = await apiClient.get(url);
    console.log("✅ API Response:", response);
    console.log("✅ Full Request URL:", response.config.url);

    return response.data.result;
  } catch (error: any) {
    return error.response;
  }
}
