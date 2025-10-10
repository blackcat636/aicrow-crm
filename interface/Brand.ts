export interface Brand {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  logo: string | null;
  imageUrl?: string;
  logoUrl?: string;
  isPremium: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  slug: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  modelCount: number;
  vehicleCount: number;
}

export interface CreateBrandDto {
  name: string;
  description: string;
  isPremium: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  slug: string;
  sortOrder: number;
}

export interface UpdateBrandDto extends Partial<CreateBrandDto> {
  id: number;
}

export interface RestoreBrandDto {
  id: number;
}

export interface UpdateSortOrderDto {
  id: number;
  sortOrder: number;
}
