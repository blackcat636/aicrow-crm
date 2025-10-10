import { create } from 'zustand';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/lib/api/categories';
import { Category } from '@/interface/Category';

interface CategoriesStore {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  fetchCategories: (page?: number, limit?: number) => Promise<void>;
  addCategory: (categoryData: any) => Promise<void>;
  updateCategoryInStore: (updatedCategory: Category) => void;
  updateCategory: (id: number, categoryData: any) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,

  fetchCategories: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllCategories(page, limit);

      if ((response.status === 0 || response.status === 200) && response.data) {
        set({
          categories: response.data,
          total: response.total,
          page: response.page,
          limit: response.limit
        });
      } else {
        set({ error: 'Error loading categories' });
      }
    } catch (error) {
      console.error('❌ Store: Error in fetchCategories:', error);
      set({ error: 'Error loading categories' });
    } finally {
      set({ isLoading: false });
    }
  },

  addCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createCategory(categoryData);

      if ((response.status === 0 || response.status === 200) && response.data) {
        set((state) => ({
          categories: [response.data, ...state.categories]
        }));
      } else {
        set({ error: 'Error creating category' });
      }
    } catch (error) {
      console.error('❌ Store: Error in addCategory:', error);
      set({ error: 'Error creating category' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateCategoryInStore: (updatedCategory: Category) => {
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category
      )
    }));
  },

  updateCategory: async (id, categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateCategory(id, categoryData);

      if ((response.status === 0 || response.status === 200) && response.data) {
        get().updateCategoryInStore(response.data);
      } else {
        set({ error: 'Error updating category' });
      }
    } catch (error) {
      console.error('❌ Store: Error in updateCategory:', error);
      set({ error: 'Error updating category' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deleteCategory(id);

      if ((response.status === 0 || response.status === 200) && response.data) {
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id)
        }));
      } else {
        set({ error: 'Error deleting category' });
      }
    } catch (error) {
      console.error('❌ Store: Error in deleteCategory:', error);
      set({ error: 'Error deleting category' });
    } finally {
      set({ isLoading: false });
    }
  }
}));
