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
  metadata?: Record<string, any>;
  createdAt: string;
}
