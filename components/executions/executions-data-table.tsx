"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  PaginationState,
  FilterFn,
} from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { 
  IconArrowUp, 
  IconArrowDown, 
  IconArrowsUpDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
import { Execution } from "@/interface/Execution"
import { 
  IconCircleCheckFilled, 
  IconCircleXFilled, 
  IconClock, 
  IconPlayerStop,
  IconEye,
  IconExternalLink
} from "@tabler/icons-react"
import Link from "next/link"

// Schema removed as it was only used for type inference

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <IconCircleCheckFilled className="h-4 w-4 text-green-500" />
    case 'error':
      return <IconCircleXFilled className="h-4 w-4 text-red-500" />
    case 'canceled':
      return <IconPlayerStop className="h-4 w-4 text-orange-500" />
    case 'running':
      return <IconClock className="h-4 w-4 text-blue-500 animate-spin" />
    case 'waiting':
      return <IconClock className="h-4 w-4 text-yellow-500" />
    default:
      return <IconClock className="h-4 w-4 text-gray-500" />
  }
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'success':
      return 'default' as const
    case 'error':
      return 'destructive' as const
    case 'canceled':
      return 'secondary' as const
    case 'running':
      return 'outline' as const
    case 'waiting':
      return 'outline' as const
    default:
      return 'outline' as const
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'success':
      return 'Success'
    case 'error':
      return 'Error'
    case 'canceled':
      return 'Canceled'
    case 'running':
      return 'Running'
    case 'waiting':
      return 'Waiting'
    default:
      return status
  }
}

const formatDuration = (duration: number) => {
  if (duration < 1000) {
    return `${duration}ms`
  } else if (duration < 60000) {
    return `${(duration / 1000).toFixed(1)}s`
  } else {
    return `${(duration / 60000).toFixed(1)}m`
  }
}

