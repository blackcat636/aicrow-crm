export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  description: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationDto {
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  description: string;
  timezone: string;
  isActive: boolean;
}

export interface UpdateLocationDto extends Partial<CreateLocationDto> {}

export interface LocationsApiResponse {
  status: number;
  data: Location[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LocationApiResponse {
  status: number;
  message: string;
  data: Location;
}
