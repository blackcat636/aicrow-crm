"use client"

export const runtime = 'edge';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserWorkflowsStore } from "@/store/useUserWorkflowsStore"
import { useUserStore } from "@/store/useUserStore"
import { useUsersStore } from "@/store/useUsersStore"
import { UserFilters } from "@/lib/api/users"
import { UserWorkflowsDataTable } from "@/components/user-workflows/user-workflows-data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconPlus, IconSettings, IconActivity, IconCircleCheckFilled, IconUsers, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function UserWorkflowsOverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserStore()
  const { users, fetchUsers, isLoading: usersLoading, error: usersError, total: usersTotal, page: usersPage, limit: usersLimit } = useUsersStore()
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  
  // Local state for filter inputs
  const [idInput, setIdInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [firstNameInput, setFirstNameInput] = useState<string>('');
  const [lastNameInput, setLastNameInput] = useState<string>('');
  const { 
    userWorkflows, 
    isLoading, 
    total, 
    page, 
    limit,
    isActive,
    workflowId,
    fetchUserWorkflows 
  } = useUserWorkflowsStore()
  const [isActiveFilter, setIsActiveFilter] = useState<string>(isActive !== undefined ? isActive.toString() : 'all');
  const [workflowIdInput, setWorkflowIdInput] = useState<string>(workflowId?.toString() || '');
  const previousUrlRef = useRef<string>('');
  const isInitializedRef = useRef(false);
  const previousUsersUrlRef = useRef<string>('');
  const usersInitializedRef = useRef(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  // Auto-select user from URL query parameter or current user for non-admin
  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    if (userIdParam) {
      const userId = parseInt(userIdParam);
      if (!isNaN(userId)) {
        setSelectedUserId(userId);
      }
    } else if (user?.id && !isAdmin) {
      setSelectedUserId(user.id);
    }
    // Reset initialization when user changes
    isInitializedRef.current = false;
    previousUrlRef.current = '';
  }, [searchParams, user?.id, isAdmin]);

  // Initialize URL with page and limit if not present (only when user is selected)
  useEffect(() => {
    if (!selectedUserId) return;
    
    if (!isInitializedRef.current) {
      const urlPage = searchParams.get('page');
      const urlLimit = searchParams.get('limit');
      
      // If page or limit are missing, add them to URL
      if (!urlPage || !urlLimit) {
        const params = new URLSearchParams();
        params.set('page', urlPage || '1');
        params.set('limit', urlLimit || '10');
        const urlIsActive = searchParams.get('isActive');
        const urlWorkflowId = searchParams.get('workflowId');
        if (urlIsActive) params.set('isActive', urlIsActive);
        if (urlWorkflowId) params.set('workflowId', urlWorkflowId);
        
        const newUrl = `?${params.toString()}`;
        router.replace(`/user-workflows${newUrl}`, { scroll: false });
        isInitializedRef.current = true;
        return;
      }
      isInitializedRef.current = true;
    }
  }, [searchParams, router, selectedUserId]);

  // Sync URL → Store: Fetch data when URL changes (only when user is selected)
  useEffect(() => {
    if (!selectedUserId || !isInitializedRef.current) {
      return;
    }

    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlLimit = parseInt(searchParams.get('limit') || '10', 10);
    const urlIsActive = searchParams.get('isActive');
    const urlWorkflowId = searchParams.get('workflowId');
    
    // Use null to explicitly clear filter when not in URL (store will convert to undefined for API)
    // searchParams.get() returns null when param is missing, not undefined
    const parsedIsActive = urlIsActive !== null && urlIsActive !== undefined ? (urlIsActive === 'true' ? true : false) : null;
    const parsedWorkflowId = urlWorkflowId && urlWorkflowId !== '' ? parseInt(urlWorkflowId, 10) : null;
    
    // Update local state from URL
    if (parsedIsActive !== null) {
      const newIsActiveFilter = parsedIsActive.toString();
      if (newIsActiveFilter !== isActiveFilter) {
        setIsActiveFilter(newIsActiveFilter);
      }
    } else if (parsedIsActive === null && isActiveFilter !== 'all') {
      setIsActiveFilter('all');
    }
    
    if (parsedWorkflowId !== null && parsedWorkflowId.toString() !== workflowIdInput) {
      setWorkflowIdInput(parsedWorkflowId.toString());
    } else if (parsedWorkflowId === null && workflowIdInput !== '') {
      setWorkflowIdInput('');
    }
    
    // Create URL string for comparison
    const currentUrl = `page=${urlPage}&limit=${urlLimit}&isActive=${parsedIsActive ?? ''}&workflowId=${parsedWorkflowId ?? ''}`;
    
    // Only fetch if URL actually changed
    if (previousUrlRef.current !== currentUrl) {
      previousUrlRef.current = currentUrl;
      
      // Fetch data from URL params
      fetchUserWorkflows(selectedUserId, urlPage, urlLimit, parsedIsActive, parsedWorkflowId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, fetchUserWorkflows, selectedUserId]);

  // Define updateUsersFilters before it's used in useEffect
  // This function is only called when filter inputs change, not when page changes
  const updateUsersFilters = useCallback(() => {
    if (!isAdmin) return;
    
    const params = new URLSearchParams(searchParams.toString());
    // Only reset to page 1 when filters change, preserve current page if it exists
    const currentPage = searchParams.get('usersPage');
    params.set('usersPage', currentPage || '1');
    params.set('usersLimit', usersLimit.toString());
    
    // Explicitly set or remove parameters based on input values
    if (idInput.trim()) {
      params.set('usersId', idInput.trim());
    } else {
      params.delete('usersId');
    }
    
    if (emailInput.trim()) {
      params.set('usersEmail', emailInput.trim());
    } else {
      params.delete('usersEmail');
    }
    
    if (usernameInput.trim()) {
      params.set('usersUsername', usernameInput.trim());
    } else {
      params.delete('usersUsername');
    }
    
    if (firstNameInput.trim()) {
      params.set('usersFirstName', firstNameInput.trim());
    } else {
      params.delete('usersFirstName');
    }
    
    if (lastNameInput.trim()) {
      params.set('usersLastName', lastNameInput.trim());
    } else {
      params.delete('usersLastName');
    }

    router.replace(`/user-workflows?${params.toString()}`, { scroll: false });
  }, [isAdmin, idInput, emailInput, usernameInput, firstNameInput, lastNameInput, usersLimit, searchParams, router]);

  // Initialize URL with usersPage and usersLimit if not present (for admin user selector)
  useEffect(() => {
    if (!isAdmin) return;
    
    if (!usersInitializedRef.current) {
      const urlUsersPage = searchParams.get('usersPage');
      const urlUsersLimit = searchParams.get('usersLimit');
      
      // If usersPage or usersLimit are missing, add them to URL
      if (!urlUsersPage || !urlUsersLimit) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('usersPage', urlUsersPage || '1');
        params.set('usersLimit', urlUsersLimit || '25');
        
        // Preserve existing params
        router.replace(`/user-workflows?${params.toString()}`, { scroll: false });
        usersInitializedRef.current = true;
        return;
      }
      usersInitializedRef.current = true;
    }
  }, [searchParams, router, isAdmin]);

  // Sync URL → Store: Fetch users when URL changes (for admin user selector)
  useEffect(() => {
    if (!isAdmin || !usersInitializedRef.current) return;
    
    const urlPage = parseInt(searchParams.get('usersPage') || '1', 10);
    const urlLimit = parseInt(searchParams.get('usersLimit') || '25', 10);
    const urlId = searchParams.get('usersId');
    const urlEmail = searchParams.get('usersEmail') || '';
    const urlUsername = searchParams.get('usersUsername') || '';
    const urlFirstName = searchParams.get('usersFirstName') || '';
    const urlLastName = searchParams.get('usersLastName') || '';
    
    // Create URL string for comparison (use empty string for null/undefined values)
    const currentUsersUrl = `usersPage=${urlPage}&usersLimit=${urlLimit}&usersId=${urlId || ''}&usersEmail=${urlEmail}&usersUsername=${urlUsername}&usersFirstName=${urlFirstName}&usersLastName=${urlLastName}`;
    
    // Only update state and fetch if URL actually changed
    if (previousUsersUrlRef.current !== currentUsersUrl) {
      previousUsersUrlRef.current = currentUsersUrl;
      
      // Update local state from URL
      setIdInput(urlId || '');
      setEmailInput(urlEmail);
      setUsernameInput(urlUsername);
      setFirstNameInput(urlFirstName);
      setLastNameInput(urlLastName);
      
      // Build filters object - explicitly set undefined for empty values to clear filters
      const filters: UserFilters = {
        page: urlPage,
        limit: urlLimit,
        // Explicitly set undefined for empty values to clear filters in store
        id: urlId && urlId.trim() ? parseInt(urlId, 10) : undefined,
        email: urlEmail && urlEmail.trim() ? urlEmail.trim() : undefined,
        username: urlUsername && urlUsername.trim() ? urlUsername.trim() : undefined,
        firstName: urlFirstName && urlFirstName.trim() ? urlFirstName.trim() : undefined,
        lastName: urlLastName && urlLastName.trim() ? urlLastName.trim() : undefined,
      };
      
      fetchUsers(filters);
    }
  }, [searchParams, isAdmin, fetchUsers]);

  // Debounced search for text inputs
  useEffect(() => {
    if (!isAdmin) return;
    
    const timer = setTimeout(() => {
      updateUsersFilters();
    }, 500);

    return () => clearTimeout(timer);
  }, [emailInput, usernameInput, firstNameInput, lastNameInput, idInput, isAdmin, updateUsersFilters]);

  const handlePageChange = (newPage: number) => {
    if (!selectedUserId) return;
    
    const urlLimit = parseInt(searchParams.get('limit') || '10', 10);
    const urlIsActive = searchParams.get('isActive');
    const urlWorkflowId = searchParams.get('workflowId');
    
    // Use null to explicitly clear filters when not in URL
    const parsedIsActive = urlIsActive !== null ? (urlIsActive === 'true' ? true : false) : null;
    const parsedWorkflowId = urlWorkflowId ? parseInt(urlWorkflowId, 10) : null;
    const newUrlString = `page=${newPage}&limit=${urlLimit}&isActive=${parsedIsActive ?? ''}&workflowId=${parsedWorkflowId ?? ''}`;
    
    // Update previousUrlRef BEFORE router.replace to prevent useEffect from fetching with old params
    previousUrlRef.current = newUrlString;
    
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    params.set('limit', urlLimit.toString());
    if (urlIsActive) params.set('isActive', urlIsActive);
    if (urlWorkflowId) params.set('workflowId', urlWorkflowId);

    router.replace(`/user-workflows?${params.toString()}`, { scroll: false });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (!selectedUserId) return;
    
    const urlIsActive = searchParams.get('isActive');
    const urlWorkflowId = searchParams.get('workflowId');
    
    // Use null to explicitly clear filters when not in URL
    const parsedIsActive = urlIsActive !== null ? (urlIsActive === 'true' ? true : false) : null;
    const parsedWorkflowId = urlWorkflowId ? parseInt(urlWorkflowId, 10) : null;
    const newUrlString = `page=1&limit=${newPageSize}&isActive=${parsedIsActive ?? ''}&workflowId=${parsedWorkflowId ?? ''}`;
    
    // Update previousUrlRef BEFORE router.replace to prevent useEffect from fetching with old params
    previousUrlRef.current = newUrlString;
    
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', newPageSize.toString());
    if (urlIsActive) params.set('isActive', urlIsActive);
    if (urlWorkflowId) params.set('workflowId', urlWorkflowId);

    router.replace(`/user-workflows?${params.toString()}`, { scroll: false });
  };

  const handleFiltersChange = () => {
    // Intentionally left blank: parent handles fetching via effects and store
  };

  const handleUsersPageChange = (newPage: number) => {
    if (!isAdmin) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('usersPage', newPage.toString());
    params.set('usersLimit', usersLimit.toString());
    
    // Explicitly set or remove parameters based on input values
    if (idInput.trim()) {
      params.set('usersId', idInput.trim());
    } else {
      params.delete('usersId');
    }
    
    if (emailInput.trim()) {
      params.set('usersEmail', emailInput.trim());
    } else {
      params.delete('usersEmail');
    }
    
    if (usernameInput.trim()) {
      params.set('usersUsername', usernameInput.trim());
    } else {
      params.delete('usersUsername');
    }
    
    if (firstNameInput.trim()) {
      params.set('usersFirstName', firstNameInput.trim());
    } else {
      params.delete('usersFirstName');
    }
    
    if (lastNameInput.trim()) {
      params.set('usersLastName', lastNameInput.trim());
    } else {
      params.delete('usersLastName');
    }

    // Update previousUsersUrlRef to match the new URL before navigation
    const newUsersUrlString = `usersPage=${newPage}&usersLimit=${usersLimit}&usersId=${idInput.trim() || ''}&usersEmail=${emailInput.trim()}&usersUsername=${usernameInput.trim()}&usersFirstName=${firstNameInput.trim()}&usersLastName=${lastNameInput.trim()}`;
    previousUsersUrlRef.current = newUsersUrlString;

        // Build filters and fetch immediately for faster response
        const filters: UserFilters = {
      page: newPage,
      limit: usersLimit,
      id: idInput.trim() ? parseInt(idInput.trim(), 10) : undefined,
      email: emailInput.trim() ? emailInput.trim() : undefined,
      username: usernameInput.trim() ? usernameInput.trim() : undefined,
      firstName: firstNameInput.trim() ? firstNameInput.trim() : undefined,
      lastName: lastNameInput.trim() ? lastNameInput.trim() : undefined,
    };
    
    // Fetch immediately to update data faster
    fetchUsers(filters);

    router.replace(`/user-workflows?${params.toString()}`, { scroll: false });
  };

  const handleUsersPageSizeChange = (newPageSize: number) => {
    if (!isAdmin) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('usersPage', '1');
    params.set('usersLimit', newPageSize.toString());
    
    // Explicitly set or remove parameters based on input values
    if (idInput.trim()) {
      params.set('usersId', idInput.trim());
    } else {
      params.delete('usersId');
    }
    
    if (emailInput.trim()) {
      params.set('usersEmail', emailInput.trim());
    } else {
      params.delete('usersEmail');
    }
    
    if (usernameInput.trim()) {
      params.set('usersUsername', usernameInput.trim());
    } else {
      params.delete('usersUsername');
    }
    
    if (firstNameInput.trim()) {
      params.set('usersFirstName', firstNameInput.trim());
    } else {
      params.delete('usersFirstName');
    }
    
    if (lastNameInput.trim()) {
      params.set('usersLastName', lastNameInput.trim());
    } else {
      params.delete('usersLastName');
    }

    router.replace(`/user-workflows?${params.toString()}`, { scroll: false });
  };

  const displayedUsers = users

  // Calculate statistics
  const activeWorkflows = userWorkflows?.filter(w => w.isActive).length || 0
  const totalExecutions = userWorkflows?.reduce((sum, w) => sum + (w.totalExecutions ?? 0), 0) || 0
  const successfulExecutions = userWorkflows?.reduce((sum, w) => sum + (w.successfulExecutions ?? 0), 0) || 0

  // Find selected user details
  const selectedUser = users.find(u => u.id === selectedUserId)

  if (!user) {
    return <div>Loading user...</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 px-6 pb-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              {isAdmin ? 'User Workflows Management' : 'My Workflows'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedUserId ? (
                <>Page {page} of {Math.ceil(total / limit)} • Total: {total} workflows</>
              ) : (
                <>{isAdmin ? 'Manage user workflows' : 'Your personal automations'}</>
              )}
            </p>
          </div>
          {selectedUserId && (
            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/users/${selectedUserId}/workflows/new`}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Create Workflow
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* User Selector for Admin */}
        {isAdmin && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUsers className="h-5 w-5" />
                Select User
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 py-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="usersId" className="text-sm font-medium whitespace-nowrap">
                    ID:
                  </Label>
                  <Input
                    id="usersId"
                    type="text"
                    placeholder="User ID"
                    value={idInput}
                    onChange={(e) => setIdInput(e.target.value)}
                    onBlur={updateUsersFilters}
                    className="w-32"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="usersEmail" className="text-sm font-medium whitespace-nowrap">
                    Email:
                  </Label>
                  <Input
                    id="usersEmail"
                    type="text"
                    placeholder="Email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-48"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="usersUsername" className="text-sm font-medium whitespace-nowrap">
                    Username:
                  </Label>
                  <Input
                    id="usersUsername"
                    type="text"
                    placeholder="Username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-40"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="usersFirstName" className="text-sm font-medium whitespace-nowrap">
                    First Name:
                  </Label>
                  <Input
                    id="usersFirstName"
                    type="text"
                    placeholder="First Name"
                    value={firstNameInput}
                    onChange={(e) => setFirstNameInput(e.target.value)}
                    className="w-40"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="usersLastName" className="text-sm font-medium whitespace-nowrap">
                    Last Name:
                  </Label>
                  <Input
                    id="usersLastName"
                    type="text"
                    placeholder="Last Name"
                    value={lastNameInput}
                    onChange={(e) => setLastNameInput(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
              
              {usersError && (
                <p className="text-xs text-red-500 mt-1">Error: {usersError}</p>
              )}
              {!usersLoading && !usersError && (
                <p className="text-xs text-muted-foreground mt-1">
                  Page {usersPage} of {Math.ceil(usersTotal / usersLimit)} • Total: {usersTotal} users
                </p>
              )}
              {/* Quick user selection cards */}
              {!selectedUserId && displayedUsers.length > 0 && (
                <div>
                  <Label className="mb-2 block">Select User:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto p-1">
                    {displayedUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {(u.username || u.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {u.username || u.email}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {u.email}
                          </p>
                          {(u.firstName || u.lastName) && (
                            <p className="text-xs text-muted-foreground">
                              {u.firstName} {u.lastName}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {!selectedUserId && usersTotal > 0 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="users-rows-per-page" className="text-sm font-medium">
                          Rows per page
                        </Label>
                        <Select
                          value={`${usersLimit}`}
                          onValueChange={(value) => {
                            const pageSize = Number(value)
                            const validPageSize = Math.min(pageSize, 100)
                            handleUsersPageSizeChange(validPageSize)
                          }}
                        >
                          <SelectTrigger size="sm" className="w-20" id="users-rows-per-page">
                            <SelectValue placeholder={usersLimit} />
                          </SelectTrigger>
                          <SelectContent side="top">
                            {[10, 25, 50, 100].map((pageSize) => (
                              <SelectItem key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex w-fit items-center justify-center text-sm font-medium">
                        Page {usersPage} of {Math.ceil(usersTotal / usersLimit)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUsersPageChange(1)}
                          disabled={usersPage === 1 || usersLoading}
                        >
                          <IconChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUsersPageChange(usersPage - 1)}
                          disabled={usersPage === 1 || usersLoading}
                        >
                          <IconChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        {/* Page number buttons */}
                        {(() => {
                          const pageCount = Math.ceil(usersTotal / usersLimit)
                          const currentPage = usersPage
                          const maxVisible = 7
                          const pages: (number | string)[] = []
                          
                          if (pageCount <= maxVisible) {
                            // Show all pages
                            for (let i = 1; i <= pageCount; i++) {
                              pages.push(i)
                            }
                          } else {
                            // Show first page
                            if (currentPage <= 3) {
                              for (let i = 1; i <= 5; i++) {
                                pages.push(i)
                              }
                              pages.push('...')
                              pages.push(pageCount)
                            }
                            // Show middle pages
                            else if (currentPage >= pageCount - 2) {
                              pages.push(1)
                              pages.push('...')
                              for (let i = pageCount - 4; i <= pageCount; i++) {
                                pages.push(i)
                              }
                            }
                            // Show around current
                            else {
                              pages.push(1)
                              pages.push('...')
                              for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                                pages.push(i)
                              }
                              pages.push('...')
                              pages.push(pageCount)
                            }
                          }
                          
                          return pages.map((page, idx) => (
                            page === '...' ? (
                              <span key={`ellipsis-${idx}`} className="px-2">
                                ...
                              </span>
                            ) : (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleUsersPageChange(page as number)}
                                disabled={usersLoading}
                              >
                                {page}
                              </Button>
                            )
                          ))
                        })()}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUsersPageChange(usersPage + 1)}
                          disabled={usersPage >= Math.ceil(usersTotal / usersLimit) || usersLoading}
                        >
                          <IconChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUsersPageChange(Math.ceil(usersTotal / usersLimit))}
                          disabled={usersPage >= Math.ceil(usersTotal / usersLimit) || usersLoading}
                        >
                          <IconChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedUser && (
                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {(selectedUser.username || selectedUser.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Selected User:</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedUser.email} • {selectedUser.username}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUserId(null)}
                  >
                    Change
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Show stats and table only when user is selected */}
        {selectedUserId ? (
          <>
            {/* Info about selected user and stats */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold">
                  Workflows {selectedUser ? `for ${selectedUser.username || selectedUser.email}` : ''}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(total / limit)} • Total: {total} workflows
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
                  <IconSettings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{total}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeWorkflows} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
                  <IconActivity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{totalExecutions}</div>
                  <p className="text-xs text-muted-foreground">
                    {successfulExecutions} successful
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Status</CardTitle>
                  <IconCircleCheckFilled className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {total > 0 ? ((activeWorkflows / total) * 100).toFixed(0) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Workflows active
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Workflows Table */}
            <div className="flex flex-col gap-4 md:gap-6">
              <UserWorkflowsDataTable
                data={userWorkflows || []}
                total={total}
                page={page}
                limit={limit}
                userId={selectedUserId}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onFiltersChange={handleFiltersChange}
                isLoading={isLoading}
              />
            </div>
          </>
        ) : (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <IconUsers className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isAdmin ? 'Select User' : 'No Data'}
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {isAdmin 
                  ? 'To view and manage workflows, select a user from the list above'
                  : 'You have no workflows yet'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

