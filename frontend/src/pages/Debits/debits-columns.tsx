'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Debit } from '@/types/models'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Edit2, Trash2 } from 'lucide-react'

export type DebitColumn = Debit

/**
 * Formato de fecha: DD/MM/YYYY (es-ES)
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Formato de moneda: EUR con 2 decimales
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Encabezado sorteable reutilizable
 */
export const SortableHeader = ({
  column,
  title,
}: {
  column: any
  title: string
}) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    className="h-8 p-0 hover:bg-transparent"
  >
    {title}
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>
)

/**
 * Definición de columnas para la tabla de debits
 * Soporta:
 * - Ordenamiento por fecha, categoría, lugar, monto
 * - Acciones: edit y delete
 */
export const createDebitsColumns = (
  onEdit?: (debit: Debit) => void,
  onDelete?: (debit: Debit) => void
): ColumnDef<DebitColumn>[] => [
  {
    accessorKey: 'created_at',
    id: 'created_at',
    header: ({ column }) => <SortableHeader column={column} title="Fecha" />,
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string
      return <div className="text-sm text-gray-900">{formatDate(date)}</div>
    },
    sortingFn: 'datetime',
    size: 120,
  },
  {
    accessorKey: 'category.name',
    id: 'category',
    header: ({ column }) => <SortableHeader column={column} title="Categoría" />,
    cell: ({ row }) => {
      const category = row.original.category
      return (
        <div className="text-sm text-gray-900">
          {category?.name || 'Sin categoría'}
        </div>
      )
    },
    size: 150,
  },
  {
    accessorKey: 'place.name',
    id: 'place',
    header: ({ column }) => <SortableHeader column={column} title="Lugar/Concepto" />,
    cell: ({ row }) => {
      const place = row.original.place
      return <div className="text-sm text-gray-600">{place?.name || '-'}</div>
    },
    size: 150,
  },
  {
    accessorKey: 'amount',
    id: 'amount',
    header: ({ column }) => (
      <div className="text-right">
        <SortableHeader column={column} title="Monto" />
      </div>
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number
      return (
        <div className="text-right text-sm font-semibold text-red-600">
          -{formatCurrency(amount)}
        </div>
      )
    },
    size: 120,
  },
  // Acciones: Edit y Delete
  {
    id: 'actions',
    header: () => <div className="text-center text-sm font-medium">Acciones</div>,
    cell: ({ row }) => {
      const debit = row.original
      return (
        <div className="flex items-center justify-center gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(debit)}
              title="Editar gasto"
              className="h-8 w-8 p-0"
            >
              <Edit2 className="w-4 h-4 text-blue-600 hover:text-blue-800" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(debit)}
              title="Eliminar gasto"
              className="h-8 w-8 p-0"
            >
              <Trash2 className="w-4 h-4 text-red-600 hover:text-red-800" />
            </Button>
          )}
        </div>
      )
    },
    size: 100,
    enableSorting: false,
    enableHiding: false,
  },
]
