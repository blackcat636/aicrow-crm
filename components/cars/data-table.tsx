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
  IconDotsVertical,
  IconGripVertical,
  IconLoader,
  IconArrowsUpDown,
  IconArrowUp,
  IconArrowDown,
  IconCheck,
  IconX,
  IconEdit,
  IconTrash,
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
import { Car } from "@/interface/Cars"
import { activateVehicle, deactivateVehicle } from "@/lib/api/cars"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

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

function DraggableRow({ row }: { row: Row<Car> }) {
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
}: {
  data: Car[]
}) {
  // Ensure initialData is always an array
  const safeInitialData = React.useMemo(() => {
    
    if (!initialData) {
      return [];
    }
    
    if (!Array.isArray(initialData)) {
      return [];
    }
    
    return initialData;
  }, [initialData]);

  const [data, setData] = React.useState(() => {
    return safeInitialData;
  })
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  // Sync data state with initialData prop changes
  React.useEffect(() => {
    setData(safeInitialData)
  }, [safeInitialData])

  // Debug current data state - temporarily disabled

  const columns: ColumnDef<Car>[] = [
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
              <IconArrowUp className="tabler-icon ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <IconArrowDown className="tabler-icon ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="tabler-icon ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="w-32">
          <Link href={`/cars/${row.original.id}`} className="text-blue-500 hover:text-blue-600">
            {row.original.id}
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
              <IconArrowUp className="tabler-icon ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <IconArrowDown className="tabler-icon ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="tabler-icon ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="w-64 min-w-0">
          <div className="flex items-center gap-2">
            {row.original.media && row.original.media.length > 0 ? (
              <Image
                src={row.original.media[0].url.startsWith('http') 
                  ? row.original.media[0].url 
                  : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'}${row.original.media[0].url.startsWith('/') ? '' : '/'}${row.original.media[0].url}`}
                alt={row.original.name}
                className="w-8 h-8 rounded object-cover"
                width={32}
                height={32}
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <IconLoader className="tabler-icon w-4 h-4 text-gray-400" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-medium break-words leading-tight">{row.original.name}</span>
              {row.original.location && (
                <span className="text-xs text-gray-500 break-words leading-tight whitespace-normal">
                  📍 {row.original.location.name}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "brand",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Brand
            {column.getIsSorted() === "asc" ? (
              <IconArrowUp className="tabler-icon ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <IconArrowDown className="tabler-icon ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="tabler-icon ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="w-32">
          {typeof row.original.brand === 'object' ? row.original.brand?.name : row.original.brand || 'Unknown'}
        </div>
      ),
    },
    {
      accessorKey: "model",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Model
            {column.getIsSorted() === "asc" ? (
              <IconArrowUp className="tabler-icon ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <IconArrowDown className="tabler-icon ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="tabler-icon ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="w-32">
          {typeof row.original.model === 'object' ? row.original.model?.name : row.original.model || 'Unknown'}
        </div>
      ),
    },
    {
      accessorKey: "year",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Year
            {column.getIsSorted() === "asc" ? (
              <IconArrowUp className="tabler-icon ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <IconArrowDown className="tabler-icon ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="tabler-icon ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="w-20">
          {row.original.year}
        </div>
      ),
    },
    {
      accessorKey: "rentalPrice",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Price
            {column.getIsSorted() === "asc" ? (
              <IconArrowUp className="tabler-icon ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <IconArrowDown className="tabler-icon ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="tabler-icon ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="w-24">
          <span className="font-semibold">{row.original.rentalPrice}</span>
        </div>
      ),
    },
    {
      accessorKey: "available",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Status
            {column.getIsSorted() === "asc" ? (
              <IconArrowUp className="tabler-icon ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <IconArrowDown className="tabler-icon ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="tabler-icon ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <Badge 
          variant={row.original.available ? "default" : "outline"} 
          className="text-muted-foreground px-1.5"
        >
          {row.original.available ? (
            <IconCheck className="tabler-icon mr-1 h-3 w-3" />
          ) : (
            <IconX className="tabler-icon mr-1 h-3 w-3" />
          )}
          {row.original.available ? "Available" : "Unavailable"}
        </Badge>
      ),
    },
    {
      accessorKey: "rating",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Rating
            {column.getIsSorted() === "asc" ? (
              <IconArrowUp className="tabler-icon ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <IconArrowDown className="tabler-icon ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="tabler-icon ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="w-20">
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {row.original.rating ? (
              <IconCircleCheckFilled className="tabler-icon fill-yellow-500 dark:fill-yellow-400" />
            ) : (
              <IconCircleCheckFilled className="tabler-icon fill-gray-500 dark:fill-gray-400" />
            )}
            {row.original.rating || 0}/5
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Category
            {column.getIsSorted() === "asc" ? (
              <IconArrowUp className="tabler-icon ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <IconArrowDown className="tabler-icon ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="tabler-icon ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="w-32">
          <Badge variant="outline">{typeof row.original.category === 'object' ? row.original.category?.name : row.original.category || 'N/A'}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "fuel",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Fuel
            {column.getIsSorted() === "asc" ? (
              <IconArrowUp className="tabler-icon ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <IconArrowDown className="tabler-icon ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="tabler-icon ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="w-24">
          {row.original.fuel}
        </div>
      ),
    },
    {
      accessorKey: "transmission",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Transmission
            {column.getIsSorted() === "asc" ? (
              <IconArrowUp className="tabler-icon ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <IconArrowDown className="tabler-icon ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="tabler-icon ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="w-24">
          {row.original.transmission}
        </div>
      ),
    },
    {
      accessorKey: "seats",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Seats
            {column.getIsSorted() === "asc" ? (
              <IconArrowUp className="tabler-icon ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <IconArrowDown className="tabler-icon ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="tabler-icon ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="w-16">
          {row.original.seats}
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
              <IconArrowUp className="tabler-icon ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <IconArrowDown className="tabler-icon ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="tabler-icon ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="w-32">
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString('en-US')}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Location
            {column.getIsSorted() === "asc" ? (
              <IconArrowUp className="tabler-icon ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <IconArrowDown className="tabler-icon ml-2 h-4 w-4" />
            ) : (
              <IconArrowsUpDown className="tabler-icon ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="w-48 min-w-0">
          {row.original.location ? (
            <div className="flex flex-col space-y-1">
              <span className="font-medium text-sm break-words leading-tight whitespace-normal">
                {row.original.location.name}
              </span>
              <span className="text-xs text-gray-500 break-words leading-tight whitespace-normal">
                {row.original.location.city}, {row.original.location.country}
              </span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">No location</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const car = row.original
        
        const handleEdit = () => {
          window.location.href = `/cars/${car.id}`
        }

        const handleActivate = async () => {
          try {
            const response = await activateVehicle(car.id)
            if (response.status === 'success') {
              toast.success('Car activated successfully')
              window.location.reload()
            } else {
              toast.error(response.message || 'Error activating car')
            }
          } catch (error) {
            console.error('Error activating car:', error)
            toast.error('Error activating car')
          }
        }

        const handleDeactivate = async () => {
          try {
            const response = await deactivateVehicle(car.id)
            if (response.status === 'success') {
              toast.success('Car deactivated successfully')
              window.location.reload()
            } else {
              toast.error(response.message || 'Error deactivating car')
            }
          } catch (error) {
            console.error('Error deactivating car:', error)
            toast.error('Error deactivating car')
          }
        }
        
        return (
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleEdit}>
                <IconEdit className="tabler-icon mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {car.available ? (
                <DropdownMenuItem onClick={handleDeactivate}>
                  <IconX className="tabler-icon mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleActivate}>
                  <IconCheck className="tabler-icon mr-2 h-4 w-4" />
                  Activate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                variant="destructive" 
                onSelect={(e) => {
                  e.preventDefault()
                }}
              >
                <IconTrash className="tabler-icon mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
    },
  ]

  // Final safety check - ensure data is always an array
  const safeData = React.useMemo(() => {
    
    if (!data) {
      return [];
    }
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data;
  }, [data]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(() => {
    
    try {
      if (!safeData || safeData.length === 0) {
        return [];
      }
      
      const ids = safeData.map((item) => {
        if (!item || typeof item !== 'object') {
          return null;
        }
        return item.id;
      }).filter(id => id !== null && id !== undefined);
      
      return ids;
    } catch (error) {
      console.error('DataTable - dataIds useMemo - error:', error);
      return [];
    }
  }, [safeData])

  const table = useReactTable({
    data: safeData,
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
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
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
    <div className="space-y-4">
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
          {table.getFilteredRowModel().rows.length} row(s) selected.
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
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
