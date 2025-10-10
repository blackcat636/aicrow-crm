import { create } from 'zustand';
import { Color } from '@/interface/Color';
import { getAllColors } from '../lib/api/colors';

interface ColorsStore {
  colors: Color[];
  isLoading: boolean;
  error: string | null;
  fetchColors: () => Promise<void>;
}

export const useColorsStore = create<ColorsStore>((set) => ({
  colors: [],
  isLoading: false,
  error: null,

  fetchColors: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllColors();

      if (response.status === 'success' && response.data) {
        const colors = Array.isArray(response.data) ? response.data : [];
        set({ colors, isLoading: false });
      } else {
        set({
          error: response.error || 'Error loading colors',
          isLoading: false
        });
      }
    } catch (error) {
      console.error('❌ Store: Error loading colors:', error);
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      });
    }
  }
}));
