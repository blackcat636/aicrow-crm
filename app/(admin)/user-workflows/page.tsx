"use client"

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUserWorkflowsStore } from "@/store/useUserWorkflowsStore"
import { useUserStore } from "@/store/useUserStore"
import { useUsersStore } from "@/store/useUsersStore"
import { UserWorkflowsDataTable } from "@/components/user-workflows/user-workflows-data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconPlus, IconSettings, IconActivity, IconCircleCheckFilled, IconUsers, IconSearch } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function UserWorkflowsOverviewPage() {
  const searchParams = useSearchParams();
  const { user } = useUserStore()
  const { users, fetchUsers, isLoading: usersLoading, error: usersError } = useUsersStore()
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { 
    userWorkflows, 
    isLoading, 
    total, 
    page, 
    limit, 
    fetchUserWorkflows 
  } = useUserWorkflowsStore()

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  // Load users list for admin
  useEffect(() => {
    if (isAdmin) {
      fetchUsers(1, 100); // Load up to 100 users for selection
    }
  }, [isAdmin, fetchUsers]);

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
  }, [searchParams, user?.id, isAdmin]);

  // Fetch workflows when user is selected
  useEffect(() => {
    if (selectedUserId) {
      fetchUserWorkflows(selectedUserId);
    }
  }, [selectedUserId, fetchUserWorkflows]);

  const handlePageChange = (newPage: number) => {
    if (selectedUserId) {
      fetchUserWorkflows(selectedUserId, newPage, limit);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (selectedUserId) {
      fetchUserWorkflows(selectedUserId, 1, newPageSize);
    }
  };

  const handleFiltersChange = () => {
    // Intentionally left blank: parent handles fetching via effects and store
  };

  // Filter users by search query
  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      <div className="@container/main flex flex-1 flex-col gap-2">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              {isAdmin ? 'User Workflows Management' : 'My Workflows'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? 'Manage user workflows' : 'Your personal automations'}
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
              <div>
                <Label htmlFor="search">Search User</Label>
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Email, username, name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {usersError && (
                  <p className="text-xs text-red-500 mt-1">Error: {usersError}</p>
                )}
                {!usersLoading && !usersError && users.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Found {filteredUsers.length} of {users.length} users
                  </p>
                )}
              </div>
              {/* Quick user selection cards */}
              {!selectedUserId && filteredUsers.length > 0 && (
                <div>
                  <Label className="mb-2 block">Select User:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto p-1">
                    {filteredUsers.map((u) => (
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

