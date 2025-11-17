"use client"
export const runtime = 'edge';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

export default function Page() { 
  const router = useRouter();
  const searchParams = useSearchParams();
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
  
  const previousUrlRef = useRef<string>('');
  const isInitializedRef = useRef(false);

  // Initialize URL with page and limit if not present
  useEffect(() => {
    if (!isInitializedRef.current) {
      const urlPage = searchParams.get('page');
      const urlLimit = searchParams.get('limit');
      
      // If page or limit are missing, add them to URL
      if (!urlPage || !urlLimit) {
        const params = new URLSearchParams();
        params.set('page', urlPage || '1');
        params.set('limit', urlLimit || '10');
        
        // Preserve existing filter params
        const urlId = searchParams.get('id');
        const urlEmail = searchParams.get('email');
        const urlUsername = searchParams.get('username');
        const urlFirstName = searchParams.get('firstName');
        const urlLastName = searchParams.get('lastName');
        const urlPhone = searchParams.get('phone');
        const urlRole = searchParams.get('role');
        const urlIsActive = searchParams.get('isActive');
        
        if (urlId) params.set('id', urlId);
        if (urlEmail) params.set('email', urlEmail);
        if (urlUsername) params.set('username', urlUsername);
        if (urlFirstName) params.set('firstName', urlFirstName);
        if (urlLastName) params.set('lastName', urlLastName);
        if (urlPhone) params.set('phone', urlPhone);
        if (urlRole) params.set('role', urlRole);
        if (urlIsActive) params.set('isActive', urlIsActive);
        
        const newUrl = `?${params.toString()}`;
        router.replace(`/users${newUrl}`, { scroll: false });
        isInitializedRef.current = true;
        return;
      }
      isInitializedRef.current = true;
    }
  }, [searchParams, router]);

  // Sync URL → Store: Fetch data when URL changes
  useEffect(() => {
    if (!isInitializedRef.current) {
      return;
    }

    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlLimit = parseInt(searchParams.get('limit') || '10', 10);
    const urlId = searchParams.get('id');
    const urlEmail = searchParams.get('email') || '';
    const urlUsername = searchParams.get('username') || '';
    const urlFirstName = searchParams.get('firstName') || '';
    const urlLastName = searchParams.get('lastName') || '';
    const urlPhone = searchParams.get('phone') || '';
    const urlRole = searchParams.get('role') || 'all';
    const urlIsActive = searchParams.get('isActive') || 'all';
    
    // Update local state from URL
    setIdInput(urlId || '');
    setEmailInput(urlEmail);
    setUsernameInput(urlUsername);
    setFirstNameInput(urlFirstName);
    setLastNameInput(urlLastName);
    setPhoneInput(urlPhone);
    setRoleFilter(urlRole);
    setIsActiveFilter(urlIsActive);
    
    // Build filters object
    const filters: UserFilters = {
      page: urlPage,
      limit: urlLimit,
      ...(urlId && { id: parseInt(urlId, 10) }),
      ...(urlEmail && { email: urlEmail }),
      ...(urlUsername && { username: urlUsername }),
      ...(urlFirstName && { firstName: urlFirstName }),
      ...(urlLastName && { lastName: urlLastName }),
      ...(urlPhone && { phone: urlPhone }),
      ...(urlRole !== 'all' && { role: urlRole as 'user' | 'admin' }),
      ...(urlIsActive !== 'all' && { isActive: urlIsActive === 'true' }),
    };

    // Create URL string for comparison
    const currentUrl = `page=${urlPage}&limit=${urlLimit}&id=${urlId || ''}&email=${urlEmail}&username=${urlUsername}&firstName=${urlFirstName}&lastName=${urlLastName}&phone=${urlPhone}&role=${urlRole}&isActive=${urlIsActive}`;
    
    // Only fetch if URL actually changed
    if (previousUrlRef.current !== currentUrl) {
      previousUrlRef.current = currentUrl;
      fetchUsers(filters);
    }
  }, [searchParams, fetchUsers]);

  const updateFilters = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', '1'); // Reset to page 1 when filtering
    params.set('limit', limit.toString());
    
    if (idInput.trim()) params.set('id', idInput.trim());
    if (emailInput.trim()) params.set('email', emailInput.trim());
    if (usernameInput.trim()) params.set('username', usernameInput.trim());
    if (firstNameInput.trim()) params.set('firstName', firstNameInput.trim());
    if (lastNameInput.trim()) params.set('lastName', lastNameInput.trim());
    if (phoneInput.trim()) params.set('phone', phoneInput.trim());
    if (roleFilter !== 'all') params.set('role', roleFilter);
    if (isActiveFilter !== 'all') params.set('isActive', isActiveFilter);

    router.replace(`/users?${params.toString()}`, { scroll: false });
  }, [idInput, emailInput, usernameInput, firstNameInput, lastNameInput, phoneInput, roleFilter, isActiveFilter, limit, router]);

  // Debounced search for text inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters();
    }, 500);

    return () => clearTimeout(timer);
  }, [emailInput, usernameInput, firstNameInput, lastNameInput, phoneInput, updateFilters]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    params.set('limit', limit.toString());
    
    if (idInput.trim()) params.set('id', idInput.trim());
    if (emailInput.trim()) params.set('email', emailInput.trim());
    if (usernameInput.trim()) params.set('username', usernameInput.trim());
    if (firstNameInput.trim()) params.set('firstName', firstNameInput.trim());
    if (lastNameInput.trim()) params.set('lastName', lastNameInput.trim());
    if (phoneInput.trim()) params.set('phone', phoneInput.trim());
    if (roleFilter !== 'all') params.set('role', roleFilter);
    if (isActiveFilter !== 'all') params.set('isActive', isActiveFilter);

    router.replace(`/users?${params.toString()}`, { scroll: false });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', newPageSize.toString());
    
    if (idInput.trim()) params.set('id', idInput.trim());
    if (emailInput.trim()) params.set('email', emailInput.trim());
    if (usernameInput.trim()) params.set('username', usernameInput.trim());
    if (firstNameInput.trim()) params.set('firstName', firstNameInput.trim());
    if (lastNameInput.trim()) params.set('lastName', lastNameInput.trim());
    if (phoneInput.trim()) params.set('phone', phoneInput.trim());
    if (roleFilter !== 'all') params.set('role', roleFilter);
    if (isActiveFilter !== 'all') params.set('isActive', isActiveFilter);

    router.replace(`/users?${params.toString()}`, { scroll: false });
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
              onChange={(e) => setIdInput(e.target.value)}
              onBlur={updateFilters}
              className="w-32"
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
            <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value); updateFilters(); }}>
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
            <Select value={isActiveFilter} onValueChange={(value) => { setIsActiveFilter(value); updateFilters(); }}>
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
