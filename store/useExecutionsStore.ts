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
    id?: number;
    instanceId?: number;
    workflowId?: string;
    search?: string;
    workflowName?: string;
    n8nId?: string;
    status?: string;
    mode?: string;
    finished?: boolean;
    hasErrors?: boolean;
    isArchived?: boolean;
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
    // Enforce API limit of 100
    const validLimit = Math.min(limit, 100);
    if (limit > 100) {
      set({ 
        error: 'Limit cannot exceed 100. Maximum limit is 100.',
        isLoading: false 
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await getAllExecutions(page, validLimit, filters);

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
          error: response.message || 'Failed to fetch executions',
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
