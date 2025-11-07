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
  fetchWorkflows: (page?: number, limit?: number) => Promise<void>;
  updateWorkflowInStore: (updatedWorkflow: Workflow) => void;
}

export const useWorkflowsStore = create<WorkflowsStore>((set) => ({
  workflows: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,

  fetchWorkflows: async (page = 1, limit = 10) => {
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
      const response = await getAllWorkflows(page, validLimit);

      if ((response.status === 0 || response.status === 200) && response.data) {
        set({
          workflows: response.data.items,
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit
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
