import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/api';

export const runtime = 'edge';

// GET /admin/automations/social-networks - Get list of available social networks
export async function GET() {
  try {
    // Forward request to backend API
    const API_URL = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
    ).replace(/\/+$/, '');

    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/social-networks`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          status: response.status,
          message: errorData.message || 'Failed to fetch social networks'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Handle different response formats
    // Backend may return: { status: 200, data: [...] } or just [...]
    const networksData = Array.isArray(data)
      ? data
      : data.data || (data.status === 200 ? data.data : data);

    return NextResponse.json({
      status: 200,
      data: Array.isArray(networksData) ? networksData : [],
      message: 'Social networks retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching social networks:', error);

    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
