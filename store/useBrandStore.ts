import { create } from 'zustand';
import { Brand } from '@/interface/Brand';
import { getAllBrands, getBrandById } from '@/lib/api/brands';

interface BrandStore {
  brands: Brand[];
  isLoading: boolean;
  error: string | null;
  fetchBrands: () => Promise<void>;
}

export const useBrandStore = create<BrandStore>((set, get) => ({
  brands: [],
  isLoading: false,
  error: null,

  fetchBrands: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllBrands();

      if (response.status === 'success' && response.data) {
        const brands = Array.isArray(response.data) ? response.data : [];
        set({ brands });
      } else {
        set({ brands: [] });
      }
    } catch (error) {
      console.error('❌ Store: Error loading brands:', error);
      set({ error: 'Error loading brands' });
    } finally {
      set({ isLoading: false });
    }
  }
}));
