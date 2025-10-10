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
  {
    key: 'cars',
    name: 'Cars',
    routes: [
      '/cars',
      '/brands',
      '/models',
      '/colors',
      '/specifications',
      '/categories'
    ],
    icon: 'IconListDetails',
    menu: true,
    order: 2,
    permissions: {
      can_view: true,
      can_edit: true,
      can_delete: true
    },
    subItems: [
      {
        title: 'All Cars',
        url: '/cars',
        icon: 'IconListDetails'
      },
      {
        title: 'Brands',
        url: '/brands',
        icon: 'IconBrandX'
      },
      {
        title: 'Models',
        url: '/models',
        icon: 'IconCar'
      },
      {
        title: 'Colors',
        url: '/colors',
        icon: 'IconPalette'
      },
      {
        title: 'Specifications',
        url: '/specifications',
        icon: 'IconSettings'
      },
      {
        title: 'Categories',
        url: '/categories',
        icon: 'IconCategory'
      }
    ]
  },
  {
    key: 'bookings',
    name: 'Bookings',
    routes: ['/bookings', '/booking-options'],
    icon: 'IconCalendar',
    menu: true,
    order: 3,
    permissions: {
      can_view: true,
      can_edit: true,
      can_delete: false
    },
    subItems: [
      {
        title: 'All Bookings',
        url: '/bookings',
        icon: 'IconCalendar'
      },
      {
        title: 'Booking Options',
        url: '/booking-options',
        icon: 'IconSettings'
      }
    ]
  },
  {
    key: 'locations',
    name: 'Locations',
    routes: ['/locations'],
    icon: 'IconMapPin',
    menu: true,
    order: 4,
    permissions: {
      can_view: true,
      can_edit: true,
      can_delete: true
    }
  },
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
