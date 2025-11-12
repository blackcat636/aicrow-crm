export interface User {
  id: number;
  uuid: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: 'user' | 'admin';
  balance: string;
  frozenBalance: string;
  isEmailVerified: boolean;
  isActive?: boolean;
  referralCode: string | null;
  referredByCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail extends User {
  photo: string | null;
  dateOfBirth: string | null;
  timezone: string | null;
  status?: string;
  childrenCount?: number;
  totalChildrenCount?: number;
}

export interface UserProfile {
  uuid: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  photo: string;
  role: string;
  balance: number;
  frozenBalance: number;
}

export interface UsersApiResponse {
  status: number;
  message: string;
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserApiResponse {
  status: number;
  message: string;
  data: UserDetail;
}
