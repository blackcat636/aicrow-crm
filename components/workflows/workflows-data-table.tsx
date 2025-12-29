"use client"

import * as React from "react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconArrowsUpDown,
  IconArrowUp,
  IconArrowDown,
  IconSettings,
  IconServer,
  IconActivity,
  IconCalendar,
} from "@tabler/icons-react"
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
} from "@tanstack/react-table"
import { z } from "zod"

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
  Tabs,
} from "@/components/ui/tabs"
import { Workflow } from "@/interface/Workflow"
import Link from "next/link"

export const schema = z.object({
  id: z.number(),
  name: z.string(),
  displayName: z.string().optional(),
  displayDescription: z.string().optional(),
  availableToUsers: z.boolean().optional(),
  priceUsd: z.number().optional(),
  active: z.boolean(),
  nodes: z.number(),
  connections: z.number(),
  instance: z.object({
    name: z.string(),
  }),
  createdAt: z.string(),
})

const columns: ColumnDef<Workflow>[] = [
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
      <div className="w-20">
        <Link href={`/workflows/${row.original.id}`} className="font-medium text-primary hover:underline">
          {String(row.original.id)}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "n8nId",
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
      <div className="w-32">
        <span className="text-sm font-medium text-foreground">
          {row.original.n8nId || 'N/A'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Name
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
      <div className="w-48 flex items-center gap-2">
        <IconSettings className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="font-medium text-foreground truncate">{row.original.displayName || row.original.name || 'Unknown'}</span>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "active",
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
      <div className="w-32">
        <Badge 
          variant={row.original.active ? "default" : "outline"} 
          className={row.original.active ? "px-1.5 text-white" : "px-1.5 text-foreground"}
        >
          {row.original.active ? (
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 mr-1 h-3 w-3" />
          ) : (
            <IconCircleCheckFilled className="fill-red-500 dark:fill-red-400 mr-1 h-3 w-3" />
          )}
          {row.original.active ? "Active" : "Inactive"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "availableToUsers",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Available to Users
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
        <Badge 
          variant={row.original.availableToUsers ? "default" : "outline"} 
          className={row.original.availableToUsers ? "px-1.5 text-white" : "px-1.5 text-foreground"}
        >
          {row.original.availableToUsers ? (
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 mr-1 h-3 w-3" />
          ) : (
            <IconCircleCheckFilled className="fill-red-500 dark:fill-red-400 mr-1 h-3 w-3" />
          )}
          {row.original.availableToUsers ? "Yes" : "No"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "show",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Show
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
      const showValue = row.original.show;
      // Handle number: 1 = true, 0 = false
      // Also handle boolean/string for backward compatibility
      const isTrue = showValue === 1 || showValue === true || (typeof showValue === 'string' && (showValue === 'true' || showValue === '1'));
      return (
        <div className="w-32">
          <Badge 
            variant={isTrue ? "default" : "outline"} 
            className={isTrue ? "px-1.5 text-white" : "px-1.5 text-foreground"}
          >
            {isTrue ? (
              <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 mr-1 h-3 w-3" />
            ) : (
              <IconCircleCheckFilled className="fill-red-500 dark:fill-red-400 mr-1 h-3 w-3" />
            )}
            {isTrue ? "True" : "False"}
          </Badge>
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
      <div className="w-48 flex items-center gap-2">
        <IconServer className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-foreground">
          {row.original.instance?.name || 'Unknown'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "nodes",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Nodes
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
      <div className="w-24 flex items-center gap-2">
        <IconActivity className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-foreground">{String(row.original.nodes)}</span>
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
      <div className="w-24">
        <span className="text-sm font-medium text-foreground">
          {row.original.priceUsd ? `$${row.original.priceUsd}` : 'Free'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "connections",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Connections
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
      <div className="w-24">
        <span className="text-sm text-foreground">{String(row.original.connections)}</span>
      </div>
    ),
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
    cell: ({ row }) => (
      <div className="w-32 flex items-center gap-2">
        <IconCalendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-foreground">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString('uk-UA') : 'Unknown'}
        </span>
      </div>
    ),
  },
  {
    id: "executions",
    header: "Executions",
    cell: ({ row }) => (
      <div className="w-48 min-w-[200px]">
        <span className="text-sm truncate block" title={row.original.name || 'Unknown'}>
          {row.original.displayName || row.original.name || 'Unknown'}
        </span>
      </div>
    ),
    enableSorting: false,
  },
  // {
  //   id: "actions",
  //   cell: () => (
  //     <DropdownMenu>
  //       <DropdownMenuTrigger asChild>
  //         <Button
  //           variant="ghost"
  //           className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
  //           size="icon"
  //         >
  //           <IconDotsVertical />
  //           <span className="sr-only">Open menu</span>
  //         </Button>
  //       </DropdownMenuTrigger>
  //       <DropdownMenuContent align="end" className="w-32">
  //         <DropdownMenuItem>Edit</DropdownMenuItem>
  //         <DropdownMenuItem>Copy</DropdownMenuItem>
  //         <DropdownMenuItem>Execute</DropdownMenuItem>
  //         <DropdownMenuSeparator />
  //         <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
  //       </DropdownMenuContent>
  //     </DropdownMenu>
  //   ),
  //   enableSorting: false,
  // },
]


export function WorkflowsDataTable({
  data: initialData,
  total,
  page,
  limit,
  onPageChange,
  onPageSizeChange,
  onFiltersChange,
  isLoading = false,
}: {
  data: Workflow[]
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onFiltersChange?: (filters: ColumnFiltersState) => void
  isLoading?: boolean
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: page - 1, // API uses 1-based pagination, but table is 0-based
    pageSize: limit,
  })

  // Synchronize local pagination with API pagination
  React.useEffect(() => {
    setPagination({
      pageIndex: page - 1,
      pageSize: limit,
    })
  }, [page, limit])

  // Update data when initialData changes
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Reset pagination to first page when search changes
  React.useEffect(() => {
    if (pagination.pageIndex !== 0) {
      setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }
  }, [globalFilter, pagination.pageIndex])

  // Handle pagination changes
  const handlePaginationChange = React.useCallback((updater: ((old: typeof pagination) => typeof pagination) | typeof pagination) => {
    const newPagination = typeof updater === 'function' 
      ? updater(pagination) 
      : updater
    
    setPagination(newPagination)
    
    // Only call API callbacks when not searching (server-side pagination)
    if (!globalFilter) {
      const newPage = newPagination.pageIndex + 1
      const newPageSize = newPagination.pageSize
      
      if (newPage !== page) {
        onPageChange(newPage)
      }
      if (newPageSize !== limit) {
        onPageSizeChange(newPageSize)
      }
    }
  }, [pagination, page, limit, onPageChange, onPageSizeChange, globalFilter])

  // Handle filter changes
  const handleFiltersChange = React.useCallback((updater: ((old: ColumnFiltersState) => ColumnFiltersState) | ColumnFiltersState) => {
    const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater
    setColumnFilters(newFilters)
    
    // Call callback to trigger server-side filtering
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
    
    // Reset to first page when filtering
    if (page !== 1) {
      onPageChange(1)
    }
  }, [columnFilters, onFiltersChange, page, onPageChange])

  // Calculate filtered data count for pagination
  const filteredDataCount = React.useMemo(() => {
    if (!globalFilter) return data.length
    
    const searchValue = globalFilter.toLowerCase().trim()
    if (!searchValue) return data.length
    
    return data.filter((workflow) => {
      // Search in ID
      if (String(workflow.id).includes(searchValue)) return true
      
      // Search in name
      const name = String(workflow.displayName || workflow.name || 'Unknown').toLowerCase()
      if (name.includes(searchValue)) return true
      
      return false
    }).length
  }, [data, globalFilter])

  const isAllSelected = limit >= total && total > 0

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: handleFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const workflow = row.original as Workflow
      const searchValue = String(filterValue || '').toLowerCase().trim()
      
      if (!searchValue) return true
      
      // Search in ID
      if (String(workflow.id).includes(searchValue)) return true
      
      // Search in name
      const name = String(workflow.displayName || workflow.name || 'Unknown').toLowerCase()
      if (name.includes(searchValue)) return true
      
      return false
    },
    pageCount: globalFilter 
      ? Math.ceil(filteredDataCount / pagination.pageSize) 
      : isAllSelected
      ? 1 // When "All" is selected, show only one page
      : Math.ceil(total / limit), // Use total count from API when no search
    manualPagination: !globalFilter && !isAllSelected, // Use client-side pagination when searching or when "All" is selected
    manualFiltering: false, // Enable client-side filtering for search
  })

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
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
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} rows selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="flex items-center gap-2">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={isAllSelected ? 'all' : `${limit}`}
                onValueChange={(value) => {
                  const pageSize = Number(value)
                  // Ensure page size doesn't exceed API limit of 100
                  const validPageSize = Math.min(pageSize, 100)
                  onPageSizeChange(validPageSize)
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={isAllSelected ? 'All' : limit}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {page} of{" "}
              {Math.ceil(total / limit)}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => onPageChange(1)}
                disabled={page <= 1 || isLoading}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || isLoading}
              >
                <span className="sr-only">Previous page</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Page number buttons */}
              {(() => {
                const pageCount = Math.ceil(total / limit)
                const currentPage = page // Use page from props instead of table state
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
                      onClick={() => onPageChange(page as number)}
                      disabled={isLoading}
                    >
                      {page}
                    </Button>
                  )
                ))
              })()}
              
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= Math.ceil(total / limit) || isLoading}
              >
                <span className="sr-only">Next page</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => onPageChange(Math.ceil(total / limit))}
                disabled={page >= Math.ceil(total / limit) || isLoading}
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
