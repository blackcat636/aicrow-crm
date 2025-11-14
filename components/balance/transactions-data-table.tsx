"use client"

import * as React from "react"
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconArrowsUpDown,
  IconArrowUp,
  IconArrowDown,
  IconCoins,
  IconCalendar,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Transaction } from "@/interface/Balance"

const formatAmount = (amount: string) => {
  const num = parseFloat(amount)
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  }).format(num)
}

const formatBalance = (amount: string) => {
  // Balance values come in smallest units (cents), need to divide by 100
  const num = parseFloat(amount) / 100
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

const getTypeBadgeVariant = (type?: string) => {
  switch (type) {
    case 'DEPOSIT':
    case 'BONUS':
      return 'default' as const
    case 'WITHDRAWAL':
    case 'PAYMENT':
    case 'FEE':
      return 'destructive' as const
    case 'REFUND':
    case 'ADJUSTMENT':
      return 'secondary' as const
    default:
      return 'outline' as const
  }
}

const getStatusBadgeVariant = (status?: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'default' as const
    case 'FAILED':
    case 'CANCELLED':
      return 'destructive' as const
    case 'PENDING':
      return 'secondary' as const
    case 'REVERSED':
      return 'outline' as const
    default:
      return 'outline' as const
  }
}

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          ID
          {column.getIsSorted() === "asc" ? (
            <IconArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <IconArrowsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="w-20 font-medium">{row.original.id}</div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Type
          {column.getIsSorted() === "asc" ? (
            <IconArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <IconArrowsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const type = row.original.type || row.original.transactionType
      return (
        <Badge variant={getTypeBadgeVariant(type)}>
          {type}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Status
          {column.getIsSorted() === "asc" ? (
            <IconArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <IconArrowsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.original.status
      return status ? (
        <Badge variant={getStatusBadgeVariant(status)}>
          {status}
        </Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: "currency",
    header: "Currency",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconCoins className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.currency}</span>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Amount
          {column.getIsSorted() === "asc" ? (
            <IconArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <IconArrowsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.original.amount)
      const isNegative = amount < 0
      return (
        <div className={`font-medium ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
          {isNegative ? '-' : '+'}{formatAmount(Math.abs(amount).toString())} {row.original.currency}
        </div>
      )
    },
  },
  {
    accessorKey: "balanceBefore",
    header: "Balance Before",
    cell: ({ row }) => {
      const balanceBefore = row.original.balanceBefore || row.original.balance_before || '0'
      return (
        <div className="text-muted-foreground">
          {formatBalance(balanceBefore)} {row.original.currency}
        </div>
      )
    },
  },
  {
    accessorKey: "balanceAfter",
    header: "Balance After",
    cell: ({ row }) => {
      const balanceAfter = row.original.balanceAfter || row.original.balance_after || '0'
      return (
        <div className="font-medium">
          {formatBalance(balanceAfter)} {row.original.currency}
        </div>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.original.description}>
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "referenceId",
    header: "Reference ID",
    cell: ({ row }) => {
      const referenceId = row.original.referenceId || row.original.reference_id
      return (
        <div className="max-w-[150px] truncate text-muted-foreground" title={referenceId}>
          {referenceId || '-'}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          <IconCalendar className="mr-2 h-4 w-4" />
          Created
          {column.getIsSorted() === "asc" ? (
            <IconArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <IconArrowsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const createdAt = row.original.createdAt || row.original.created_at
      if (!createdAt) return <span className="text-muted-foreground">-</span>
      const date = new Date(createdAt)
      return (
        <div className="text-sm">
          {date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )
    },
  },
]

interface TransactionsDataTableProps {
  data: Transaction[]
  isLoading?: boolean
  total?: number
  page?: number
  limit?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export function TransactionsDataTable({
  data,
  isLoading = false,
  total = 0,
  page = 1,
  limit = 50,
  totalPages: propTotalPages,
  onPageChange,
  onPageSizeChange,
}: TransactionsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({
    pageIndex: page - 1,
    pageSize: limit,
  })

  React.useEffect(() => {
    setPagination({
      pageIndex: page - 1,
      pageSize: limit,
    })
  }, [page, limit])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: total > 0 && limit > 0 ? Math.ceil(total / limit) : 1,
    manualPagination: true,
  })

  React.useEffect(() => {
    const newPage = pagination.pageIndex + 1
    const newPageSize = pagination.pageSize

    if (newPage !== page && onPageChange) {
      onPageChange(newPage)
    }
    if (newPageSize !== limit && onPageSizeChange) {
      onPageSizeChange(newPageSize)
    }
  }, [pagination, page, limit, onPageChange, onPageSizeChange])

  const totalPages = propTotalPages ?? (total > 0 && limit > 0 ? Math.ceil(total / limit) : 1)

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Rows per page:</p>
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                if (onPageSizeChange) {
                  onPageSizeChange(parseInt(value, 10))
                }
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={limit.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onPageChange) {
                onPageChange(1)
              }
            }}
            disabled={page === 1}
          >
            <IconChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onPageChange && page > 1) {
                onPageChange(page - 1)
              }
            }}
            disabled={page === 1}
          >
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (onPageChange) {
                      onPageChange(pageNum)
                    }
                  }}
                  className="h-8 w-8"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onPageChange && page < totalPages) {
                onPageChange(page + 1)
              }
            }}
            disabled={page >= totalPages}
          >
            <IconChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onPageChange) {
                onPageChange(totalPages)
              }
            }}
            disabled={page >= totalPages}
          >
            <IconChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

