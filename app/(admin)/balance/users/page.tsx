"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getAllUsersWithBalances } from '@/lib/api/balance'
import { UserWithBalancesDto } from '@/interface/Balance'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { UsersBalancesDataTable } from '@/components/balance/users-balances-data-table'
import { IconCoins, IconUser, IconLoader2 } from '@tabler/icons-react'
import { toast } from 'sonner'

export default function UsersWithBalancesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [usersWithBalances, setUsersWithBalances] = useState<UserWithBalancesDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalBalances, setTotalBalances] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1', 10)
    const urlLimit = parseInt(searchParams.get('limit') || '20', 10)
    setPage(urlPage)
    setLimit(urlLimit)
  }, [searchParams])

  useEffect(() => {
    fetchUsersWithBalances()
  }, [])

  const fetchUsersWithBalances = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getAllUsersWithBalances()
      setUsersWithBalances(response.data)
      setTotalUsers(response.total_users)
      setTotalBalances(response.total_balances)
    } catch (err) {
      console.error('Failed to fetch users with balances:', err)
      setError(err instanceof Error ? err.message : 'Failed to load users with balances')
      toast.error('Failed to load users with balances', {
        description: err instanceof Error ? err.message : 'Unknown error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    params.set('page', newPage.toString())
    params.set('limit', limit.toString())
    router.replace(`/balance/users?${params.toString()}`, { scroll: false })
    setPage(newPage)
  }

  const handlePageSizeChange = (newLimit: number) => {
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('limit', newLimit.toString())
    router.replace(`/balance/users?${params.toString()}`, { scroll: false })
    setPage(1)
    setLimit(newLimit)
  }

  // Calculate pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedData = usersWithBalances.slice(startIndex, endIndex)
  const totalPages = Math.ceil(usersWithBalances.length / limit)

  if (isLoading && usersWithBalances.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Loading users with balances...</p>
      </div>
    )
  }

  if (error && usersWithBalances.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6 px-6 pb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-destructive mb-4">{error}</p>
                <button 
                  onClick={fetchUsersWithBalances}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Retry
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 px-6 pb-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Users with Balances</h1>
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} • Total: {usersWithBalances.length} users • {totalBalances} balances
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <IconUser className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balances</CardTitle>
              <IconCoins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBalances}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users with Balances</CardTitle>
              <IconUser className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersWithBalances.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users and Their Balances</CardTitle>
            <CardDescription>
              List of all users with their active balances
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-4">{error}</p>
                <button 
                  onClick={fetchUsersWithBalances}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Retry
                </button>
              </div>
            ) : (
              <UsersBalancesDataTable 
                data={paginatedData} 
                isLoading={isLoading}
                total={usersWithBalances.length}
                page={page}
                limit={limit}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

