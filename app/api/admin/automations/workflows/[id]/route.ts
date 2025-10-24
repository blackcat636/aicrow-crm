import { NextRequest, NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/api';

export const runtime = 'edge';

// PUT /admin/automations/workflows/[id] - Update workflow
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;

    if (!workflowId || isNaN(Number(workflowId))) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid workflow ID'
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const { displayName, displayDescription, availableToUsers, priceUsd } =
      body;

    if (
      !displayName &&
      !displayDescription &&
      availableToUsers === undefined &&
      priceUsd === undefined
    ) {
      return NextResponse.json(
        {
          status: 400,
          message: 'At least one field must be provided for update'
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (displayDescription !== undefined)
      updateData.displayDescription = displayDescription;
    if (availableToUsers !== undefined)
      updateData.availableToUsers = availableToUsers;

    // Handle priceUsd if provided
    if (priceUsd !== undefined) {
      console.log(
        '🔍 Price handling - Input:',
        priceUsd,
        'Type:',
        typeof priceUsd
      );

      // Simple validation - just check if it's a positive number
      if (typeof priceUsd === 'number' && priceUsd >= 0) {
        updateData.priceUsd = priceUsd;
        console.log('✅ Price added to updateData:', updateData.priceUsd);
      } else {
        console.log('❌ Invalid price value:', priceUsd);
        return NextResponse.json(
          {
            status: 400,
            message: 'Price must be a positive number'
          },
          { status: 400 }
        );
      }
    }

    // Validate availableToUsers if provided
    if (
      availableToUsers !== undefined &&
      typeof availableToUsers !== 'boolean'
    ) {
      return NextResponse.json(
        {
          status: 400,
          message: 'availableToUsers must be a boolean value'
        },
        { status: 400 }
      );
    }

    // Forward request to backend API
    const API_URL = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
    ).replace(/\/+$/, '');

    console.log('📤 Sending to backend:', {
      url: `${API_URL}/admin/automations/workflows/${workflowId}`,
      method: 'PUT',
      body: updateData
    });

    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/workflows/${workflowId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ Backend error response:', {
        status: response.status,
        errorData
      });
      return NextResponse.json(
        {
          status: response.status,
          message: errorData.message || 'Failed to update workflow'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: 200,
      data: data.data || data,
      message: 'Workflow updated successfully'
    });
  } catch (error) {
    console.error('Error updating workflow:', error);

    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// GET /admin/automations/workflows/[id] - Get workflow by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;

    if (!workflowId || isNaN(Number(workflowId))) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid workflow ID'
        },
        { status: 400 }
      );
    }

    // Forward request to backend API
    const API_URL = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
    ).replace(/\/+$/, '');

    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/workflows/${workflowId}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          status: response.status,
          message: errorData.message || 'Failed to fetch workflow'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: 200,
      data: data.data || data,
      message: 'Workflow retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);

    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
