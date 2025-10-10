import { NextRequest, NextResponse } from 'next/server';

// Mock data for active modules - in real implementation this would come from your NestJS backend
const ACTIVE_MODULES = [
  {
    key: 'dashboard',
    name: 'Dashboard',
    routes: ['/'],
    icon: 'IconDashboard',
    menu: true,
    order: 1,
    permissions: {
      can_view: true,
      can_edit: false,
      can_delete: false
    }
  },
  // Only keep Users and Documentation modules active
  {
    key: 'users',
    name: 'Users',
    routes: ['/users'],
    icon: 'IconUsers',
    menu: true,
    order: 5,
    permissions: {
      can_view: true,
      can_edit: true,
      can_delete: false
    }
  },
  {
    key: 'documentation',
    name: 'Documentation',
    routes: ['/documentation'],
    icon: 'IconFileDescription',
    menu: true,
    order: 6,
    permissions: {
      can_view: true,
      can_edit: false,
      can_delete: false
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Get user permissions from JWT token
    // 2. Query your NestJS backend for active modules
    // 3. Filter modules based on user permissions
    // 4. Return only modules the user has access to

    // For now, return all modules
    const response = {
      status: 200,
      data: ACTIVE_MODULES,
      message: 'Active modules retrieved successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching active modules:', error);

    return NextResponse.json(
      {
        status: 500,
        error: 'Failed to fetch active modules',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
