import { NextRequest, NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/api';

export const runtime = 'edge';

// POST /admin/automations/user-workflows/[workflowId] - Attach workflow to user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params;

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
    const { name, description, isActive, scheduleType } = body;

    if (!name || !description || isActive === undefined || !scheduleType) {
      return NextResponse.json(
        {
          status: 400,
          message:
            'Missing required fields: name, description, isActive, scheduleType'
        },
        { status: 400 }
      );
    }

    // Validate scheduleType
    const validScheduleTypes = ['manual', 'scheduled', 'triggered'];
    if (!validScheduleTypes.includes(scheduleType)) {
      return NextResponse.json(
        {
          status: 400,
          message:
            'Invalid scheduleType. Must be one of: manual, scheduled, triggered'
        },
        { status: 400 }
      );
    }

    // Prepare request data
    const requestData = {
      workflowId: Number(workflowId),
      name,
      description,
      isActive: Boolean(isActive),
      scheduleType
    };

    // Forward request to backend API
    const API_URL = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
    ).replace(/\/+$/, '');

    const response = await fetchWithAuth(
      `${API_URL}/admin/automations/user-workflows/${workflowId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle specific error cases
      if (response.status === 409) {
        return NextResponse.json(
          {
            status: 409,
            message:
              'Workflow already attached to this user. Please choose a different workflow or remove the existing attachment first.'
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          status: response.status,
          message: errorData.message || 'Failed to attach workflow to user'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: 200,
      data: data.data || data,
      message: 'Workflow attached to user successfully'
    });
  } catch (error) {
    console.error('Error attaching workflow to user:', error);

    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// GET /admin/automations/user-workflows/[workflowId] - Get user workflow by workflow ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params;

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
      `${API_URL}/admin/automations/user-workflows/${workflowId}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          status: response.status,
          message: errorData.message || 'Failed to fetch user workflow'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: 200,
      data: data.data || data,
      message: 'User workflow retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user workflow:', error);

    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
