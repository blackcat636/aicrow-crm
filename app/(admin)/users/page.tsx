"use client"
export const runtime = 'edge';
import { useEffect, useState, useCallback } from 'react';
import { DataTable } from "@/components/users/data-table"
import { useUsersStore } from "@/store/useUsersStore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { UserFilters } from '@/lib/api/users'

const sanitizeNumericId = (value?: string) => {
  if (!value) {
    return '';
  }

  return value.replace(/\D/g, '');
};

const updateUrlWithFilters = (filters: UserFilters) => {
  if (typeof window === 'undefined') {
    return;
  }

  const params = new URLSearchParams();

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;

  params.set('page', page.toString());
  params.set('limit', limit.toString());

  if (filters.id !== undefined) {
    params.set('id', filters.id.toString());
  }
  if (filters.email) {
    params.set('email', filters.email);
  }
  if (filters.username) {
    params.set('username', filters.username);
  }
  if (filters.firstName) {
    params.set('firstName', filters.firstName);
  }
  if (filters.lastName) {
    params.set('lastName', filters.lastName);
  }
  if (filters.phone) {
    params.set('phone', filters.phone);
  }
  if (filters.role) {
    params.set('role', filters.role);
  }
  if (filters.isActive !== undefined) {
    params.set('isActive', filters.isActive ? 'true' : 'false');
  }

  const queryString = params.toString();
  const newUrl = queryString ? `/users?${queryString}` : '/users';

  window.history.replaceState(null, '', newUrl);
};

type FilterOverrides = Partial<{
  idInput: string;
  emailInput: string;
  usernameInput: string;
  firstNameInput: string;
  lastNameInput: string;
  phoneInput: string;
  roleFilter: string;
  isActiveFilter: string;
  page: number;
  limit: number;
}>;

export default function Page() { 
  const { users, isLoading, error, total, page, limit, fetchUsers } = useUsersStore()
  
  // Local state for filter inputs
  const [idInput, setIdInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [firstNameInput, setFirstNameInput] = useState<string>('');
  const [lastNameInput, setLastNameInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all');

  const buildFilters = useCallback(
    (overrides?: FilterOverrides): UserFilters => {
      const effectivePage = overrides?.page ?? 1;
      const effectiveLimit = overrides?.limit ?? limit;

      const filters: UserFilters = {
        page: effectivePage,
        limit: effectiveLimit,
        id: undefined,
        email: undefined,
        username: undefined,
        firstName: undefined,
        lastName: undefined,
        phone: undefined,
        role: undefined,
        isActive: undefined,
      };

      const idValue = (overrides?.idInput ?? idInput).trim();
      const sanitizedId = sanitizeNumericId(idValue);
      if (sanitizedId) {
        filters.id = parseInt(sanitizedId, 10);
      }

      const trimmedEmail = (overrides?.emailInput ?? emailInput).trim();
      if (trimmedEmail) {
        filters.email = trimmedEmail;
      }

      const trimmedUsername = (overrides?.usernameInput ?? usernameInput).trim();
      if (trimmedUsername) {
        filters.username = trimmedUsername;
      }

      const trimmedFirstName = (overrides?.firstNameInput ?? firstNameInput).trim();
      if (trimmedFirstName) {
        filters.firstName = trimmedFirstName;
      }

      const trimmedLastName = (overrides?.lastNameInput ?? lastNameInput).trim();
      if (trimmedLastName) {
        filters.lastName = trimmedLastName;
      }

      const trimmedPhone = (overrides?.phoneInput ?? phoneInput).trim();
      if (trimmedPhone) {
        filters.phone = trimmedPhone;
      }

      const roleValue = overrides?.roleFilter ?? roleFilter;
      if (roleValue !== 'all') {
        filters.role = roleValue as 'user' | 'admin';
      }

      const statusValue = overrides?.isActiveFilter ?? isActiveFilter;
      if (statusValue !== 'all') {
        filters.isActive = statusValue === 'true';
      }

      return filters;
    },
    [
      idInput,
      emailInput,
      usernameInput,
      firstNameInput,
      lastNameInput,
      phoneInput,
      roleFilter,
      isActiveFilter,
      limit,
    ]
  );

  const applyFilters = useCallback(
    (overrides?: FilterOverrides) => {
      const filters = buildFilters(overrides);
      fetchUsers(filters);
      updateUrlWithFilters(filters);
    },
    [buildFilters, fetchUsers]
  );

  // Initial load
  useEffect(() => {
    const initialFilters = buildFilters({ page, limit });
    fetchUsers(initialFilters);
    updateUrlWithFilters(initialFilters);
  }, [buildFilters, fetchUsers, page, limit]);

  // Debounced search for text inputs (email, username, first/last name, phone)
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters({ page: 1 });
    }, 500);

    return () => clearTimeout(timer);
  }, [
    emailInput,
    usernameInput,
    firstNameInput,
    lastNameInput,
    phoneInput,
    applyFilters,
  ]);

  const handlePageChange = (newPage: number) => {
    applyFilters({ page: newPage });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    applyFilters({ page: 1, limit: newPageSize });
  };

  if (isLoading && users.length === 0) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 px-6 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(total / limit)} • Total: {total} users
            </p>
          </div>
          <div>
            <CreateUserDialog />
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 py-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="id" className="text-sm font-medium whitespace-nowrap">
              ID:
            </Label>
            <Input
              id="id"
              type="text"
              placeholder="User ID"
              value={idInput}
              onChange={(e) => setIdInput(sanitizeNumericId(e.target.value))}
              onBlur={() => applyFilters({ page: 1 })}
              className="w-32"
              inputMode="numeric"
              pattern="\\d*"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="email" className="text-sm font-medium whitespace-nowrap">
              Email:
            </Label>
            <Input
              id="email"
              type="text"
              placeholder="Email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-48"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="username" className="text-sm font-medium whitespace-nowrap">
              Username:
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-40"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="firstName" className="text-sm font-medium whitespace-nowrap">
              First Name:
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="First Name"
              value={firstNameInput}
              onChange={(e) => setFirstNameInput(e.target.value)}
              className="w-40"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="lastName" className="text-sm font-medium whitespace-nowrap">
              Last Name:
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Last Name"
              value={lastNameInput}
              onChange={(e) => setLastNameInput(e.target.value)}
              className="w-40"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="phone" className="text-sm font-medium whitespace-nowrap">
              Phone:
            </Label>
            <Input
              id="phone"
              type="text"
              placeholder="Phone"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-40"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="role" className="text-sm font-medium whitespace-nowrap">
              Role:
            </Label>
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value);
                applyFilters({ page: 1, roleFilter: value });
              }}
            >
              <SelectTrigger id="role" className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="isActive" className="text-sm font-medium whitespace-nowrap">
              Status:
            </Label>
            <Select
              value={isActiveFilter}
              onValueChange={(value) => {
                setIsActiveFilter(value);
                applyFilters({ page: 1, isActiveFilter: value });
              }}
            >
              <SelectTrigger id="isActive" className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable 
            data={users} 
            total={total}
            page={page}
            limit={limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
