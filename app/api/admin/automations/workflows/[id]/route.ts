import { NextRequest, NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/api';

export const runtime = 'edge';

// PUT /admin/automations/workflows/[id] - Update workflow
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params;

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
    const {
      displayName,
      displayDescription,
      availableToUsers,
      priceUsd,
      show,
      chainableWorkflows,
      allowedSocialNetworks,
      requiredSocialNetworks
    } = body;

    if (
      !displayName &&
      !displayDescription &&
      availableToUsers === undefined &&
      priceUsd === undefined &&
      show === undefined &&
      chainableWorkflows === undefined &&
      allowedSocialNetworks === undefined &&
      requiredSocialNetworks === undefined
    ) {
      return NextResponse.json(
        {
          status: 400,
          message: 'At least one field must be provided for update'
        },
        { status: 400 }
      );
    }

    // Validate chainableWorkflows if provided
    if (chainableWorkflows !== undefined) {
      if (chainableWorkflows !== null) {
        // If not null, must be an object
        if (
          typeof chainableWorkflows !== 'object' ||
          Array.isArray(chainableWorkflows)
        ) {
          return NextResponse.json(
            {
              status: 400,
              message: 'chainableWorkflows must be an object or null'
            },
            { status: 400 }
          );
        }

        // Validate allowedTargets if present
        if (chainableWorkflows.allowedTargets !== undefined) {
          if (!Array.isArray(chainableWorkflows.allowedTargets)) {
            return NextResponse.json(
              {
                status: 400,
                message: 'chainableWorkflows.allowedTargets must be an array'
              },
              { status: 400 }
            );
          }
          // Validate all items are numbers
          if (
            !chainableWorkflows.allowedTargets.every(
              (id: number) => typeof id === 'number' && !isNaN(id)
            )
          ) {
            return NextResponse.json(
              {
                status: 400,
                message:
                  'chainableWorkflows.allowedTargets must contain only numbers'
              },
              { status: 400 }
            );
          }
        }

        // Validate defaultDataMapping if present
        if (chainableWorkflows.defaultDataMapping !== undefined) {
          if (
            typeof chainableWorkflows.defaultDataMapping !== 'object' ||
            chainableWorkflows.defaultDataMapping === null ||
            Array.isArray(chainableWorkflows.defaultDataMapping)
          ) {
            return NextResponse.json(
              {
                status: 400,
                message:
                  'chainableWorkflows.defaultDataMapping must be an object'
              },
              { status: 400 }
            );
          }
          // Validate all values are strings
          const mapping = chainableWorkflows.defaultDataMapping;
          if (!Object.values(mapping).every((val) => typeof val === 'string')) {
            return NextResponse.json(
              {
                status: 400,
                message:
                  'chainableWorkflows.defaultDataMapping values must be strings'
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // Validate allowedSocialNetworks if provided
    if (allowedSocialNetworks !== undefined) {
      if (!Array.isArray(allowedSocialNetworks)) {
        return NextResponse.json(
          {
            status: 400,
            message: 'allowedSocialNetworks must be an array'
          },
          { status: 400 }
        );
      }
      // Validate all items are strings
      if (
        !allowedSocialNetworks.every(
          (network: string) => typeof network === 'string'
        )
      ) {
        return NextResponse.json(
          {
            status: 400,
            message: 'allowedSocialNetworks must contain only strings'
          },
          { status: 400 }
        );
      }
    }

    // Validate requiredSocialNetworks if provided
    if (requiredSocialNetworks !== undefined) {
      if (!Array.isArray(requiredSocialNetworks)) {
        return NextResponse.json(
          {
            status: 400,
            message: 'requiredSocialNetworks must be an array'
          },
          { status: 400 }
        );
      }
      // Validate all items are strings
      if (
        !requiredSocialNetworks.every(
          (network: string) => typeof network === 'string'
        )
      ) {
        return NextResponse.json(
          {
            status: 400,
            message: 'requiredSocialNetworks must contain only strings'
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      displayName?: string;
      displayDescription?: string;
      availableToUsers?: boolean;
      priceUsd?: number;
      show?: number;
      chainableWorkflows?: {
        allowedTargets?: number[];
        defaultDataMapping?: Record<string, string>;
      } | null;
      allowedSocialNetworks?: string[];
      requiredSocialNetworks?: string[];
    } = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (displayDescription !== undefined)
      updateData.displayDescription = displayDescription;
    if (availableToUsers !== undefined)
      updateData.availableToUsers = availableToUsers;
    if (chainableWorkflows !== undefined)
      updateData.chainableWorkflows = chainableWorkflows;
    if (allowedSocialNetworks !== undefined)
      updateData.allowedSocialNetworks = allowedSocialNetworks;
    if (requiredSocialNetworks !== undefined)
      updateData.requiredSocialNetworks = requiredSocialNetworks;

    // Handle priceUsd if provided
    if (priceUsd !== undefined) {
      // Simple validation - just check if it's a positive number
      if (typeof priceUsd === 'number' && priceUsd >= 0) {
        updateData.priceUsd = priceUsd;
      } else {
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

    // Handle show if provided
    if (show !== undefined) {
      // Convert boolean to number (true -> 1, false -> 0)
      // Also handle if it's already a number
      if (typeof show === 'boolean') {
        updateData.show = show ? 1 : 0;
      } else if (typeof show === 'number' && (show === 0 || show === 1)) {
        updateData.show = show;
      } else {
        return NextResponse.json(
          {
            status: 400,
            message: 'show must be a boolean or number (0 or 1)'
          },
          { status: 400 }
        );
      }
    }

    // Forward request to backend API
    const API_URL = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
    ).replace(/\/+$/, '');

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params;

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
