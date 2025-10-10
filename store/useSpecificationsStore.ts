import { create } from 'zustand';
import { Specification } from '@/interface/Specification';
import { getAllSpecifications } from '@/lib/api/specifications';

interface SpecificationsStore {
  specifications: Specification[];
  isLoading: boolean;
  error: string | null;
  fetchSpecifications: () => Promise<void>;
}

export const useSpecificationsStore = create<SpecificationsStore>((set) => ({
  specifications: [],
  isLoading: false,
  error: null,

  fetchSpecifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllSpecifications();

      if (response.status === 'success' && response.data) {
        const specifications = Array.isArray(response.data)
          ? response.data
          : [];
        set({ specifications, isLoading: false });
      } else {
        set({
          error: response.error || 'Error loading specifications',
          isLoading: false
        });
      }
    } catch (error) {
      console.error('❌ Store: Error loading specifications:', error);
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      });
    }
  }
}));
