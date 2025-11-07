import { create } from 'zustand';
import {
  getUserWorkflows,
  createUserWorkflow,
  updateUserWorkflow,
  deleteUserWorkflow,
  toggleUserWorkflow
} from '@/lib/api/user-workflows';
import {
  UserWorkflow,
  CreateUserWorkflowDto,
  UpdateUserWorkflowDto
} from '@/interface/UserWorkflow';

interface UserWorkflowsStore {
  userWorkflows: UserWorkflow[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  currentUserId: number | null;

  // Actions
  fetchUserWorkflows: (
    userId: number,
    page?: number,
    limit?: number
  ) => Promise<void>;
  createWorkflow: (
    userId: number,
    data: CreateUserWorkflowDto
  ) => Promise<UserWorkflow | null>;
  updateWorkflow: (
    id: number,
    data: UpdateUserWorkflowDto
  ) => Promise<UserWorkflow | null>;
  deleteWorkflow: (id: number) => Promise<boolean>;
  toggleWorkflow: (id: number) => Promise<boolean>;
  updateWorkflowInStore: (updatedWorkflow: UserWorkflow) => void;
  setCurrentUserId: (userId: number | null) => void;
}

export const useUserWorkflowsStore = create<UserWorkflowsStore>((set, get) => ({
  userWorkflows: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  currentUserId: null,

  setCurrentUserId: (userId: number | null) => {
    set({ currentUserId: userId });
  },

  fetchUserWorkflows: async (userId: number, page = 1, limit = 10) => {
    // Enforce API limit of 100
    const validLimit = Math.min(limit, 100);
    if (limit > 100) {
      set({ 
        error: 'Limit cannot exceed 100. Maximum limit is 100.',
        isLoading: false 
      });
      return;
    }

    set({ isLoading: true, error: null, currentUserId: userId });
    try {
      const response = await getUserWorkflows(userId, page, validLimit);

      if ((response.status === 0 || response.status === 200) && response.data) {
        // Handle different response formats
        const isArrayResponse = Array.isArray(response.data);
        const workflows = isArrayResponse
          ? (response.data as unknown as UserWorkflow[])
          : (response.data as { items: UserWorkflow[] }).items || [];
        const total = isArrayResponse
          ? (response.data as unknown as UserWorkflow[]).length
          : (response.data as { total: number }).total || 0;
        const currentPage = isArrayResponse ? page : response.data.page || page;
        const pageLimit = isArrayResponse
          ? validLimit
          : response.data.limit || validLimit;

        set({
          userWorkflows: workflows,
          total: total,
          page: currentPage,
          limit: pageLimit
        });
      } else {
        set({ error: response.message || 'Error loading user workflows' });
      }
    } catch (error) {
      console.error('Error loading user workflows:', error);
      set({ error: 'Error loading user workflows' });
    } finally {
      set({ isLoading: false });
    }
  },

  createWorkflow: async (userId: number, data: CreateUserWorkflowDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createUserWorkflow(userId, data);

      if (
        (response.status === 0 ||
          response.status === 200 ||
          response.status === 201) &&
        response.data
      ) {
        // Refresh the list
        const { currentUserId, page, limit } = get();
        if (currentUserId) {
          await get().fetchUserWorkflows(currentUserId, page, limit);
        }
        return response.data;
      } else {
        set({ error: response.message || 'Error creating user workflow' });
        return null;
      }
    } catch (error) {
      console.error('Error creating user workflow:', error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateWorkflow: async (id: number, data: UpdateUserWorkflowDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateUserWorkflow(id, data);

      if ((response.status === 0 || response.status === 200) && response.data) {
        // Update the workflow in the store
        set((state) => ({
          userWorkflows: state.userWorkflows.map((workflow) =>
            workflow.id === id ? response.data : workflow
          )
        }));
        return response.data;
      } else {
        set({ error: response.message || 'Error updating user workflow' });
        return null;
      }
    } catch (error) {
      console.error('Error updating user workflow:', error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteWorkflow: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await deleteUserWorkflow(id);

      // Remove the workflow from the store
      set((state) => ({
        userWorkflows: state.userWorkflows.filter(
          (workflow) => workflow.id !== id
        ),
        total: state.total - 1
      }));

      return true;
    } catch (error) {
      console.error('Error deleting user workflow:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWorkflow: async (id: number) => {
    set({ error: null });
    try {
      const response = await toggleUserWorkflow(id);

      if ((response.status === 0 || response.status === 200) && response.data) {
        // Update the workflow's isActive status in the store
        set((state) => ({
          userWorkflows: state.userWorkflows.map((workflow) =>
            workflow.id === id
              ? { ...workflow, isActive: response.data.isActive }
              : workflow
          )
        }));
        return true;
      } else {
        set({ error: response.message || 'Error toggling user workflow' });
        return false;
      }
    } catch (error) {
      console.error('Error toggling user workflow:', error);
      return false;
    }
  },

  updateWorkflowInStore: (updatedWorkflow: UserWorkflow) => {
    set((state) => ({
      userWorkflows: state.userWorkflows.map((workflow) =>
        workflow.id === updatedWorkflow.id ? updatedWorkflow : workflow
      )
    }));
  }
}));
