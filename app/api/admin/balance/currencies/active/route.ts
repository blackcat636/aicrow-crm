import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

export async function GET(request: NextRequest) {
  try {
    // Make request to backend API for active currencies
    const response = await fetch(`${API_URL}/admin/balance/currencies/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('authorization') || ''
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          status: response.status,
          message: data.message || 'Failed to fetch active currencies',
          data: []
        },
        { status: response.status }
      );
    }

    // Return data in consistent format
    // Backend might return array directly or wrapped in data property
    const currencies = Array.isArray(data) ? data : (data.data || data.items || []);
    
    return NextResponse.json({
      status: 200,
      data: currencies,
      message: 'Active currencies fetched successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Fetch active currencies error:', error);
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
