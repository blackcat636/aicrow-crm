import { fetchWithAuth } from '@/lib/api';
import {
  AdminDepositRequest,
  AdminDepositResponse,
  AdminUsersWithBalancesResponseDto,
  AdminUserBalancesResponseDto,
  TransactionFilters,
  TransactionsResponse
} from '@/interface/Balance';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

export const adminDeposit = async (
  data: AdminDepositRequest
): Promise<AdminDepositResponse> => {
  const response = await fetchWithAuth(
    `${API_URL}/admin/balance/admin-deposit`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  const result: AdminDepositResponse = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to process admin deposit');
  }

  return result;
};

// Get all users with their balances
export const getAllUsersWithBalances =
  async (): Promise<AdminUsersWithBalancesResponseDto> => {
    const response = await fetchWithAuth(`${API_URL}/admin/balance/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result: AdminUsersWithBalancesResponseDto = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to get users with balances');
    }

    return result;
  };

// Get user balances by userId
export const getUserBalances = async (
  userId: number
): Promise<AdminUserBalancesResponseDto> => {
  const response = await fetchWithAuth(
    `${API_URL}/admin/balance/users/${userId}/balances`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  const result: AdminUserBalancesResponseDto = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to get user balances');
  }

  return result;
};

// Get user transactions with filters
export const getUserTransactions = async (
  userId: number,
  filters?: TransactionFilters
): Promise<TransactionsResponse> => {
  const params = new URLSearchParams();

  if (filters?.type) params.append('type', filters.type);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.referenceId) params.append('referenceId', filters.referenceId);
  if (filters?.minAmount !== undefined)
    params.append('minAmount', filters.minAmount.toString());
  if (filters?.maxAmount !== undefined)
    params.append('maxAmount', filters.maxAmount.toString());
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  // Use /transactions endpoint for transactions
  const url = `${API_URL}/admin/balance/users/${userId}/transactions${
    params.toString() ? `?${params.toString()}` : ''
  }`;

  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get user transactions');
  }

  // Map API response to our interface
  // API returns: { status: 200, data: { transactions: [], pagination: {} } }
  const result: TransactionsResponse = {
    transactions: data.data?.transactions || data.transactions || [],
    pagination: data.data?.pagination ||
      data.pagination || {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
      }
  };

  return result;
};
