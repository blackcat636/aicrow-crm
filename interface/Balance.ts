export interface Balance {
  id: number;
  userId: number;
  currencyCode: string;
  amount: string;
  frozenAmount: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  uuid: string;
  userId?: number;
  amount: string;
  currency: string;
  balanceBefore?: string;
  balance_before?: string;
  balanceAfter?: string;
  balance_after?: string;
  description: string;
  referenceId?: string;
  reference_id?: string;
  transactionType?: 'deposit' | 'withdrawal' | 'transfer' | 'administrative' | 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND' | 'TRANSFER' | 'CONVERSION' | 'FEE' | 'BONUS' | 'ADJUSTMENT';
  type?: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND' | 'TRANSFER' | 'CONVERSION' | 'FEE' | 'BONUS' | 'ADJUSTMENT';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REVERSED';
  createdAt?: string;
  created_at?: string;
  fee_amount?: string | null;
  metadata?: Record<string, any>;
  user?: {
    id: number;
    email: string;
    username: string;
  };
}

// Transaction filters
export interface TransactionFilters {
  currency?: string;
  type?: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND' | 'TRANSFER' | 'CONVERSION' | 'FEE' | 'BONUS' | 'ADJUSTMENT';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REVERSED';
  referenceId?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  page?: number;
  limit?: number;
}

// Transactions response
export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminDepositRequest {
  userId: number;
  amount: number;
  currencyCode?: string;
  comment?: string;
  referenceId?: string;
}

export interface AdminDepositResponse {
  status: number;
  data: {
    transaction: Transaction;
    targetUser: {
      id: number;
      username: string;
      email: string;
    };
    adminUser: {
      id: number;
      username: string;
      email: string;
    };
  };
  message: string;
}

export interface BalanceAuditLog {
  id: number;
  userId: number;
  transactionId: number;
  action: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  adminUserId?: number;
  adminUsername?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
  precision: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCurrencyRequest {
  code: string;
  name: string;
  symbol?: string;
  precision: number;
  is_crypto?: boolean;
  is_virtual?: boolean;
  exchange_rate_to_usd?: number;
  icon_url?: string;
  description?: string;
}

export interface CreateCurrencyResponse {
  status: number;
  data: Currency;
  message: string;
}

export interface ActiveCurrenciesResponse {
  status: number;
  data: Currency[];
  message?: string;
}

// Currency info for balance responses
export interface CurrencyInfo {
  id: number;
  code: string;
  name: string;
  symbol: string;
  precision: number;
  is_crypto: boolean;
  is_virtual: boolean;
  exchange_rate_to_usd: number;
  icon_url?: string;
  description?: string;
}

// Admin balance DTO
export interface AdminBalanceDto {
  currency: CurrencyInfo;
  balance: number;
  frozen_balance: number;
  available_balance: number;
  total_deposited: number;
  total_withdrawn: number;
  created_at: string;
  updated_at: string;
}

// User info DTO
export interface UserInfoDto {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

// User with balances DTO
export interface UserWithBalancesDto {
  user: UserInfoDto;
  balances: AdminBalanceDto[];
  total_balances: number;
}

// Response for getting all users with balances
export interface AdminUsersWithBalancesResponseDto {
  status: number;
  data: UserWithBalancesDto[];
  total_users: number;
  total_balances: number;
  message?: string;
}

// Response for getting user balances
export interface AdminUserBalancesResponseDto {
  status: number;
  user: UserInfoDto | null;
  data: AdminBalanceDto[];
  message?: string;
}