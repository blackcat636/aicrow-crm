import { create } from 'zustand';
import { getAllWorkflows } from '@/lib/api/workflows';
import { Workflow } from '@/interface/Workflow';

interface WorkflowsStore {
  workflows: Workflow[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  instanceId: number | undefined;
  active: boolean | undefined;
  fetchWorkflows: (
    page?: number, 
    limit?: number, 
    instanceId?: number | null, 
    active?: boolean | null
  ) => Promise<void>;
  updateWorkflowInStore: (updatedWorkflow: Workflow) => void;
}

export const useWorkflowsStore = create<WorkflowsStore>((set, get) => ({
  workflows: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 20,
  instanceId: undefined,
  active: undefined,

  fetchWorkflows: async (
    page?: number, 
    limit?: number, 
    instanceId?: number | null, 
    active?: boolean | null
  ) => {
    // Use current state as defaults if params not provided
    const currentPage = page ?? get().page;
    const currentLimit = limit ?? get().limit;
    // For instanceId and active, null means "clear filter" (use undefined for API)
    // undefined means "use current state"
    const currentInstanceId = instanceId === null ? undefined : (instanceId !== undefined ? instanceId : get().instanceId);
    const currentActive = active === null ? undefined : (active !== undefined ? active : get().active);
    
    // Enforce API limit of 100
    const validLimit = Math.min(currentLimit, 100);
    if (currentLimit > 100) {
      set({ 
        error: 'Limit cannot exceed 100. Maximum limit is 100.',
        isLoading: false 
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await getAllWorkflows(currentPage, validLimit, currentInstanceId, currentActive);

      if ((response.status === 0 || response.status === 200) && response.data) {
        set({
          workflows: response.data.items,
          total: response.data.total,
          page: response.data.page || currentPage,
          limit: response.data.limit || validLimit,
          instanceId: currentInstanceId,
          active: currentActive
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
