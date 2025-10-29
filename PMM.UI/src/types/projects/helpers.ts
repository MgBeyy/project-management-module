import { ProjectAssignmentRole, ProjectPriority, ProjectStatus } from "./api";

export const trToStatus: Record<string, ProjectStatus> = {
  "Planlandı": "Planned",
  "Aktif": "Active",
  "Tamamlandı": "Completed",
  "Pasif": "Inactive",
  "Onay Bekliyor": "WaitingForApproval",
};

export const normalizeStatus = (v: unknown): ProjectStatus | undefined => {
  if (!v) return undefined;
  if (typeof v !== "string") return undefined;
  // Zaten enum ismi gelmişse aynen döndür
  if (["Planned","Active","Completed","Inactive","WaitingForApproval"].includes(v)) {
    return v as ProjectStatus;
  }
  // TR metinden enum'a çevir
  return trToStatus[v];
};

export const trToPriority: Record<string, ProjectPriority> = {
  "Yüksek": "High",
  "Orta": "Regular",
  "Düşük": "Low",
};

export const normalizePriority = (v: unknown): ProjectPriority | undefined => {
  if (!v) return undefined;
  if (typeof v !== "string") return undefined;
  if (["High","Regular","Low"].includes(v)) {
    return v as ProjectPriority;
  }
  return trToPriority[v];
};



export const userRoleOptions: { value: ProjectAssignmentRole; label: string }[] = [
  { value: "Manager", label: "Yöneticisi" },
  { value: "Member", label: "Üye" },
  { value: "Reviewer", label: "Gözlemci" },
];

export const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "Planned", label: "Planlandı" },
  { value: "Active", label: "Aktif" },
  { value: "Completed", label: "Tamamlandı" },
  { value: "Inactive", label: "Pasif" },
  { value: "WaitingForApproval", label: "Onay Bekliyor" },
];

export const priorityOptions: { value: ProjectPriority; label: string }[] = [
  { value: "High", label: "Yüksek" },
  { value: "Regular", label: "Orta" },
  { value: "Low", label: "Düşük" },
];
