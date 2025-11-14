"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { getUserBalances, getUserTransactions } from '@/lib/api/balance'
import { AdminBalanceDto, UserInfoDto, Transaction, TransactionFilters } from '@/interface/Balance'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { TransactionsDataTable } from '@/components/balance/transactions-data-table'
import { IconCoins, IconUser, IconMail, IconArrowLeft, IconLoader2, IconCalendar } from '@tabler/icons-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function UserBalancesPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const userId = params?.userId ? parseInt(params.userId as string, 10) : null

  const [user, setUser] = useState<UserInfoDto | null>(null)
  const [balances, setBalances] = useState<AdminBalanceDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)
  const [transactionsTotal, setTransactionsTotal] = useState(0)
  const [transactionsPage, setTransactionsPage] = useState(1)
  const [transactionsLimit, setTransactionsLimit] = useState(50)
  const [transactionsTotalPages, setTransactionsTotalPages] = useState(1)

  // Filter state
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [referenceIdFilter, setReferenceIdFilter] = useState<string>('')
  const [minAmountFilter, setMinAmountFilter] = useState<string>('')
  const [maxAmountFilter, setMaxAmountFilter] = useState<string>('')
  const [startDateFilter, setStartDateFilter] = useState<string>('')
  const [endDateFilter, setEndDateFilter] = useState<string>('')

  const previousUrlRef = useRef<string>('')
  const isInitializedRef = useRef(false)

  const fetchUserBalances = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await getUserBalances(userId)
      setUser(response.user)
      setBalances(response.data)
      
      if (response.status === 404) {
        setError('User not found')
        toast.error('User not found', {
          description: `User with ID ${userId} does not exist`
        })
      }
    } catch (err) {
      console.error('Failed to fetch user balances:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user balances')
      toast.error('Failed to load user balances', {
        description: err instanceof Error ? err.message : 'Unknown error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchUserBalances()
    } else {
      setError('Invalid user ID')
      setIsLoading(false)
    }
  }, [userId, fetchUserBalances])

  const formatBalance = (amount: number, precision: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const fetchTransactions = useCallback(async (filters: TransactionFilters) => {
    if (!userId) return

    setTransactionsLoading(true)
    setTransactionsError(null)
    try {
      const response = await getUserTransactions(userId, filters)
      setTransactions(response.transactions)
      setTransactionsTotal(response.pagination.total)
      setTransactionsPage(response.pagination.page)
      setTransactionsLimit(response.pagination.limit)
      setTransactionsTotalPages(response.pagination.pages)
    } catch (err) {
      setTransactionsError(err instanceof Error ? err.message : 'Failed to load transactions')
      toast.error('Failed to load transactions', {
        description: err instanceof Error ? err.message : 'Unknown error occurred'
      })
    } finally {
      setTransactionsLoading(false)
    }
  }, [userId])

  // Initialize URL params for transactions
  useEffect(() => {
    if (!userId || isInitializedRef.current) return

    const urlPage = searchParams.get('page')
    const urlLimit = searchParams.get('limit')
    const urlType = searchParams.get('type')
    const urlStatus = searchParams.get('status')
    const urlReferenceId = searchParams.get('referenceId')
    const urlMinAmount = searchParams.get('minAmount')
    const urlMaxAmount = searchParams.get('maxAmount')
    const urlStartDate = searchParams.get('startDate')
    const urlEndDate = searchParams.get('endDate')

    if (!urlPage || !urlLimit) {
      const params = new URLSearchParams()
      params.set('page', urlPage || '1')
      params.set('limit', urlLimit || '50')
      if (urlType) params.set('type', urlType)
      if (urlStatus) params.set('status', urlStatus)
      if (urlReferenceId) params.set('referenceId', urlReferenceId)
      if (urlMinAmount) params.set('minAmount', urlMinAmount)
      if (urlMaxAmount) params.set('maxAmount', urlMaxAmount)
      if (urlStartDate) params.set('startDate', urlStartDate)
      if (urlEndDate) params.set('endDate', urlEndDate)

      router.replace(`/balance/users/${userId}/balances?${params.toString()}`, { scroll: false })
      isInitializedRef.current = true
      return
    }
    isInitializedRef.current = true
  }, [searchParams, router, userId])

  // Sync URL → Fetch transactions
  useEffect(() => {
    if (!userId || !isInitializedRef.current) return

    const urlPage = parseInt(searchParams.get('page') || '1', 10)
    const urlLimit = parseInt(searchParams.get('limit') || '50', 10)
    const urlType = searchParams.get('type') || 'all'
    const urlStatus = searchParams.get('status') || 'all'
    const urlReferenceId = searchParams.get('referenceId') || ''
    const urlMinAmount = searchParams.get('minAmount') || ''
    const urlMaxAmount = searchParams.get('maxAmount') || ''
    const urlStartDate = searchParams.get('startDate') || ''
    const urlEndDate = searchParams.get('endDate') || ''

    setTransactionsPage(urlPage)
    setTransactionsLimit(urlLimit)
    setTypeFilter(urlType)
    setStatusFilter(urlStatus)
    setReferenceIdFilter(urlReferenceId)
    setMinAmountFilter(urlMinAmount)
    setMaxAmountFilter(urlMaxAmount)
    
    // Convert ISO date to mm/dd/yyyy for display
    const convertDateFromISO = (dateStr: string) => {
      if (!dateStr) return ''
      // Format: yyyy-mm-dd or yyyy-mm-ddTHH:mm:ssZ -> mm/dd/yyyy
      const datePart = dateStr.split('T')[0]
      const parts = datePart.split('-')
      if (parts.length === 3) {
        const [year, month, day] = parts
        return `${month}/${day}/${year}`
      }
      return dateStr
    }
    
    setStartDateFilter(convertDateFromISO(urlStartDate))
    setEndDateFilter(convertDateFromISO(urlEndDate))

    // Convert date from mm/dd/yyyy to ISO 8601 for API
    const convertDateToISO = (dateStr: string) => {
      if (!dateStr) return ''
      // Format: mm/dd/yyyy -> yyyy-mm-dd
      const parts = dateStr.split('/')
      if (parts.length === 3) {
        const [month, day, year] = parts
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00Z`
      }
      return dateStr
    }

    const filters: TransactionFilters = {
      page: urlPage,
      limit: urlLimit,
      ...(urlType && urlType !== 'all' && { type: urlType as TransactionFilters['type'] }),
      ...(urlStatus && urlStatus !== 'all' && { status: urlStatus as TransactionFilters['status'] }),
      ...(urlReferenceId && { referenceId: urlReferenceId }),
      ...(urlMinAmount && { minAmount: parseFloat(urlMinAmount) }),
      ...(urlMaxAmount && { maxAmount: parseFloat(urlMaxAmount) }),
      ...(urlStartDate && { startDate: convertDateToISO(urlStartDate) }),
      ...(urlEndDate && { endDate: convertDateToISO(urlEndDate) }),
    }

    const currentUrl = `page=${urlPage}&limit=${urlLimit}&type=${urlType}&status=${urlStatus}&referenceId=${urlReferenceId}&minAmount=${urlMinAmount}&maxAmount=${urlMaxAmount}&startDate=${urlStartDate}&endDate=${urlEndDate}`

    if (previousUrlRef.current !== currentUrl) {
      previousUrlRef.current = currentUrl
      fetchTransactions(filters)
    }
  }, [searchParams, userId, fetchTransactions])

  const handleTransactionPageChange = (newPage: number) => {
    const params = new URLSearchParams()
    params.set('page', newPage.toString())
    params.set('limit', transactionsLimit.toString())
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (referenceIdFilter) params.set('referenceId', referenceIdFilter)
    if (minAmountFilter) params.set('minAmount', minAmountFilter)
    if (maxAmountFilter) params.set('maxAmount', maxAmountFilter)
    if (startDateFilter) params.set('startDate', startDateFilter)
    if (endDateFilter) params.set('endDate', endDateFilter)

    router.replace(`/balance/users/${userId}/balances?${params.toString()}`, { scroll: false })
  }

  const handleTransactionPageSizeChange = (newLimit: number) => {
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('limit', newLimit.toString())
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (referenceIdFilter) params.set('referenceId', referenceIdFilter)
    if (minAmountFilter) params.set('minAmount', minAmountFilter)
    if (maxAmountFilter) params.set('maxAmount', maxAmountFilter)
    if (startDateFilter) params.set('startDate', startDateFilter)
    if (endDateFilter) params.set('endDate', endDateFilter)

    router.replace(`/balance/users/${userId}/balances?${params.toString()}`, { scroll: false })
  }

  const handleFilterChange = () => {
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('limit', transactionsLimit.toString())
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (referenceIdFilter) params.set('referenceId', referenceIdFilter)
    if (minAmountFilter) params.set('minAmount', minAmountFilter)
    if (maxAmountFilter) params.set('maxAmount', maxAmountFilter)
    if (startDateFilter) params.set('startDate', startDateFilter)
    if (endDateFilter) params.set('endDate', endDateFilter)

    router.replace(`/balance/users/${userId}/balances?${params.toString()}`, { scroll: false })
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Loading user balances...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6 px-6 pb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-destructive mb-4">{error || 'User not found'}</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={fetchUserBalances}>Retry</Button>
                  <Link href="/balance/users">
                    <Button variant="outline">Back to Users</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0)
  const totalFrozen = balances.reduce((sum, b) => sum + b.frozen_balance, 0)
  const totalAvailable = balances.reduce((sum, b) => sum + b.available_balance, 0)
  const totalDeposited = balances.reduce((sum, b) => sum + b.total_deposited, 0)
  const totalWithdrawn = balances.reduce((sum, b) => sum + b.total_withdrawn, 0)

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 px-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/balance/users">
              <Button variant="ghost" size="icon">
                <IconArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <IconCoins className="h-8 w-8 text-primary" />
                User Balances
              </h1>
              <p className="text-muted-foreground">
                Detailed balance information for user
              </p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-semibold">{user.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center gap-2">
                  <IconMail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge variant="outline">{user.role}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={user.is_active ? "default" : "secondary"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-semibold">#{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <div className="flex items-center gap-2">
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-semibold">{formatDate(user.created_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balances</CardTitle>
              <IconCoins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{balances.length}</div>
              <p className="text-xs text-muted-foreground">
                {balances.length === 1 ? 'currency' : 'currencies'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <IconCoins className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalBalance.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Frozen</CardTitle>
              <IconCoins className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {totalFrozen.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <IconCoins className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalAvailable.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Deposited</CardTitle>
              <IconCoins className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {(totalDeposited - totalWithdrawn).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalDeposited.toFixed(2)} - {totalWithdrawn.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Balances Table */}
        <Card>
          <CardHeader>
            <CardTitle>Balance Details</CardTitle>
            <CardDescription>
              Detailed balance information for all currencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {balances.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No balances found for this user</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Frozen</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Total Deposited</TableHead>
                    <TableHead>Total Withdrawn</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balances.map((balance, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconCoins className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{balance.currency.code}</div>
                            <div className="text-xs text-muted-foreground">
                              {balance.currency.name}
                            </div>
                            {balance.currency.is_crypto && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Crypto
                              </Badge>
                            )}
                            {balance.currency.is_virtual && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Virtual
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatBalance(balance.balance, balance.currency.precision)} {balance.currency.symbol}
                      </TableCell>
                      <TableCell>
                        {formatBalance(balance.frozen_balance, balance.currency.precision)} {balance.currency.symbol}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatBalance(balance.available_balance, balance.currency.precision)} {balance.currency.symbol}
                      </TableCell>
                      <TableCell>
                        {formatBalance(balance.total_deposited, balance.currency.precision)} {balance.currency.symbol}
                      </TableCell>
                      <TableCell>
                        {formatBalance(balance.total_withdrawn, balance.currency.precision)} {balance.currency.symbol}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(balance.created_at)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(balance.updated_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              Transaction history with filtering capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 py-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="type" className="text-sm font-medium whitespace-nowrap">
                  Type:
                </Label>
                <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value); handleFilterChange(); }}>
                  <SelectTrigger id="type" className="w-40">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="DEPOSIT">Deposit</SelectItem>
                    <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                    <SelectItem value="PAYMENT">Payment</SelectItem>
                    <SelectItem value="REFUND">Refund</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                    <SelectItem value="CONVERSION">Conversion</SelectItem>
                    <SelectItem value="FEE">Fee</SelectItem>
                    <SelectItem value="BONUS">Bonus</SelectItem>
                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="status" className="text-sm font-medium whitespace-nowrap">
                  Status:
                </Label>
                <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); handleFilterChange(); }}>
                  <SelectTrigger id="status" className="w-40">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="REVERSED">Reversed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="referenceId" className="text-sm font-medium whitespace-nowrap">
                  Reference ID:
                </Label>
                <Input
                  id="referenceId"
                  type="text"
                  placeholder="Filter by reference ID"
                  value={referenceIdFilter}
                  onChange={(e) => setReferenceIdFilter(e.target.value)}
                  onBlur={handleFilterChange}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="minAmount" className="text-sm font-medium whitespace-nowrap">
                  Min Amount:
                </Label>
                <Input
                  id="minAmount"
                  type="text"
                  placeholder="Min"
                  value={minAmountFilter}
                  onChange={(e) => setMinAmountFilter(e.target.value)}
                  onBlur={handleFilterChange}
                  className="w-32"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="maxAmount" className="text-sm font-medium whitespace-nowrap">
                  Max Amount:
                </Label>
                <Input
                  id="maxAmount"
                  type="text"
                  placeholder="Max"
                  value={maxAmountFilter}
                  onChange={(e) => setMaxAmountFilter(e.target.value)}
                  onBlur={handleFilterChange}
                  className="w-32"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="startDate" className="text-sm font-medium whitespace-nowrap">
                  Start Date:
                </Label>
                <Input
                  id="startDate"
                  type="text"
                  placeholder="mm/dd/yyyy"
                  value={startDateFilter}
                  onChange={(e) => {
                    let value = e.target.value
                    // Remove non-numeric characters except /
                    value = value.replace(/[^\d/]/g, '')
                    // Auto-format as user types
                    if (value.length > 2 && !value.includes('/')) {
                      value = value.slice(0, 2) + '/' + value.slice(2)
                    }
                    if (value.length > 5 && value.split('/').length === 2) {
                      value = value.slice(0, 5) + '/' + value.slice(5, 9)
                    }
                    // Limit to mm/dd/yyyy format
                    if (value.length > 10) {
                      value = value.slice(0, 10)
                    }
                    setStartDateFilter(value)
                  }}
                  onBlur={handleFilterChange}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="endDate" className="text-sm font-medium whitespace-nowrap">
                  End Date:
                </Label>
                <Input
                  id="endDate"
                  type="text"
                  placeholder="mm/dd/yyyy"
                  value={endDateFilter}
                  onChange={(e) => {
                    let value = e.target.value
                    // Remove non-numeric characters except /
                    value = value.replace(/[^\d/]/g, '')
                    // Auto-format as user types
                    if (value.length > 2 && !value.includes('/')) {
                      value = value.slice(0, 2) + '/' + value.slice(2)
                    }
                    if (value.length > 5 && value.split('/').length === 2) {
                      value = value.slice(0, 5) + '/' + value.slice(5, 9)
                    }
                    // Limit to mm/dd/yyyy format
                    if (value.length > 10) {
                      value = value.slice(0, 10)
                    }
                    setEndDateFilter(value)
                  }}
                  onBlur={handleFilterChange}
                  className="w-40"
                />
              </div>
            </div>

            {transactionsError ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-4">{transactionsError}</p>
                <Button onClick={() => {
                  // Convert date from mm/dd/yyyy to ISO 8601 for API
                  const convertDateToISO = (dateStr: string) => {
                    if (!dateStr) return ''
                    const parts = dateStr.split('/')
                    if (parts.length === 3) {
                      const [month, day, year] = parts
                      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00Z`
                    }
                    return dateStr
                  }

                  const filters: TransactionFilters = {
                    page: transactionsPage,
                    limit: transactionsLimit,
                    ...(typeFilter !== 'all' && { type: typeFilter as TransactionFilters['type'] }),
                    ...(statusFilter !== 'all' && { status: statusFilter as TransactionFilters['status'] }),
                    ...(referenceIdFilter && { referenceId: referenceIdFilter }),
                    ...(minAmountFilter && { minAmount: parseFloat(minAmountFilter) }),
                    ...(maxAmountFilter && { maxAmount: parseFloat(maxAmountFilter) }),
                    ...(startDateFilter && { startDate: convertDateToISO(startDateFilter) }),
                    ...(endDateFilter && { endDate: convertDateToISO(endDateFilter) }),
                  }
                  fetchTransactions(filters)
                }}>
                  Retry
                </Button>
              </div>
            ) : (
              <TransactionsDataTable
                data={transactions}
                isLoading={transactionsLoading}
                total={transactionsTotal}
                page={transactionsPage}
                limit={transactionsLimit}
                totalPages={transactionsTotalPages}
                onPageChange={handleTransactionPageChange}
                onPageSizeChange={handleTransactionPageSizeChange}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

