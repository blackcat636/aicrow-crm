import { create } from 'zustand';
import {
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  toggleLocationActive
} from '@/lib/api/locations';
import {
  Location,
  CreateLocationDto,
  UpdateLocationDto
} from '@/interface/Location';

interface LocationsStore {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  fetchLocations: (page?: number, limit?: number) => Promise<void>;
  addLocation: (locationData: CreateLocationDto) => Promise<void>;
  updateLocationInStore: (updatedLocation: Location) => void;
  updateLocation: (
    id: number,
    locationData: UpdateLocationDto
  ) => Promise<void>;
  deleteLocation: (id: number) => Promise<void>;
  toggleLocationActive: (id: number) => Promise<void>;
}

export const useLocationsStore = create<LocationsStore>((set, get) => ({
  locations: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,

  fetchLocations: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllLocations();

      if ((response.status === 0 || response.status === 200) && response.data) {
        const locations = Array.isArray(response.data) ? response.data : [];
        set({
          locations,
          total: response.total,
          page: response.page,
          limit: response.limit
        });
      } else {
        set({ error: 'Error loading locations' });
      }
    } catch (error) {
      console.error('❌ Store: Error in fetchLocations:', error);
      set({ error: 'Error loading locations' });
    } finally {
      set({ isLoading: false });
    }
  },

  addLocation: async (locationData: CreateLocationDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createLocation(locationData);

      if ((response.status === 0 || response.status === 200) && response.data) {
        set((state) => ({
          locations: [response.data, ...state.locations]
        }));
      } else {
        set({ error: 'Error creating location' });
      }
    } catch (error) {
      console.error('❌ Store: Error in addLocation:', error);
      set({ error: 'Error creating location' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateLocationInStore: (updatedLocation: Location) => {
    set((state) => ({
      locations: state.locations.map((location) =>
        location.id === updatedLocation.id ? updatedLocation : location
      )
    }));
  },

  updateLocation: async (id: number, locationData: UpdateLocationDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateLocation(id, locationData);

      if ((response.status === 0 || response.status === 200) && response.data) {
        get().updateLocationInStore(response.data);
      } else {
        set({ error: 'Error updating location' });
      }
    } catch (error) {
      console.error('❌ Store: Error in updateLocation:', error);
      set({ error: 'Error updating location' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteLocation: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deleteLocation(id);

      if (response.status === 0 || response.status === 200) {
        set((state) => ({
          locations: state.locations.filter((location) => location.id !== id)
        }));
      } else {
        set({ error: 'Error deleting location' });
      }
    } catch (error) {
      console.error('❌ Store: Error in deleteLocation:', error);
      set({ error: 'Error deleting location' });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleLocationActive: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await toggleLocationActive(id);

      if ((response.status === 0 || response.status === 200) && response.data) {
        get().updateLocationInStore(response.data);
      } else {
        set({ error: 'Error toggling location active status' });
      }
    } catch (error) {
      console.error('❌ Store: Error in toggleLocationActive:', error);
      set({ error: 'Error toggling location active status' });
    } finally {
      set({ isLoading: false });
    }
  }
}));
