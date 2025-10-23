import { NextRequest, NextResponse } from 'next/server';
import { AdminDepositRequest, AdminDepositResponse } from '@/interface/Balance';

export const runtime = 'edge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

export async function POST(request: NextRequest) {
  try {
    const body: AdminDepositRequest = await request.json();

    // Validate required fields
    if (!body.userId || !body.amount) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Missing required fields: userId, amount'
        },
        { status: 400 }
      );
    }

    // Validate userId
    if (typeof body.userId !== 'number' || body.userId <= 0) {
      return NextResponse.json(
        { status: 400, message: 'Invalid userId: must be a positive number' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof body.amount !== 'number' || body.amount <= 0) {
      return NextResponse.json(
        { status: 400, message: 'Invalid amount: must be a positive number' },
        { status: 400 }
      );
    }

    // Validate amount precision (max 8 decimal places)
    const amountStr = body.amount.toString();
    const decimalPart = amountStr.split('.')[1];
    if (decimalPart && decimalPart.length > 8) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid amount: maximum 8 decimal places allowed'
        },
        { status: 400 }
      );
    }

    // Validate maximum amount
    if (body.amount > 1000000) {
      return NextResponse.json(
        { status: 400, message: 'Invalid amount: maximum 1,000,000 allowed' },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (body.comment && body.comment.length > 500) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid comment: maximum 500 characters allowed'
        },
        { status: 400 }
      );
    }

    if (body.referenceId && body.referenceId.length > 100) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid referenceId: maximum 100 characters allowed'
        },
        { status: 400 }
      );
    }

    // Add currencyCode for single currency system (balance index 0)
    const requestBody = {
      ...body,
      currencyCode: 'USD' // Default currency for single currency system
    };

    const response = await fetch(`${API_URL}admin/balance/admin-deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('authorization') || ''
      },
      body: JSON.stringify(requestBody)
    });

    const data: AdminDepositResponse = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          status: response.status,
          message: data.message || 'Failed to process admin deposit'
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Admin deposit error:', error);
    return NextResponse.json(
      { status: 500, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
