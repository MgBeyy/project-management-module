import { create } from 'zustand';

interface TaskData {
  key: number;
  Id: number | null;
  ProjectId: number;
  ParentTaskId: number | null;
  Title: string;
  Description: string | null;
  Status: string;
  CreatedAt: string;
  CreatedById: number;
  UpdatedAt: string | null;
  UpdatedById: number | null;
  Weight: number;
  PlannedHours: number | null;
  ActualHours: number | null;
}

interface TasksState {
  tasks: TaskData[];
  selectedTask: TaskData | null;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  isLoading: boolean;
  filters: Record<string, any>;
  refreshTrigger: number;
  
  // Actions
  setTasks: (tasks: TaskData[]) => void;
  setSelectedTask: (task: TaskData | null) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  setIsLoading: (loading: boolean) => void;
  setFilters: (filters: Record<string, any>) => void;
  resetFilters: () => void;
  clearSelectedTask: () => void;
  triggerRefresh: () => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  selectedTask: null,
  currentPage: 1,
  pageSize: 50,
  totalItems: 0,
  isLoading: true,
  filters: {},
  refreshTrigger: 0,
  
  setTasks: (tasks) => set({ tasks }),
  
  setSelectedTask: (task) => set({ selectedTask: task }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setPageSize: (size) => set({ pageSize: size }),
  
  setTotalItems: (total) => set({ totalItems: total }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setFilters: (filters) => set({ filters }),
  
  resetFilters: () => set({ filters: {}, currentPage: 1 }),
  
  clearSelectedTask: () => set({ selectedTask: null }),
  
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
