export interface Color {
  id: number;
  name: string;
  hexCode: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  vehicleCount: number;
}

export interface CreateColorDto {
  name: string;
  hexCode: string;
  description?: string;
}

export interface UpdateColorDto extends Partial<CreateColorDto> {
  id: number;
}
