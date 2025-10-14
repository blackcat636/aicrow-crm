import { create } from 'zustand';
import { Execution } from '@/interface/Execution';
import { getAllExecutions } from '@/lib/api/executions';

interface ExecutionsStore {
  executions: Execution[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    status?: string;
    mode?: string;
    workflowId?: string;
    instanceId?: number;
  };
  fetchExecutions: (
    page?: number,
    limit?: number,
    filters?: ExecutionsStore['filters']
  ) => Promise<void>;
  updateExecutionInStore: (updatedExecution: Execution) => void;
  setFilters: (filters: ExecutionsStore['filters']) => void;
  clearFilters: () => void;
}

export const useExecutionsStore = create<ExecutionsStore>((set, get) => ({
  executions: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 50,
  totalPages: 0,
  filters: {},

  fetchExecutions: async (page = 1, limit = 50, filters = {}) => {
    set({ isLoading: true, error: null });

    try {
      const response = await getAllExecutions(page, limit, filters);

      if (response.status === 200) {
        set({
          executions: response.data.items,
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
          isLoading: false
        });
      } else {
        set({
          error: response.message,
          isLoading: false
        });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch executions',
        isLoading: false
      });
    }
  },

  updateExecutionInStore: (updatedExecution: Execution) => {
    set((state) => ({
      executions: state.executions.map((execution) =>
        execution.id === updatedExecution.id ? updatedExecution : execution
      )
    }));
  },

  setFilters: (filters) => {
    set({ filters });
  },

  clearFilters: () => {
    set({ filters: {} });
  }
}));
