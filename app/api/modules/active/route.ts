import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Mock data for active modules - in real implementation this would come from your NestJS backend
const ACTIVE_MODULES = [
  {
    key: 'users',
    name: 'Users',
    routes: ['/users'],
    icon: 'IconUsers',
    menu: true,
    order: 1,
    permissions: {
      can_view: true,
      can_edit: true,
      can_delete: false
    },
    subItems: [
      {
        title: 'Users',
        url: '/users',
        icon: 'IconUsers'
      },
      {
        title: 'All Logs',
        url: '/audit-logs',
        icon: 'IconHistory'
      }
    ]
  },
  {
    key: 'automations',
    name: 'Automations',
    routes: ['/workflows'],
    icon: 'IconSettings',
    menu: true,
    order: 2,
    permissions: {
      can_view: true,
      can_edit: true,
      can_delete: false
    },
    subItems: [
      {
        title: 'Workflows',
        url: '/workflows',
        icon: 'IconSettings'
      },
      {
        title: 'User Workflows',
        url: '/user-workflows',
        icon: 'IconUsers'
      },
      {
        title: 'Executions',
        url: '/executions',
        icon: 'IconListDetails'
      },
      {
        title: 'Instances',
        url: '/instances',
        icon: 'IconListDetails'
      }
    ]
  },
  {
    key: 'balance',
    name: 'Balance Management',
    routes: ['/balance'],
    icon: 'IconCoins',
    menu: true,
    order: 3,
    permissions: {
      can_view: true,
      can_edit: true,
      can_delete: false
    },
    subItems: [
      {
        title: 'Admin Deposit',
        url: '/balance/admin-deposit',
        icon: 'IconCoins'
      },
      {
        title: 'Users with Balances',
        url: '/balance/users',
        icon: 'IconUsers'
      }
    ]
  },
  {
    key: 'permissions',
    name: 'Roles & Permissions',
    routes: ['/permissions'],
    icon: 'IconShield',
    menu: true,
    order: 4,
    permissions: {
      can_view: true,
      can_edit: true,
      can_delete: true
    }
  },
  {
    key: 'documentation',
    name: 'Documentation',
    routes: ['/documentation'],
    icon: 'IconFileDescription',
    menu: true,
    order: 5,
    permissions: {
      can_view: true,
      can_edit: false,
      can_delete: false
    }
  }
];

export async function GET() {
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
