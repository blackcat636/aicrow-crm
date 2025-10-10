export interface Specification {
  id: number;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  vehicleCount: number;
}

export interface CreateSpecificationDto {
  name: string;
  type: string;
}

export interface UpdateSpecificationDto {
  id: number;
  name: string;
  type: string;
}
