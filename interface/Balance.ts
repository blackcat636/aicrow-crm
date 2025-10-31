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
  userId: number;
  amount: string;
  currency: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  referenceId?: string;
  transactionType: 'deposit' | 'withdrawal' | 'transfer' | 'administrative';
  createdAt: string;
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
