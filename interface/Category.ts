export interface Category {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description: string;
  isActive: boolean;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CategoriesApiResponse {
  status: number;
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryApiResponse {
  status: number;
  message?: string;
  data: Category;
}
