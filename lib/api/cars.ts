import { fetchWithAuth } from '../api';
import {
  Car,
  CreateCarDto,
  UpdateCarDto,
  AddSpecificationDto
} from '@/interface/Cars';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

interface ApiResponse<T> {
  status: number | string;
  data?: T;
  message?: string;
  error?: string;
}

export async function getAllCars(): Promise<ApiResponse<Car[]>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/vehicles`);

    if (!response.ok) {
      throw new Error('Failed to fetch cars');
    }

    const responseData = (await response.json()) as
      | Car[]
      | { status: number; data: Car[] };

    // Handle both response formats - direct array or wrapped object
    const cars = Array.isArray(responseData)
      ? responseData
      : responseData.data || [];

    return {
      status: 'success',
      data: Array.isArray(cars) ? cars : [],
      error: undefined,
      message: 'Cars fetched successfully'
    };
  } catch (error) {
    console.error('❌ API: Error loading cars:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function getCarById(id: number): Promise<ApiResponse<Car>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/vehicles/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch car with id ${id}`);
    }

    const responseData = (await response.json()) as
      | Car
      | { status: number; data: Car };

    // Handle both response formats - direct object or wrapped object
    const car =
      responseData && typeof responseData === 'object' && 'id' in responseData
        ? (responseData as Car)
        : (responseData as { data: Car }).data;

    console.log('🚗 API: getCarById response:', {
      responseData,
      car,
      carLocation: car?.location,
      locationId: car?.location?.id
    });

    return {
      status: 'success',
      data: car,
      error: undefined,
      message: 'Car fetched successfully'
    };
  } catch (error) {
    console.error('❌ API: Error loading car:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function createCar(car: CreateCarDto): Promise<ApiResponse<Car>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/vehicles/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(car)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API: Create car error response:', errorData);
      throw new Error(
        `Failed to create car: ${errorData.message || 'Unknown error'}`
      );
    }

    const responseData = (await response.json()) as
      | Car
      | { status: number; data: Car };

    // Handle both response formats - direct object or wrapped object
    const createdCar =
      responseData && typeof responseData === 'object' && 'id' in responseData
        ? (responseData as Car)
        : (responseData as { data: Car }).data;

    return {
      status: 'success',
      data: createdCar,
      error: undefined,
      message: 'Car created successfully'
    };
  } catch (error) {
    console.error('❌ API: Error in createCar:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

export async function updateCar(car: UpdateCarDto): Promise<ApiResponse<Car>> {
  try {
    const { id, ...carData } = car;
    const response = await fetchWithAuth(`${API_URL}/admin/vehicles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(carData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update car with id ${id}`);
    }
    const data = (await response.json()) as Car;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Car updated successfully'
    };
  } catch (error) {
    console.error('Request error:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function deleteCar(id: number): Promise<ApiResponse<Car>> {
  try {
    const response = await fetchWithAuth(`${API_URL}/admin/vehicles/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete car with id ${id}`);
    }
    const data = (await response.json()) as Car;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Car deleted successfully'
    };
  } catch (error) {
    console.error('❌ API: Request error:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function addCarMedia(
  vehicleId: number,
  file: File,
  type: string = 'image'
): Promise<ApiResponse<Car>> {
  try {
    const formData = new FormData();
    formData.append('vehicleId', vehicleId.toString());
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetchWithAuth(
      `${API_URL}/admin/vehicles/add-media`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add media to car');
    }

    const data = (await response.json()) as Car;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Media added successfully'
    };
  } catch (error) {
    console.error('❌ API: Error in addCarMedia:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function addCarSpecification(
  specification: AddSpecificationDto
): Promise<ApiResponse<Car>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/vehicles/add-specification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(specification)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add specification to car');
    }

    const data = (await response.json()) as Car;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Specification added successfully'
    };
  } catch (error) {
    console.error('❌ API: Error in addCarSpecification:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function uploadVehicleImage(
  vehicleId: number,
  file: File
): Promise<ApiResponse<Car>> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetchWithAuth(
      `${API_URL}/admin/vehicles/${vehicleId}/image`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload vehicle image');
    }

    const data = (await response.json()) as Car;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Image uploaded successfully'
    };
  } catch (error) {
    console.error('❌ API: Error in uploadVehicleImage:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function uploadVehicleGallery(
  vehicleId: number,
  files: File[]
): Promise<ApiResponse<Car>> {
  try {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`gallery[${index}]`, file);
    });

    const response = await fetchWithAuth(
      `${API_URL}/admin/vehicles/${vehicleId}/gallery`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload vehicle gallery');
    }

    const data = (await response.json()) as Car;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Gallery uploaded successfully'
    };
  } catch (error) {
    console.error('❌ API: Error in uploadVehicleGallery:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function updateVehicle(
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
): Promise<ApiResponse<Car>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/vehicles/${vehicleId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicleData)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update vehicle');
    }

    const data = (await response.json()) as Car;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Vehicle updated successfully'
    };
  } catch (error) {
    console.error('❌ API: Error in updateVehicle:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function activateVehicle(id: number): Promise<ApiResponse<Car>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/vehicles/${id}/activate`,
      {
        method: 'POST'
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to activate vehicle with id ${id}`);
    }

    const data = (await response.json()) as Car;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Vehicle activated successfully'
    };
  } catch (error) {
    console.error('❌ API: Error in activateVehicle:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

export async function deactivateVehicle(id: number): Promise<ApiResponse<Car>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/vehicles/${id}/deactivate`,
      {
        method: 'POST'
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to deactivate vehicle with id ${id}`);
    }

    const data = (await response.json()) as Car;

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Vehicle deactivated successfully'
    };
  } catch (error) {
    console.error('❌ API: Error in deactivateVehicle:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}

// Add specification to vehicle
export async function addVehicleSpecification(
  vehicleId: number,
  specificationId: number,
  value: string
): Promise<ApiResponse<unknown>> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/admin/vehicles/add-specification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vehicleId,
          specificationId,
          value
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add specification to vehicle ${vehicleId}`);
    }

    const data = await response.json();

    return {
      status: 'success',
      data: data,
      error: undefined,
      message: 'Specification added successfully'
    };
  } catch (error) {
    console.error('❌ API: Error in addVehicleSpecification:', error);
    return {
      status: 'error',
      error: 'Network error'
    };
  }
}
