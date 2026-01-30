import { create } from 'zustand';
import {
  getAllPlans,
  createPlan,
  updatePlan,
  SubscriptionPlanFilters
} from '@/lib/api/subscription-plans';
import { SubscriptionPlan, CreatePlanRequest, UpdatePlanRequest } from '@/interface/SubscriptionPlan';

interface SubscriptionPlansStore {
  plans: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  filters: Omit<SubscriptionPlanFilters, 'page' | 'limit'>;
  fetchPlans: (filters?: SubscriptionPlanFilters) => Promise<void>;
  createPlan: (planData: CreatePlanRequest) => Promise<boolean>;
  updatePlan: (id: number, planData: UpdatePlanRequest) => Promise<boolean>;
  updatePlanInStore: (updatedPlan: SubscriptionPlan) => void;
  clearError: () => void;
}

export const useSubscriptionPlansStore = create<SubscriptionPlansStore>((set, get) => ({
  plans: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  filters: {},

  fetchPlans: async (filters: SubscriptionPlanFilters = {}) => {
    // Use current state as defaults if params not provided
    const currentPage = filters.page ?? get().page;
    const currentLimit = filters.limit ?? get().limit;
    const currentFilters = get().filters;

    // Merge filters - handle undefined values to explicitly clear filters
    const mergedFilters: SubscriptionPlanFilters = {
      page: currentPage,
      limit: currentLimit,
      ...currentFilters,
      ...filters
    };
    
    // Remove undefined values to clear filters
    if (mergedFilters.isActive === undefined) delete mergedFilters.isActive;

    // Enforce API limit of 100
    const validLimit = Math.min(mergedFilters.limit || 10, 100);
    if ((mergedFilters.limit || 10) > 100) {
      set({ 
        error: 'Limit cannot exceed 100. Maximum limit is 100.',
        isLoading: false 
      });
      return;
    }

    mergedFilters.limit = validLimit;

    set({ isLoading: true, error: null });
    try {
      const response = await getAllPlans(mergedFilters);

      if ((response.status === 0 || response.status === 200) && response.data) {
        // Extract filters without page and limit for storage
        const { page: _, limit: __, ...filterState } = mergedFilters;
        
        set({
          plans: response.data,
          total: response.total,
          page: response.page || currentPage,
          limit: response.limit || validLimit,
          filters: filterState
        });
      } else {
        set({ error: response.message || 'Error loading subscription plans' });
      }
    } catch (error) {
      set({ error: 'Error loading subscription plans' });
    } finally {
      set({ isLoading: false });
    }
  },

  createPlan: async (planData: CreatePlanRequest) => {
    set({ isLoading: true, error: null });

    try {
      const response = await createPlan(planData);

      if (response.status === 200 || response.status === 201) {
        set((state) => ({
          plans: [...state.plans, response.data],
          isLoading: false
        }));
        return true;
      } else {
        set({
          error: response.message,
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to create subscription plan',
        isLoading: false
      });
      return false;
    }
  },

  updatePlan: async (id: number, planData: UpdatePlanRequest) => {
    set({ isLoading: true, error: null });

    try {
      const response = await updatePlan(id, planData);

      if (response.status === 200) {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === id ? response.data : plan
          ),
          isLoading: false
        }));
        return true;
      } else {
        set({
          error: response.message,
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update subscription plan',
        isLoading: false
      });
      return false;
    }
  },

  updatePlanInStore: (updatedPlan: SubscriptionPlan) => {
    set((state) => ({
      plans: state.plans.map((plan) =>
        plan.id === updatedPlan.id ? updatedPlan : plan
      )
    }));
  },

  clearError: () => {
    set({ error: null });
  }
}));
