'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Debit } from '@/types/models'
import { Button } from '@/components/ui/button'
import { SortableHeader } from '@/components/ui/sortable-header'
import { Edit2, Trash2 } from 'lucide-react'

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
 * Formato de moneda: UYU con 2 decimales
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Definición de columnas para la tabla de debits
 * Soporta:
 * - Ordenamiento por fecha, categoría, lugar, monto
 * - Acciones: edit y delete (solo se muestra si se pasan callbacks)
 */
export const createDebitsColumns = (
  onEdit?: (debit: Debit) => void,
  onDelete?: (debit: Debit) => void
): ColumnDef<DebitColumn>[] => {
  const columns: ColumnDef<DebitColumn>[] = [
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
      header: ({ column }) => <SortableHeader column={column} title="Lugar" />,
      cell: ({ row }) => {
        const debit = row.original
        const displayText =  debit.place?.name || '-'
        return (
          <div className="text-sm">
            <div className="text-gray-900">{displayText}</div>
          </div>
        )
      },
      size: 150,
    },
    {
      accessorKey: 'concept',
      id: 'concept',
      header: ({ column }) => <SortableHeader column={column} title="Concepto" />,
      cell: ({ row }) => {
        const debit = row.original
        const displayText = debit.concept || '-'
        return (
          <div className="text-sm">
            <div className="text-gray-900">{displayText}</div>
          </div>
        )
      },
      size: 150,
    },
    {
      accessorKey: 'method',
      id: 'method',
      header: ({ column }) => <SortableHeader column={column} title="Método" />,
      cell: ({ row }) => {
        const method = row.getValue('method') as string
        const methodLabels: Record<string, string> = {
          debit: 'Débito',
          credit: 'Crédito',
          cash: 'Efectivo',
        }
        const methodColors: Record<string, string> = {
          debit: 'bg-blue-100 text-blue-800',
          credit: 'bg-purple-100 text-purple-800',
          cash: 'bg-green-100 text-green-800',
        }
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${methodColors[method] || 'bg-gray-100 text-gray-800'}`}>
            {methodLabels[method] || method}
          </span>
        )
      },
      size: 100,
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
  ]

  // Agregar columna de acciones solo si hay callbacks
  if (onEdit || onDelete) {
    columns.push({
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
    })
  }

  return columns
}
