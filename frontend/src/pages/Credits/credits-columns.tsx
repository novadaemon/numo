'use client'

import { Button } from '@/components/ui/button'
import { SortableHeader } from '@/components/ui/sortable-header'
import { Credit } from '@/types/models'
import { ColumnDef } from '@tanstack/react-table'
import { Edit2, Trash2 } from 'lucide-react'

export type CreditColumn = Credit

/**
 * Formato de fecha: DD/MM/YYYY (es-ES)
 *
 * IMPORTANTE: Parsear manualmente para evitar problemas de zona horaria.
 * new Date("2026-04-29") en UTC-3 sería "2026-04-28" porque asume UTC.
 * Solución: crear Date desde componentes de año/mes/día
 */
export const formatDate = (dateString: string): string => {
  // Parsear "2026-04-29" a componentes
  const [year, month, day] = dateString.split('-').map(Number)
  // Crear Date con zona horaria local (no UTC)
  const date = new Date(year, month - 1, day)
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
 * Definición de columnas para la tabla de credits
 * Columnas: Fecha (credited_at), Monto (amount), Observaciones (observations)
 * Soporta:
 * - Ordenamiento por todas las columnas
 * - Acciones: edit y delete (solo se muestra si se pasan callbacks)
 */
export const createCreditsColumns = (
  onEdit?: (credit: Credit) => void,
  onDelete?: (credit: Credit) => void
): ColumnDef<CreditColumn>[] => {
  const columns: ColumnDef<CreditColumn>[] = [
    {
      accessorKey: 'credited_at',
      id: 'credited_at',
      header: ({ column }) => <SortableHeader column={column} title="Fecha" />,
      cell: ({ row }) => {
        const date = row.getValue('credited_at') as string
        return <div className="text-sm text-gray-900">{formatDate(date)}</div>
      },
      sortingFn: 'datetime',
      size: 120,
    },
    {
      accessorKey: 'amount',
      id: 'amount',
      header: ({ column }) => <SortableHeader column={column} title="Monto" />,
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number
        return (
          <div className="text-right text-sm font-semibold text-green-600">
            +{formatCurrency(amount)}
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: 'observations',
      id: 'observations',
      header: ({ column }) => <SortableHeader column={column} title="Observaciones" />,
      cell: ({ row }) => {
        const credit = row.original
        const displayText = credit.observations || '-'
        // Truncate long observations
        const truncated =
          displayText.length > 100 ? displayText.substring(0, 100) + '...' : displayText
        return <div className="text-sm text-gray-900">{truncated}</div>
      },
      size: 800,
    },
  ]

  // Agregar columna de acciones solo si hay callbacks
  if (onEdit || onDelete) {
    columns.push({
      id: 'actions',
      header: () => <div className="w-full text-center text-sm font-medium">Acciones</div>,
      cell: ({ row }) => {
        const credit = row.original
        return (
          <div className="flex items-center justify-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(credit)}
                title="Editar ingreso"
                className="h-8 w-8 p-0">
                <Edit2 className="h-4 w-4 text-blue-600 hover:text-blue-800" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(credit)}
                title="Eliminar ingreso"
                className="h-8 w-8 p-0">
                <Trash2 className="h-4 w-4 text-red-600 hover:text-red-800" />
              </Button>
            )}
          </div>
        )
      },
      size: 100,
    })
  }

  return columns
}
