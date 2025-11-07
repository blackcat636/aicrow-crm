"use client"

import * as React from "react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconArrowsUpDown,
  IconArrowUp,
  IconArrowDown,
  IconSettings,
  IconCalendar,
  IconEdit,
  IconTrash,
  IconToggleLeft,
  IconToggleRight,
} from "@tabler/icons-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Tabs } from "@/components/ui/tabs"
import { UserWorkflow } from "@/interface/UserWorkflow"
import Link from "next/link"
import { useUserWorkflowsStore } from "@/store/useUserWorkflowsStore"
import { toast } from "sonner"

interface UserWorkflowsDataTableProps {
  data: UserWorkflow[]
  total: number
  page: number
  limit: number
  userId: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onFiltersChange?: (filters: ColumnFiltersState) => void
  isLoading?: boolean
}

const createColumns = (
  userId: number,
  onToggle: (id: number) => void,
  onDelete: (id: number) => void
): ColumnDef<UserWorkflow>[] => [
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
        <Link href={`/users/${userId}/workflows/${row.original.id}`}>
          <span className="font-medium text-primary hover:underline cursor-pointer">
            {String(row.original.id)}
          </span>
        </Link>
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
      <div className="w-48 flex items-center gap-2 min-w-0 overflow-hidden">
        <IconSettings className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <Link href={`/users/${userId}/workflows/${row.original.id}`} className="min-w-0 flex-1">
          <span className="font-medium hover:underline cursor-pointer truncate block">
            {row.original.name || 'Unknown'}
          </span>
        </Link>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "isActive",
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
          variant={row.original.isActive ? "default" : "outline"} 
          className="text-muted-foreground px-1.5 cursor-pointer"
          onClick={() => onToggle(row.original.id)}
        >
          {row.original.isActive ? (
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 mr-1 h-3 w-3" />
          ) : (
            <IconCircleCheckFilled className="fill-red-500 dark:fill-red-400 mr-1 h-3 w-3" />
          )}
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
    ),
  },
  {
    id: "workflow",
    accessorFn: (row) => row.workflow?.name || 'Unknown',
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
    cell: ({ row }) => (
      <div className="w-48 flex items-center gap-2 min-w-0 overflow-hidden">
        <IconSettings className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground truncate min-w-0">
          {row.original.workflow?.name || 'Unknown'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "scheduleType",
    header: "Schedule",
    cell: ({ row }) => (
      <div className="w-24">
        {row.original.scheduleType ? (
          <Badge variant="outline" className="text-xs">
            {row.original.scheduleType}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">Manual</span>
        )}
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
        <span className="text-sm text-muted-foreground">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString('uk-UA') : 'Unknown'}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem asChild>
            <Link href={`/users/${userId}/workflows/${row.original.id}`}>
              <IconEdit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onToggle(row.original.id)}>
            {row.original.isActive ? (
              <>
                <IconToggleLeft className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <IconToggleRight className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            variant="destructive"
            onClick={() => onDelete(row.original.id)}
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
  },
]

export function UserWorkflowsDataTable({
  data: initialData,
  total,
  page,
  limit,
  userId,
  onPageChange,
  onPageSizeChange,
  onFiltersChange,
  isLoading = false,
}: UserWorkflowsDataTableProps) {
  const { toggleWorkflow, deleteWorkflow } = useUserWorkflowsStore()
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: page - 1,
    pageSize: limit,
  })
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [deletingWorkflowId, setDeletingWorkflowId] = React.useState<number | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Handle toggle workflow
  const handleToggle = React.useCallback(async (id: number) => {
    try {
      const success = await toggleWorkflow(id)
      if (success) {
        // Update local state - toggle isActive
        setData(prevData => 
          prevData.map(w => 
            w.id === id ? { ...w, isActive: !w.isActive } : w
          )
        )
        toast.success('Workflow status toggled successfully')
      } else {
        toast.error('Failed to toggle workflow status')
      }
    } catch (error) {
      console.error('Error toggling workflow status:', error)
      toast.error('Error toggling workflow status')
    }
  }, [toggleWorkflow])

  // Handle delete workflow - open dialog
  const handleDelete = React.useCallback((id: number) => {
    setDeletingWorkflowId(id)
    // Small delay to ensure DropdownMenu closes properly before opening AlertDialog
    setTimeout(() => {
      setShowDeleteDialog(true)
    }, 100)
  }, [])

  // Confirm delete workflow
  const handleDeleteConfirm = async () => {
    if (!deletingWorkflowId) return
    
    setIsDeleting(true)
    try {
      const success = await deleteWorkflow(deletingWorkflowId)
      if (success) {
        // Update local state - remove deleted workflow
        setData(prevData => prevData.filter(w => w.id !== deletingWorkflowId))
        toast.success('Workflow deleted successfully')
      } else {
        toast.error('Failed to delete workflow')
      }
    } catch (error) {
      console.error('Error deleting workflow:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeletingWorkflowId(null)
    }
  }

  // Handle dialog close
  const handleDialogClose = React.useCallback((open: boolean) => {
    if (!open && !isDeleting) {
      setShowDeleteDialog(false)
      setDeletingWorkflowId(null)
    }
  }, [isDeleting])
  
  // Handle cancel button
  const handleCancel = React.useCallback(() => {
    setShowDeleteDialog(false)
    setDeletingWorkflowId(null)
  }, [])

  const columns = React.useMemo(
    () => createColumns(userId, handleToggle, handleDelete),
    [userId, handleToggle, handleDelete]
  )

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

  // Handle pagination changes
  const handlePaginationChange = React.useCallback(
    (updater: ((old: typeof pagination) => typeof pagination) | typeof pagination) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater
      
      setPagination(newPagination)
      
      const newPage = newPagination.pageIndex + 1
      const newPageSize = newPagination.pageSize
      
      if (newPage !== page) {
        onPageChange(newPage)
      }
      if (newPageSize !== limit) {
        onPageSizeChange(newPageSize)
      }
    },
    [pagination, page, limit, onPageChange, onPageSizeChange]
  )

  // Handle filter changes
  const handleFiltersChange = React.useCallback(
    (updater: ((old: ColumnFiltersState) => ColumnFiltersState) | ColumnFiltersState) => {
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater
      setColumnFilters(newFilters)
      
      if (onFiltersChange) {
        onFiltersChange(newFilters)
      }
      
      if (page !== 1) {
        onPageChange(1)
      }
    },
    [columnFilters, onFiltersChange, page, onPageChange]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: handleFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: Math.ceil(total / limit),
    manualPagination: true,
    manualFiltering: true,
  })

  return (
    <>
    <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
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
                  {isLoading ? 'Loading...' : 'No user workflows found.'}
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
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                const pageSize = Number(value)
                // Ensure page size doesn't exceed API limit of 100
                const validPageSize = Math.min(pageSize, 100)
                table.setPageSize(validPageSize)
                if (onPageSizeChange) {
                  onPageSizeChange(validPageSize)
                }
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
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
            Page {table.getState().pagination.pageIndex + 1} of{" "}
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
    
    {/* Delete Confirmation Dialog - moved outside Tabs */}
    <AlertDialog 
      open={showDeleteDialog} 
      onOpenChange={handleDialogClose}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the workflow
            {deletingWorkflowId && (
              <>
                {' '}<span className="font-semibold">
                  &quot;{data.find(w => w.id === deletingWorkflowId)?.workflow?.name || 'Unknown'}&quot;
                </span>
              </>
            )}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  )
}

