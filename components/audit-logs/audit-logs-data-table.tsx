"use client"

import * as React from "react"
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table"
import {
  IconArrowUp,
  IconArrowDown,
  IconArrowsUpDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconEye,
  IconDotsVertical,
  IconUser,
  IconShield,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AuditLog } from "@/interface/AuditLog"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs } from "@/components/ui/tabs"
import { getUserInfoFromLog } from "@/components/audit-logs/utils"

interface AuditLogsDataTableProps {
  data: AuditLog[]
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  isLoading?: boolean
  onViewDetails?: (log: AuditLog) => void
  hideUserId?: boolean
}

export function AuditLogsDataTable({
  data,
  total,
  page,
  limit,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  onViewDetails,
  hideUserId = false,
}: AuditLogsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'createdAt', desc: true }
  ])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: limit,
  })

  // Sync pagination when external page/limit change
  React.useEffect(() => {
    setPagination({
      pageIndex: page - 1,
      pageSize: limit,
    })
  }, [page, limit])

  const handlePaginationChange = React.useCallback((updater: ((old: PaginationState) => PaginationState) | PaginationState) => {
    const newPagination = typeof updater === 'function' 
      ? updater(pagination) 
      : updater

    setPagination(newPagination)

    const newPage = newPagination.pageIndex + 1
    const newPageSize = newPagination.pageSize

    if (newPage !== page) {
      onPageChange(newPage)
    }
    if (newPageSize !== limit) {
      onPageSizeChange(newPageSize)
    }
  }, [pagination, page, limit, onPageChange, onPageSizeChange])

  const columns: ColumnDef<AuditLog>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
        <div className="w-20 font-medium">
          {row.original.id}
        </div>
      ),
    },
    ...(hideUserId ? [] : [{
      accessorKey: "userEmail",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            User
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
        const log = row.original
        const userInfo = getUserInfoFromLog(log);
        const displayName = userInfo.name || userInfo.email || 'Unknown';
        const userRole = userInfo.role || log.userRole;
        const userId = userInfo.id || log.userId;
        
        return (
          <div className="flex items-center gap-2 w-48">
            {userRole === 'admin' ? (
              <IconShield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <IconUser className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                {userId ? (
                  <Link
                    href={`/users/${userId}`}
                    className="text-sm text-primary hover:underline truncate"
                  >
                    {displayName}
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground truncate">
                    {displayName}
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>{displayName}</p>
                {userInfo.email && <p className="text-xs">{userInfo.email}</p>}
                {userRole && <p className="text-xs">Role: {userRole}</p>}
              </TooltipContent>
            </Tooltip>
          </div>
        )
      },
    } as ColumnDef<AuditLog>]),
    {
      accessorKey: "actionType",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Action Type
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
        <div className="w-32">
          <Badge variant="outline" className="text-xs">
            {row.original.actionType}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "actionCategory",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Category
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
        <div className="w-32">
          <Badge variant="secondary" className="text-xs">
            {row.original.actionCategory}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "entityType",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Entity Type
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
        <div className="w-32 text-sm">
          {row.original.entityType}
        </div>
      ),
    },
    {
      accessorKey: "entityId",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Entity ID
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
        <div className="w-24 text-sm font-mono">
          {row.original.entityId}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.original.description || 'N/A'
        const maxLength = 80
        const truncated = description.length > maxLength 
          ? description.substring(0, maxLength) + '...' 
          : description

        return (
          <div className="w-96 min-w-[300px]">
            {description.length > maxLength ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm text-muted-foreground truncate cursor-help">
                    {truncated}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="text-sm text-muted-foreground">{description}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => (
        <div className="w-48 min-w-[150px] text-sm font-mono">
          {row.original.ipAddress}
        </div>
      ),
    },
    {
      accessorKey: "success",
      header: "Status",
      cell: ({ row }) => {
        const isSuccess = row.original.success
        return (
          <div className="flex items-center gap-2">
            {isSuccess ? (
              <IconCircleCheckFilled className="h-4 w-4 text-green-500" />
            ) : (
              <IconCircleXFilled className="h-4 w-4 text-red-500" />
            )}
            <Badge variant={isSuccess ? "default" : "destructive"} className="text-xs">
              {isSuccess ? "Success" : "Failed"}
            </Badge>
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
            Created At
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
        <div className="w-40 text-sm">
          {new Date(row.original.createdAt).toLocaleDateString('en-US')}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const log = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  if (onViewDetails) {
                    onViewDetails(log)
                  }
                }}
              >
                <IconEye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              {(() => {
                const userInfo = getUserInfoFromLog(log);
                const userId = userInfo.id;
                return userId ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/users/${userId}`}>
                        View user
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : null;
              })()}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: total > 0 && limit > 0 ? Math.ceil(total / limit) : 1,
    manualPagination: true,
  })

  return (
    <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
      <div className="overflow-x-auto rounded-lg border">
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
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    <span className="ml-2">Loading audit logs...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No audit logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of {" "}
          {table.getFilteredRowModel().rows.length} rows selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage() || isLoading}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || isLoading}
            >
              <span className="sr-only">Previous page</span>
              <IconChevronLeft className="h-4 w-4" />
            </Button>

            {(() => {
              const pageCount = table.getPageCount()
              const currentPage = table.getState().pagination.pageIndex + 1
              const maxVisible = 7
              const pages: (number | string)[] = []

              if (pageCount <= maxVisible) {
                for (let i = 1; i <= pageCount; i++) {
                  pages.push(i)
                }
              } else {
                if (currentPage <= 3) {
                  for (let i = 1; i <= 5; i++) {
                    pages.push(i)
                  }
                  pages.push('...')
                  pages.push(pageCount)
                } else if (currentPage >= pageCount - 2) {
                  pages.push(1)
                  pages.push('...')
                  for (let i = pageCount - 4; i <= pageCount; i++) {
                    pages.push(i)
                  }
                } else {
                  pages.push(1)
                  pages.push('...')
                  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                  }
                  pages.push('...')
                  pages.push(pageCount)
                }
              }

              return pages.map((pageNumber, idx) => (
                pageNumber === '...'
                  ? (
                    <span key={`ellipsis-${idx}`} className="px-2">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => table.setPageIndex((pageNumber as number) - 1)}
                      disabled={isLoading}
                    >
                      {pageNumber}
                    </Button>
                  )
              ))
            })()}

            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || isLoading}
            >
              <span className="sr-only">Next page</span>
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage() || isLoading}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Tabs>
  )
}

