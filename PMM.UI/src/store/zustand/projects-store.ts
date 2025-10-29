import { ProjectDto } from "@/types";
import { create } from "zustand";

export type ProjectSortKey =
  | "code"
  | "labels"
  | "title"
  | "plannedStartDate"
  | "plannedDeadline"
  | "plannedHours"
  | "startedAt"
  | "endAt"
  | "status"
  | "priority";

export type ProjectSortOrder = "ascend" | "descend" | null;

interface ProjectsState {
  projects: ProjectDto[];
  selectedProject: ProjectDto | null;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  isLoading: boolean;
  filters: Record<string, any>;
  refreshTrigger: number;
  sortBy: ProjectSortKey | null;
  sortOrder: ProjectSortOrder;

  // Actions
  setProjects: (projects: ProjectDto[]) => void;
  setSelectedProject: (project: ProjectDto | null) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  setIsLoading: (loading: boolean) => void;
  setFilters: (filters: Record<string, any>) => void;
  resetFilters: () => void;
  clearSelectedProject: () => void;
  triggerRefresh: () => void;
  setSortOptions: (sortBy: ProjectSortKey | null, sortOrder: ProjectSortOrder) => void;
  resetSorting: () => void;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  selectedProject: null,
  currentPage: 1,
  pageSize: 50,
  totalItems: 0,
  isLoading: true,
  filters: {},
  refreshTrigger: 0,
  sortBy: null,
  sortOrder: null,

  setProjects: (projects) => set({ projects }),

  setSelectedProject: (project) => set({ selectedProject: project }),

  setCurrentPage: (page) => set({ currentPage: page }),

  setPageSize: (size) => set({ pageSize: size }),

  setTotalItems: (total) => set({ totalItems: total }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setFilters: (filters) => set({ filters }),

  resetFilters: () => set({ filters: {}, currentPage: 1, sortBy: null, sortOrder: null }),

  clearSelectedProject: () => set({ selectedProject: null }),

  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),

  setSortOptions: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

  resetSorting: () => set({ sortBy: null, sortOrder: null }),
}));
