import { Brand } from './Brand';
import { Model } from './Model';
import { Color } from './Color';

export interface Category {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  name: string;
  city: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Media {
  url: string;
  type: string;
}

export interface Specification {
  name: string;
  value: string;
  type: string;
}

export interface Car {
  id: number;
  name: string;
  description: string;
  year: number;
  category: Category;
  price: number;
  rentalPrice: number;
  rentalMinPeriod: number;
  rentalMaxPeriod: number;
  rating: number;
  transmission: 'Manual' | 'Automatic' | 'CVT' | 'Semi-Automatic';
  fuel: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'LPG' | 'CNG';
  seats: number;
  available: boolean;
  status: 'available' | 'unavailable' | 'maintenance' | 'rented';
  brand: Brand;
  model: Model;
  color: Color;
  location: Location;
  media: Media[];
  specifications: Specification[];
  country: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  bookingCount: number;
  favoriteCount: number;
}

export interface CreateCarDto {
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

export interface UpdateCarDto extends Partial<CreateCarDto> {
  id: number;
}

export interface AddMediaDto {
  vehicleId: number;
  url: string;
  type: 'image' | 'video';
}

export interface AddSpecificationDto {
  vehicleId: number;
  specificationId: number;
  value: string;
}
