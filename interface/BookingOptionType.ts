export interface BookingOptionType {
  id: number;
  name: string; // Унікальний ідентифікатор
  displayName: string; // Назва для відображення
  description?: string; // Опис опції
  pricingType: 'fixed_per_day' | 'percentage'; // Тип ціноутворення
  basePrice: number; // Базова ціна (або відсоток)
  isActive: boolean; // Чи активна опція
  isRequired: boolean; // Чи обов'язкова опція
  icon?: string; // Іконка опції
  hasVariants: boolean; // Чи має варіанти
  variants?: BookingOptionVariant[]; // Варіанти (якщо є)
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingOptionVariant {
  id: number;
  optionTypeId: number; // ID типу опції
  name: string; // Унікальний ідентифікатор варіанту
  displayName: string; // Назва для відображення
  description?: string; // Опис варіанту
  price: number; // Ціна варіанту
  value?: string; // Значення варіанту (наприклад, "1000")
  isActive: boolean; // Чи активний варіант
  isDefault: boolean; // Чи є варіант за замовчуванням
  icon?: string; // Іконка варіанту
  sortOrder?: number; // Порядок сортування
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingOption {
  id: number;
  bookingId: number; // ID бронювання
  optionTypeId: number; // ID типу опції
  variantId?: number; // ID варіанту (якщо є)
  price: number; // Розрахована ціна
  value?: string; // Значення (з варіанту або користувацьке)
  description?: string; // Опис
  createdAt?: string;
  updatedAt?: string;
}

// DTOs для створення та оновлення
export interface CreateBookingOptionTypeDto {
  name: string;
  displayName: string;
  description?: string;
  pricingType: 'fixed_per_day' | 'percentage';
  basePrice: number;
  isActive?: boolean;
  isRequired?: boolean;
  icon?: string;
  hasVariants: boolean;
}

export interface UpdateBookingOptionTypeDto {
  displayName?: string;
  description?: string;
  pricingType?: 'fixed_per_day' | 'percentage';
  basePrice?: number;
  isActive?: boolean;
  isRequired?: boolean;
  icon?: string;
  hasVariants?: boolean;
}

export interface CreateBookingOptionVariantDto {
  optionTypeId: number;
  name: string;
  displayName: string;
  description?: string;
  price: number;
  value?: string;
  isActive?: boolean;
  isDefault?: boolean;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateBookingOptionVariantDto {
  displayName?: string;
  description?: string;
  price?: number;
  value?: string;
  isActive?: boolean;
  isDefault?: boolean;
  icon?: string;
  sortOrder?: number;
}
