import { fetchWithAuth } from '@/lib/api';
import { AdminDepositRequest, AdminDepositResponse } from '@/interface/Balance';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

export const adminDeposit = async (
  data: AdminDepositRequest
): Promise<AdminDepositResponse> => {
  const response = await fetchWithAuth(
    `${API_URL}admin/balance/admin-deposit`,
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
