'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  initialSorting?: SortingState
  serverSidePagination?: {
    currentPage: number
    pageSize: number
    totalItems: number
    currentSorting?: SortingState
    onPageChange: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
    onSortingChange?: (sorting: SortingState) => void
    availablePageSizes?: number[]
  }
}

/**
 * Componente DataTable genérico usando TanStack Table
 * Soporta paginación client-side o server-side
 * Incluye soporte para:
 * - Sorting de múltiples columnas
 * - Paginación manual (10 items por página)
 * - Visibilidad de columnas
 *
 * @example
 * ```tsx
 * // Client-side pagination
 * <DataTable
 *   columns={debitsColumns}
 *   data={debits}
 *   initialSorting={[{ id: 'created_at', desc: true }]}
 * />
 * 
 * // Server-side pagination
 * <DataTable
 *   columns={debitsColumns}
 *   data={debits}
 *   serverSidePagination={{
 *     currentPage: 0,
 *     pageSize: 10,
 *     totalItems: 100,
 *     onPageChange: (page) => setCurrentPage(page)
 *   }}
 * />
 * ```
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  initialSorting,
  serverSidePagination,
}: DataTableProps<TData, TValue>) {
  // For server-side pagination, sorting state is controlled by parent
  // For client-side, we manage it locally
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(
    initialSorting || []
  )
  
  // Use parent's sorting if available (server-side), otherwise use internal (client-side)
  const sorting = serverSidePagination?.currentSorting || internalSorting;
  
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Handle sorting changes - for server-side pagination, delegate to parent
  const handleSortingChange = (updater: any) => {
    const newSorting = typeof updater === 'function' ? updater(sorting) : updater
    
    // If server-side pagination is enabled, notify parent component
    if (serverSidePagination?.onSortingChange) {
      serverSidePagination.onSortingChange(newSorting)
    } else {
      // Otherwise manage locally
      setInternalSorting(newSorting)
    }
  }

  // Configurar tabla con o sin paginación según el tipo
  const tableConfig = {
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: handleSortingChange,
    ...(serverSidePagination
      ? {
          // Server-side sorting: no apply sorting locally, assume data is already sorted
          manualSorting: true,
        }
      : {
          // Client-side sorting
          getSortedRowModel: getSortedRowModel(),
        }),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    ...(serverSidePagination
      ? {} // Sin paginación client-side para server-side
      : { getPaginationRowModel: getPaginationRowModel() }), // Con paginación client-side
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  }

  const table = useReactTable(tableConfig)

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-gray-700">
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
                <TableRow key={row.id} className="hover:bg-gray-50">
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
                  className="h-24 text-center text-gray-500"
                >
                  No hay resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {serverSidePagination ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Página {serverSidePagination.currentPage + 1} de{' '}
              {Math.ceil(serverSidePagination.totalItems / serverSidePagination.pageSize)} (
              {serverSidePagination.totalItems} total)
            </div>
            {serverSidePagination.onPageSizeChange && (
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-sm text-gray-600">
                  Mostrar:
                </label>
                <Select
                  value={String(serverSidePagination.pageSize)}
                  onValueChange={(value) => 
                    serverSidePagination.onPageSizeChange?.(Number(value))
                  }
                >
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(serverSidePagination.availablePageSizes || [10, 25, 50, 100]).map(
                      (size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => serverSidePagination.onPageChange(serverSidePagination.currentPage - 1)}
              disabled={serverSidePagination.currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => serverSidePagination.onPageChange(serverSidePagination.currentPage + 1)}
              disabled={(serverSidePagination.currentPage + 1) * serverSidePagination.pageSize >= serverSidePagination.totalItems}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()} ({table.getFilteredRowModel().rows.length} total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
