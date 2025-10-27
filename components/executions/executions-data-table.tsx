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
  useReactTable,
  PaginationState,
} from "@tanstack/react-table"
import { ChevronDown, MoreHorizontal } from "lucide-react"
import { IconArrowUp, IconArrowDown, IconArrowsUpDown } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
}

export function ExecutionsDataTable({ 
  data, 
  isLoading = false,
  onFiltersChange 
}: ExecutionsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  })

  const handleFiltersChange = React.useCallback((updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
    const newFilters = typeof updaterOrValue === 'function' ? updaterOrValue(columnFilters) : updaterOrValue;
    setColumnFilters(newFilters)
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
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
      accessorFn: (row) => row.workflow?.name || row.workflowName || 'Unknown',
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
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    manualFiltering: true,
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by workflow name..."
          value={(table.getColumn("workflow")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("workflow")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