interface ExecutionsDataTableProps {
  data: Execution[]
  isLoading?: boolean
  onFiltersChange?: (filters: ColumnFiltersState) => void
  total?: number
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export function ExecutionsDataTable({ 
  data, 
  isLoading = false,
  onFiltersChange,
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  onPageSizeChange
}: ExecutionsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: limit,
  })

  // Sync pagination with props
  React.useEffect(() => {
    setPagination({
      pageIndex: page - 1,
      pageSize: limit,
    })
  }, [page, limit])

  const handleFiltersChange = React.useCallback((updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
    const newFilters = typeof updaterOrValue === 'function' ? updaterOrValue(columnFilters) : updaterOrValue;
    setColumnFilters(newFilters)
    
    // Only trigger server-side filter changes for status and mode
    // Workflow search is handled client-side
    const serverSideFilters = newFilters.filter((f) => f.id === 'status' || f.id === 'mode')
    if (onFiltersChange && serverSideFilters.length > 0) {
      onFiltersChange(serverSideFilters)
    } else if (onFiltersChange && newFilters.length === 0) {
      // If all filters cleared, notify parent
      onFiltersChange([])
    }
    // For workflow filter (client-side), just update local state
    
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }, [onFiltersChange, columnFilters])

  const columns: ColumnDef<Execution>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      filterFn: ((row, columnId, filterValue) => {
        const execution = row.original as Execution
        const idString = String(execution.id)
        const searchValue = String(filterValue || '').toLowerCase().trim()
        
        if (!searchValue) return true
        
        return idString.includes(searchValue)
      }) as FilterFn<Execution>,
      enableGlobalFilter: true,
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
        <Link 
          href={`/executions/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {String(row.original.id)}
        </Link>
      ),
    },
    {
      accessorKey: "n8nId",
      filterFn: ((row, columnId, filterValue) => {
        const execution = row.original as Execution
        const n8nIdString = String(execution.n8nId)
        const searchValue = String(filterValue || '').toLowerCase().trim()
        
        if (!searchValue) return true
        
        return n8nIdString.toLowerCase().includes(searchValue)
      }) as FilterFn<Execution>,
      enableGlobalFilter: true,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            n8n ID
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
        <Link 
          href={`/executions/${row.original.id}`}
          className="font-mono text-sm text-primary hover:underline"
        >
          {row.original.n8nId}
        </Link>
      ),
    },
    {
      id: "workflow",
      accessorFn: (row) => {
        return row.workflow?.name || row.workflowName || 'Unknown'
      },
      filterFn: ((row, columnId, filterValue) => {
        const execution = row.original as Execution
        const workflowName = String(execution.workflow?.name || execution.workflowName || 'Unknown')
        const searchValue = String(filterValue || '').toLowerCase().trim()
        
        if (!searchValue) return true
        
        return workflowName.toLowerCase().includes(searchValue)
      }) as FilterFn<Execution>,
      enableGlobalFilter: true,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Workflow
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
        const workflowName = row.original.workflow?.name || row.original.workflowName || 'Unknown';
        const workflowId = row.original.workflow?.id;
        
        if (workflowId) {
          return (
            <Link 
              href={`/workflows/${workflowId}`}
              className="font-medium text-primary hover:underline"
            >
              {workflowName}
            </Link>
          );
        }
        
        return (
          <div className="font-medium">
            {workflowName}
          </div>
        );
      },
    },
    {
      id: "instance",
      accessorFn: (row) => row.instance?.name || 'Unknown',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Instance
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
        <div className="text-sm">{row.original.instance?.name || 'Unknown'}</div>
      ),
    },
    {
      accessorKey: "mode",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Mode
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
        <Badge variant="outline" className="text-xs">
          {row.original.mode}
        </Badge>
      ),
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
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.original.status)}
          <Badge variant={getStatusBadgeVariant(row.original.status)}>
            {getStatusText(row.original.status)}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Duration
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
        <div className="text-sm font-mono">
          {formatDuration(row.original.duration)}
        </div>
      ),
    },
    {
      accessorKey: "startedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Started At
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
        <div className="text-sm">
          {new Date(row.original.startedAt).toLocaleString('uk-UA')}
        </div>
      ),
    },
    {
      accessorKey: "priceUsd",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Price
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
        <div className="font-semibold text-green-600">
          ${row.original.priceUsd || '0.00'}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const execution = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(String(execution.id))}
              >
                Copy execution ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/executions/${execution.id}`}>
                  <IconEye className="mr-2 h-4 w-4" />
                  View details
                </Link>
              </DropdownMenuItem>
              {execution.instance?.apiUrl && (
                <DropdownMenuItem asChild>
                  <Link 
                    href={`${execution.instance.apiUrl}/execution/${execution.n8nId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconExternalLink className="mr-2 h-4 w-4" />
                    Open in n8n
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: handleFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const execution = row.original as Execution
      const searchValue = String(filterValue || '').toLowerCase().trim()
      
      if (!searchValue) return true
      
      // Search in ID
      if (String(execution.id).includes(searchValue)) return true
      
      // Search in n8n ID
      if (execution.n8nId.toLowerCase().includes(searchValue)) return true
      
      // Search in workflow name
      const workflowName = String(execution.workflow?.name || execution.workflowName || 'Unknown')
      if (workflowName.toLowerCase().includes(searchValue)) return true
      
      return false
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const newState = typeof updater === 'function' ? updater(pagination) : updater
      setPagination(newState)
      
      // Call parent pagination handlers
      if (onPageChange && newState.pageIndex !== pagination.pageIndex) {
        onPageChange(newState.pageIndex + 1)
      }
      if (onPageSizeChange && newState.pageSize !== pagination.pageSize) {
        onPageSizeChange(newState.pageSize)
      }
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },
    pageCount: Math.ceil(total / limit),
    manualPagination: true,
    manualFiltering: false, // Enable client-side filtering for workflow search
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search by ID, n8n ID, or workflow name..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading executions...</span>
                  </div>
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No executions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-4 lg:w-fit">
          <div className="flex items-center gap-2">
            <Label htmlFor="rows-per-page" className="text-sm font-medium hidden lg:block">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger id="rows-per-page" className="h-8 w-[70px]">
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
          <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronsLeft className="h-4 w-4" />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          
          {/* Page number buttons */}
          {(() => {
            const pageCount = table.getPageCount()
            const currentPage = table.getState().pagination.pageIndex + 1
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
                  onClick={() => table.setPageIndex((page as number) - 1)}
                  disabled={isLoading}
                >
                  {page}
                </Button>
              )
            ))
          })()}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronsRight className="h-4 w-4" />
            <span className="sr-only">Last page</span>
          </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
