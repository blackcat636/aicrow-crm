import { create } from 'zustand';
import { getAllModels } from '@/lib/api/models';
import { Model } from '@/interface/Model';

interface ModelState {
  models: Model[];
  isLoading: boolean;
  error: string | null;
  fetchModels: () => Promise<void>;
}

export const useModelStore = create<ModelState>((set) => ({
  models: [],
  isLoading: false,
  error: null,
  fetchModels: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllModels();

      if (response.status === 'success' && response.data) {
        const models = Array.isArray(response.data) ? response.data : [];
        set({ models, isLoading: false });
      } else {
        set({
          error: response.error || 'Error loading models',
          isLoading: false
        });
      }
    } catch (error) {
      console.error('❌ Store: Error loading models:', error);
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      });
    }
  }
}));
