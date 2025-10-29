import { ActivityDto } from "@/types";
import { create } from "zustand";

interface ActivityFilters {
  Search?: string;
  TaskId?: number;
  UserId?: number;
  StartTimeMin?: number;
  StartTimeMax?: number;
  EndTimeMin?: number;
  EndTimeMax?: number;
  page?: number;
  pageSize?: number;
}

interface ActivitiesStore {
  activities: ActivityDto[];
  selectedActivity: ActivityDto | null;
  filters: ActivityFilters;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  isLoading: boolean;
  refreshTrigger: number;
  
  setActivities: (activities: ActivityDto[]) => void;
  setSelectedActivity: (activity: ActivityDto | null) => void;
  setFilters: (filters: ActivityFilters) => void;
  resetFilters: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  setIsLoading: (loading: boolean) => void;
  triggerRefresh: () => void;
}

export const useActivitiesStore = create<ActivitiesStore>((set) => ({
  activities: [],
  selectedActivity: null,
  filters: {
    page: 1,
    pageSize: 50,
  },
  currentPage: 1,
  pageSize: 50,
  totalItems: 0,
  isLoading: false,
  refreshTrigger: 0,

  setActivities: (activities) => set({ activities }),
  setSelectedActivity: (activity) => set({ selectedActivity: activity }),
  setFilters: (filters) => set({ filters }),
  resetFilters: () =>
    set({
      filters: { page: 1, pageSize: 50 },
      currentPage: 1,
    }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size }),
  setTotalItems: (total) => set({ totalItems: total }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
