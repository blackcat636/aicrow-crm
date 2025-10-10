export interface Model {
  id: number;
  name: string;
  slug: string;
  description: string;
  brandId: number;
  brandName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  vehicleCount: number;
}

export interface CreateModelDto {
  name: string;
  slug: string;
  description: string;
  brandId: number;
}

export interface UpdateModelDto extends Partial<CreateModelDto> {
  id: number;
}

export interface RestoreModelDto {
  id: number;
}
