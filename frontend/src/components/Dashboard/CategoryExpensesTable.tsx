import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useState } from 'react'

interface CategoryExpense {
  id: number
  name: string
  value: number
  percentage: number
}

interface CategoryExpensesTableProps {
  data: CategoryExpense[]
  className?: string
  /** Fecha dentro del mes a mostrar en el título (por defecto, el mes actual) */
  date?: Date
}

type SortField = 'name' | 'value'
type SortOrder = 'asc' | 'desc'

/**
 * Tabla de gastos por categoría de un mes (por defecto, el mes actual)
 * Permite ordenamiento por categoría o monto
 */
export function CategoryExpensesTable({
  data,
  className = '',
  date = new Date(),
}: CategoryExpensesTableProps) {
  const [sortField, setSortField] = useState<SortField>('value')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Obtener mes y año a mostrar
  const monthName = date.toLocaleString('es-ES', { month: 'long' })
  const year = date.getFullYear()

  // Función para manejar ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Alternar el orden si ya está seleccionado
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Nuevo campo: ordenar descendente por defecto
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Ordenar datos
  const sortedData = [...data].sort((a, b) => {
    let compareA: string | number
    let compareB: string | number

    if (sortField === 'name') {
      compareA = a.name.toLowerCase()
      compareB = b.name.toLowerCase()
    } else {
      compareA = a.value
      compareB = b.value
    }

    if (compareA < compareB) {
      return sortOrder === 'asc' ? -1 : 1
    }
    if (compareA > compareB) {
      return sortOrder === 'asc' ? 1 : -1
    }
    return 0
  })

  // Total de gastos del mes
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Componente para renderizar el icono de ordenamiento en el header
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 inline h-4 w-4 text-gray-400" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 inline h-4 w-4 text-gray-900" />
    ) : (
      <ArrowDown className="ml-2 inline h-4 w-4 text-gray-900" />
    )
  }

  if (data.length === 0) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow ${className}`}>
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          Gastos por Categoría - {monthName} de {year}
        </h3>
        <div className="flex h-32 items-center justify-center">
          <div className="text-gray-400">Sin datos disponibles</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg bg-white p-6 shadow ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-gray-800">
        Gastos por Categoría - {monthName} de {year}
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none hover:bg-gray-100"
                onClick={() => handleSort('name')}>
                Categoría
                <SortIcon field="name" />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right hover:bg-gray-100"
                onClick={() => handleSort('value')}>
                Monto
                <SortIcon field="value" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                <TableCell className="text-right text-gray-900">${item.value.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-semibold text-gray-900">Total</TableCell>
              <TableCell className="text-right font-semibold text-gray-900">${total.toFixed(2)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
