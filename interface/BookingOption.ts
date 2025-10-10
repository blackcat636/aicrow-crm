export interface BookingOptionType {
  id: number;
  name: string;
  displayName: string;
  description: string;
  pricingType: 'fixed_per_day' | 'fixed_per_booking' | 'percentage';
  basePrice: number;
  isActive: boolean;
  isRequired: boolean;
  icon?: string;
  hasVariants: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface BookingOptionVariant {
  id: number;
  optionTypeId: number;
  name: string;
  displayName: string;
  description?: string;
  price: number;
  value?: string;
  isActive: boolean;
  isDefault: boolean;
  icon?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateBookingOptionTypeDto {
  name: string;
  displayName: string;
  description: string;
  pricingType: 'fixed_per_day' | 'fixed_per_booking' | 'percentage';
  basePrice: number;
  isActive: boolean;
  isRequired: boolean;
  icon?: string;
  hasVariants: boolean;
  sortOrder: number;
}

export interface UpdateBookingOptionTypeDto
  extends Partial<CreateBookingOptionTypeDto> {
  id: number;
}

export interface CreateBookingOptionVariantDto {
  optionTypeId: number;
  name: string;
  displayName: string;
  description?: string;
  price: number;
  value?: string;
  isActive: boolean;
  isDefault: boolean;
  icon?: string;
  sortOrder: number;
}

export interface UpdateBookingOptionVariantDto
  extends Partial<CreateBookingOptionVariantDto> {
  id: number;
}
