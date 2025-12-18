import { create } from 'zustand';
import { getAllWorkflows, WorkflowFilters } from '@/lib/api/workflows';
import { Workflow } from '@/interface/Workflow';

interface WorkflowsStore {
  workflows: Workflow[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  filters: Omit<WorkflowFilters, 'page' | 'limit'>;
  fetchWorkflows: (filters?: WorkflowFilters) => Promise<void>;
  updateWorkflowInStore: (updatedWorkflow: Workflow) => void;
}

export const useWorkflowsStore = create<WorkflowsStore>((set, get) => ({
  workflows: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 20,
  filters: {},

  fetchWorkflows: async (filters: WorkflowFilters = {}) => {
    // Use current state as defaults if params not provided
    const currentPage = filters.page ?? get().page;
    const currentLimit = filters.limit ?? get().limit;
    const currentFilters = get().filters;

    // Merge filters
    const mergedFilters: WorkflowFilters = {
      page: currentPage,
      limit: currentLimit,
      ...currentFilters,
      ...filters
    };

    // Handle null values - convert to undefined to clear filters
    if (mergedFilters.instanceId === null) mergedFilters.instanceId = undefined;
    if (mergedFilters.active === null) mergedFilters.active = undefined;
    if (mergedFilters.availableToUsers === null) mergedFilters.availableToUsers = undefined;
    // Keep show as string ('true', 'false', or 'all') - don't convert to undefined
    if (mergedFilters.show === null) mergedFilters.show = undefined;
    
    // Enforce API limit of 100
    const validLimit = Math.min(mergedFilters.limit || 20, 100);
    if ((mergedFilters.limit || 20) > 100) {
      set({ 
        error: 'Limit cannot exceed 100. Maximum limit is 100.',
        isLoading: false 
      });
      return;
    }

    mergedFilters.limit = validLimit;

    set({ isLoading: true, error: null });
    try {
      const response = await getAllWorkflows(mergedFilters);

      if ((response.status === 0 || response.status === 200) && response.data) {
        // Extract filters without page and limit for storage
        const { page: _, limit: __, ...filterState } = mergedFilters;
        
        set({
          workflows: response.data.items,
          total: response.data.total,
          page: response.data.page || currentPage,
          limit: response.data.limit || validLimit,
          filters: filterState
        });
      } else {
        set({ error: response.message || 'Error loading workflows' });
      }
    } catch (error) {
      console.error('❌ Store: Error in fetchWorkflows:', error);
      set({ error: 'Error loading workflows' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateWorkflowInStore: (updatedWorkflow: Workflow) => {
    set((state) => ({
      workflows: state.workflows.map((workflow) =>
        workflow.id === updatedWorkflow.id ? updatedWorkflow : workflow
      )
    }));
  }
}));
