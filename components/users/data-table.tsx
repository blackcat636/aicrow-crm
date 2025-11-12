"use client"

import * as React from "react"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconGripVertical,
  IconArrowsUpDown,
  IconArrowUp,
  IconArrowDown,
  IconMail,
  IconPhone,
  IconUser,
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconToggleLeft,
  IconToggleRight,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { User } from "@/interface/User"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  deleteUser,
  updateUserStatus,
} from "@/lib/api/users"
import { useUsersStore } from "@/store/useUsersStore"
import { useState } from "react"
import { IconAlertTriangle } from "@tabler/icons-react"
import { toast } from "sonner"

// User Actions Component
function UserActions({ user }: { user: User }) {
  const router = useRouter();
  const { fetchUsers, page, limit } = useUsersStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleView = () => {
    router.push(`/users/${user.id}`);
  };

  const handleEdit = () => {
    router.push(`/users/${user.id}?edit=true`);
  };

  const handleDeleteClick = () => {
    setDropdownOpen(false);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      setShowDeleteDialog(false);
      await deleteUser(user.id);
      // Small delay to ensure dialog closes before refreshing
      setTimeout(async () => {
        await fetchUsers(page, limit);
        toast.success('User deleted successfully');
      }, 100);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };




  const handleToggleStatus = async () => {
    setDropdownOpen(false);
    try {
      setIsLoading(true);
      await updateUserStatus(user.id, !(user.isActive !== false));
      await fetchUsers(page, limit);
      toast.success(`User ${user.isActive !== false ? 'blocked' : 'activated'} successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user status');
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = user.isActive !== false; // Default to true if not specified

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
            disabled={isLoading}
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleView}>
            <IconEye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <IconEdit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleToggleStatus}>
            {isActive ? (
              <>
                <IconToggleLeft className="mr-2 h-4 w-4" />
                Block User
              </>
            ) : (
              <>
                <IconToggleRight className="mr-2 h-4 w-4" />
                Activate User
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleDeleteClick}
            className="text-red-600 focus:text-red-600"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <IconAlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-center">
              Delete User?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              This action cannot be undone. This will permanently delete the user
              <span className="block mt-2 font-medium text-foreground">
                &quot;{user.username || user.email}&quot;
              </span>
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isLoading} className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isLoading}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
}

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
})

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const columns: ColumnDef<User>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
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
      <div className="w-32">
        <Link href={`/users/${row.original.id}`} className="text-blue-500 hover:text-blue-600">
          {row.original.id}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "username",
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
      const username = row.original.username || '';
      const maxLength = 20; // Maximum characters before truncation
      const truncated = username.length > maxLength 
        ? username.substring(0, maxLength) + '...' 
        : username;

      return (
        <div className="w-32 flex items-center gap-2">
          <IconUser className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {username.length > maxLength ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-medium truncate cursor-help">{truncated}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{username}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="font-medium">{username || 'N/A'}</span>
          )}
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Email
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
      const email = row.original.email || '';
      const maxLength = 25; // Maximum characters before truncation
      const truncated = email.length > maxLength 
        ? email.substring(0, maxLength) + '...' 
        : email;

      return (
        <div className="w-48 flex items-center gap-2">
          <IconMail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {email.length > maxLength ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm text-muted-foreground truncate cursor-help">{truncated}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{email}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-sm text-muted-foreground">{email || 'N/A'}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          First Name
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
        {row.original.firstName}
      </div>
    ),
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Last Name
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
        {row.original.lastName}
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Phone
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
        <IconPhone className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{row.original.phone || 'Not specified'}</span>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Role
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
          variant={row.original.role === "admin" ? "default" : "outline"} 
          className="text-muted-foreground px-1.5"
        >
          {row.original.role === "admin" ? "Administrator" : "User"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "isEmailVerified",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Email
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
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.isEmailVerified ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ) : (
          <IconCircleCheckFilled className="fill-red-500 dark:fill-red-400" />
        )}
        {row.original.isEmailVerified ? "Verified" : "Not verified"}
      </Badge>
    ),
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
    cell: ({ row }) => {
      const isActive = row.original.isActive !== false; // Default to true if not specified
      return (
        <Badge 
          variant={isActive ? "default" : "outline"} 
          className={isActive ? "bg-green-500 hover:bg-green-600 text-white" : "text-muted-foreground px-1.5"}
        >
          {isActive ? (
            <>
              <IconCircleCheckFilled className="fill-white dark:fill-white mr-1 h-3 w-3" />
              Active
            </>
          ) : (
            <>
              <IconCircleCheckFilled className="fill-red-500 dark:fill-red-400 mr-1 h-3 w-3" />
              Blocked
            </>
          )}
        </Badge>
      );
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
      <div className="w-32">
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString('uk-UA')}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <UserActions user={row.original} />,
    enableSorting: false,
  },
]

function DraggableRow({ row }: { row: Row<User> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
  total,
  page,
  limit,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: {
  data: User[]
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  isLoading?: boolean
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: page - 1, // API uses 1-based pagination, but table is 0-based
    pageSize: limit,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
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
  const handlePaginationChange = React.useCallback((updater: ((old: typeof pagination) => typeof pagination) | typeof pagination) => {
    const newPagination = typeof updater === 'function' 
      ? updater(pagination) 
      : updater
    
    setPagination(newPagination)
    
    // Call callback to load new data only if page actually changed
    const newPage = newPagination.pageIndex + 1
    const newPageSize = newPagination.pageSize
    
    if (newPage !== page) {
      onPageChange(newPage)
    }
    if (newPageSize !== limit) {
      onPageSizeChange(newPageSize)
    }
  }, [pagination, page, limit, onPageChange, onPageSizeChange])

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
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    pageCount: total > 0 && limit > 0 ? Math.ceil(total / limit) : 1, // Use total count from API
    manualPagination: true, // Indicate that pagination is controlled externally
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
        <div className="overflow-x-auto rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
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
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
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
          </DndContext>
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
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
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
  )
}
