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
  IconGripVertical,
  IconArrowsUpDown,
  IconArrowUp,
  IconArrowDown,
  IconCalendar,
  IconCar,
  IconUser,
  IconCreditCard,
  IconClock,
  IconEye,
  IconCheck,
  IconX,
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
import { Booking, BookingStatus, PaymentStatus } from "@/interface/Booking"
import { useBookingsStore } from "@/store/useBookingsStore"
import { BookingDetailsModal } from "@/components/bookings/booking-details-modal"
import { toast } from "sonner"
import Link from "next/link"

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

const getStatusBadge = (status: BookingStatus) => {
  switch (status) {
    case 'approved':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approved</Badge>
    case 'pending':
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>
    case 'completed':
      return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
    case 'converted_to_long_term':
      return <Badge variant="outline" className="border-purple-500 text-purple-600">Long Term</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getPaymentStatusBadge = (status: PaymentStatus) => {
  switch (status) {
    case 'paid':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Paid</Badge>
    case 'pending':
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending Payment</Badge>
    case 'frozen':
      return <Badge variant="outline" className="border-blue-500 text-blue-600">Frozen</Badge>
    case 'released':
      return <Badge variant="secondary" className="bg-purple-500 hover:bg-purple-600">Released</Badge>
    case 'refunded':
      return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600">Refunded</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Create columns function that accepts the necessary props
const createColumns = (
  setSelectedBookingForDetails: (booking: Booking) => void,
  setIsDetailsDialogOpen: (open: boolean) => void,
  approveBooking: (id: number) => Promise<void>,
  rejectBooking: (id: number) => Promise<void>,
  cancelBooking: (id: number) => Promise<void>
): ColumnDef<Booking>[] => [
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
        <Link href={`/bookings/${row.original.id}`} className="text-blue-500 hover:text-blue-600">
          {row.original.id}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "user",
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
      const booking = row.original
      
      const handleApprove = async () => {
        try {
          await approveBooking(booking.id)
          toast.success('Booking approved successfully!')
        } catch (error) {
          console.error('Error approving booking:', error)
          toast.error('Error approving booking')
        }
      }

      const handleReject = async () => {
        try {
          await rejectBooking(booking.id)
          toast.success('Booking rejected successfully!')
        } catch (error) {
          console.error('Error rejecting booking:', error)
          toast.error('Error rejecting booking')
        }
      }

      const handleCancel = async () => {
        try {
          await cancelBooking(booking.id)
          toast.success('Booking cancelled successfully!')
        } catch (error) {
          console.error('Error cancelling booking:', error)
          toast.error('Error cancelling booking')
        }
      }

      return (
        <div className="w-64 flex items-center gap-2">
          <IconUser className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col flex-1">
            <span className="font-medium">
              {booking.user?.firstName} {booking.user?.lastName}
            </span>
            <span className="text-sm text-muted-foreground">
              {booking.user?.email || 'Not specified'}
            </span>
          </div>
          <div className="flex gap-1">
            {/* Booking Status Actions */}
            {(booking.status as string).toUpperCase() === 'PENDING' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleApprove}
                  className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                  title="Approve Booking"
                >
                  <IconCheck className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReject}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Reject Booking"
                >
                  <IconX className="h-3 w-3" />
                </Button>
              </>
            )}
            
            {((booking.status as string).toUpperCase() === 'PENDING' || (booking.status as string).toUpperCase() === 'APPROVED') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                title="Cancel Booking"
              >
                <IconX className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: "vehicle",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Vehicle
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
        <IconCar className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="font-medium">
            {row.original.vehicle?.name || 'Not specified'}
          </span>
          <span className="text-sm text-muted-foreground">
            {row.original.vehicle?.year} • {row.original.vehicle?.transmission}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "startDateTime",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Start Date
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
      const startDate = new Date(row.original.startDateTime)
      return (
        <div className="w-32 flex items-center gap-2">
          <IconCalendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {isNaN(startDate.getTime()) ? 'Invalid Date' : startDate.toLocaleDateString('uk-UA')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "endDateTime",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          End Date
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
      const endDate = new Date(row.original.endDateTime)
      return (
        <div className="w-32 flex items-center gap-2">
          <IconCalendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {isNaN(endDate.getTime()) ? 'Invalid Date' : endDate.toLocaleDateString('uk-UA')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "paymentStatus",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Payment
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
        <IconCreditCard className="h-4 w-4 text-muted-foreground" />
        {getPaymentStatusBadge(row.original.paymentStatus)}
      </div>
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
      <div className="w-32">
        {getStatusBadge(row.original.status)}
      </div>
    ),
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Total Price
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
      const totalPrice = typeof row.original.totalPrice === 'string' 
        ? parseFloat(row.original.totalPrice) 
        : row.original.totalPrice
      return (
        <div className="w-32 flex items-center gap-2">
          <span className="text-sm font-medium">
            CAD {isNaN(totalPrice) ? '0.00' : totalPrice.toFixed(2)}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "rentalDays",
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
    cell: ({ row }) => {
      const rentalDays = typeof row.original.rentalDays === 'string' 
        ? parseInt(row.original.rentalDays) 
        : row.original.rentalDays
      return (
        <div className="w-24 text-center">
          <span className="text-sm font-medium">
            {isNaN(rentalDays) ? '0' : rentalDays} days
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "bookingOptions",
    header: "Options",
    cell: ({ row }) => {
      const options = row.original.bookingOptions || []
      return (
        <div className="w-32">
          {options.length > 0 ? (
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              {options.length} option{options.length !== 1 ? 's' : ''}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">None</span>
          )}
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
      const createdDate = new Date(row.original.createdAt)
      return (
        <div className="w-32 flex items-center gap-2">
          <IconClock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {isNaN(createdDate.getTime()) ? 'Invalid Date' : createdDate.toLocaleDateString('uk-UA')}
          </span>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const booking = row.original

      const handleViewDetails = () => {
        setSelectedBookingForDetails(booking)
        setIsDetailsDialogOpen(true)
      }

      return (
        <div className="flex items-center gap-2">
          {/* View Details Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewDetails}
            className="h-8 w-8 p-0"
            title="View Details"
          >
            <IconEye className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    enableSorting: false,
    size: 120,
  },
]

function DraggableRow({ row }: { row: Row<Booking> }) {
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
  data: Booking[]
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
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false)
  const [selectedBookingForDetails, setSelectedBookingForDetails] = React.useState<Booking | null>(null)
  
  const { 
    approveBooking, 
    rejectBooking, 
    cancelBooking 
  } = useBookingsStore()

  // Create columns with the necessary functions
  const columns = React.useMemo(() => createColumns(
    setSelectedBookingForDetails,
    setIsDetailsDialogOpen,
    approveBooking,
    rejectBooking,
    cancelBooking
  ), [setSelectedBookingForDetails, setIsDetailsDialogOpen, approveBooking, rejectBooking, cancelBooking])
  
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
    pageCount: Math.ceil(total / limit), // Use total count from API
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
    <>
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
        <div className="overflow-hidden rounded-lg border">
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

    <BookingDetailsModal
      booking={selectedBookingForDetails}
      isOpen={isDetailsDialogOpen}
      onClose={() => setIsDetailsDialogOpen(false)}
    />
    </>
  )
}
