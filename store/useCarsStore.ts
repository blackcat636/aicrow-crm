import { create } from 'zustand';
import {
  getAllCars,
  uploadVehicleImage,
  updateVehicle,
  deleteCar,
  activateVehicle,
  deactivateVehicle
} from '@/lib/api/cars';
import { Car } from '@/interface/Cars';

interface CarsStore {
  cars: Car[];
  isLoading: boolean;
  error: string | null;
  fetchCars: () => Promise<void>;
  updateCarInStore: (updatedCar: Car) => void;
  uploadCarImage: (vehicleId: number, file: File) => Promise<void>;
  updateCar: (
    vehicleId: number,
    vehicleData: {
      name: string;
      brandId: number;
      modelId: number;
      colorId: number;
      year: number;
      rentalPrice: number;
      description: string;
      categoryId: number;
      fuel: string;
      transmission: string;
      seats: number;
      locationId: number;
      available: boolean;
    }
  ) => Promise<void>;
  deleteCar: (vehicleId: number) => Promise<void>;
  activateCar: (vehicleId: number) => Promise<void>;
  deactivateCar: (vehicleId: number) => Promise<void>;
}

export const useCarsStore = create<CarsStore>((set) => ({
  cars: [],
  isLoading: false,
  error: null,

  fetchCars: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllCars();

      if (response.status === 'success' && response.data) {
        const carsData = Array.isArray(response.data) ? response.data : [];
        set({ cars: carsData });
      } else {
        set({ error: response.error || 'Error loading cars' });
      }
    } catch (error) {
      console.error('❌ Store: Error in fetchCars:', error);
      set({ error: 'Error loading cars' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateCarInStore: (updatedCar: Car) => {
    set((state) => ({
      cars: state.cars.map((car) =>
        car.id === updatedCar.id ? updatedCar : car
      )
    }));
  },

  uploadCarImage: async (vehicleId: number, file: File) => {
    set({ isLoading: true, error: null });
    try {
      const response = await uploadVehicleImage(vehicleId, file);

      if (response.status === 'success' && response.data) {
        // Update car in store
        set((state) => ({
          cars: state.cars.map((car) =>
            car.id === vehicleId ? response.data! : car
          )
        }));
      } else {
        set({ error: response.error || 'Error uploading photo' });
      }
    } catch (error) {
      console.error('❌ Store: Error in uploadCarImage:', error);
      set({ error: 'Error uploading photo' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateCar: async (
    vehicleId: number,
    vehicleData: {
      name: string;
      brandId: number;
      modelId: number;
      colorId: number;
      year: number;
      rentalPrice: number;
      description: string;
      categoryId: number;
      fuel: string;
      transmission: string;
      seats: number;
      locationId: number;
      available: boolean;
    }
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await updateVehicle(vehicleId, vehicleData);

      if (response.status === 'success' && response.data) {
        // Update car in store
        set((state) => ({
          cars: state.cars.map((car) =>
            car.id === vehicleId ? response.data! : car
          )
        }));
      } else {
        set({ error: response.error || 'Error updating car' });
      }
    } catch (error) {
      console.error('❌ Store: Error in updateCar:', error);
      set({ error: 'Error updating car' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCar: async (vehicleId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deleteCar(vehicleId);

      if (response.status === 'success' || response.status === 200) {
        // Remove car from store
        set((state) => ({
          cars: state.cars.filter((car) => car.id !== vehicleId)
        }));
        // Clear error on successful deletion
        set({ error: null });
      } else {
        set({ error: response.error || 'Error deleting car' });
        throw new Error(response.error || 'Error deleting car');
      }
    } catch (error) {
      console.error('❌ Store: Error in deleteCar:', error);
      set({ error: 'Error deleting car' });
      throw error; // Pass error to component for handling
    } finally {
      set({ isLoading: false });
    }
  },

  activateCar: async (vehicleId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await activateVehicle(vehicleId);

      if (response.status === 'success' && response.data) {
        // Update car in store
        set((state) => ({
          cars: state.cars.map((car) =>
            car.id === vehicleId ? response.data! : car
          )
        }));
        set({ error: null });
      } else {
        set({ error: response.error || 'Error activating car' });
        throw new Error(response.error || 'Error activating car');
      }
    } catch (error) {
      console.error('❌ Store: Error in activateCar:', error);
      set({ error: 'Error activating car' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deactivateCar: async (vehicleId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await deactivateVehicle(vehicleId);

      if (response.status === 'success' && response.data) {
        // Update car in store
        set((state) => ({
          cars: state.cars.map((car) =>
            car.id === vehicleId ? response.data! : car
          )
        }));
        set({ error: null });
      } else {
        set({ error: response.error || 'Error deactivating car' });
        throw new Error(response.error || 'Error deactivating car');
      }
    } catch (error) {
      console.error('❌ Store: Error in deactivateCar:', error);
      set({ error: 'Error deactivating car' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));
