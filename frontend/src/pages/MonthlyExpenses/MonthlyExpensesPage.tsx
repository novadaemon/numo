import { CategoryExpensesTable } from '@/components/Dashboard'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { debitsService } from '@/services'
import { Debit } from '@/types/models'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

const MONTHS = Array.from({ length: 12 }, (_, index) => {
  const name = new Date(2000, index, 1).toLocaleString('es-ES', { month: 'long' })
  return { value: index + 1, label: name.charAt(0).toUpperCase() + name.slice(1) }
})

const YEARS_BACK = 1

/**
 * Agrupa los gastos por categoría con su total y porcentaje
 */
function groupByCategory(debits: Debit[]) {
  const total = debits.reduce((sum, debit) => sum + debit.amount, 0)
  const categoryMap = new Map<number, { name: string; total: number }>()

  debits.forEach((debit) => {
    const existing = categoryMap.get(debit.category_id) || { name: debit.category.name, total: 0 }
    existing.total += debit.amount
    categoryMap.set(debit.category_id, existing)
  })

  return Array.from(categoryMap.entries()).map(([id, { name, total: value }]) => ({
    id,
    name,
    value,
    percentage: total > 0 ? (value / total) * 100 : 0,
  }))
}

/**
 * Página de gastos por mes
 * Permite seleccionar año y mes y muestra los gastos agrupados por categoría
 */
export function MonthlyExpensesPage() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const years = Array.from({ length: YEARS_BACK }, (_, index) => currentYear - index)

  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [debits, setDebits] = useState<Debit[] | null>(null)
  const [queriedDate, setQueriedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const expensesByCategory = useMemo(() => (debits ? groupByCategory(debits) : []), [debits])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await debitsService.getMonthly(year, month)
      setDebits(response.data)
      setQueriedDate(new Date(year, month - 1, 1))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los gastos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Gastos por mes</h1>
          <p className="text-gray-600">Consulta tus gastos por categoría de un mes concreto</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-8 flex flex-wrap items-end gap-4 rounded-lg bg-white p-6 shadow">
          <div className="flex flex-col gap-2">
            <Label htmlFor="monthly-year">Año</Label>
            <Select value={year.toString()} onValueChange={(value) => setYear(Number(value))}>
              <SelectTrigger id="monthly-year" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="monthly-month">Mes</Label>
            <Select value={month.toString()} onValueChange={(value) => setMonth(Number(value))}>
              <SelectTrigger id="monthly-month" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value.toString()}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4" />
            {loading ? 'Consultando...' : 'Consultar'}
          </Button>
        </form>

        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {queriedDate && <CategoryExpensesTable data={expensesByCategory} date={queriedDate} />}
      </div>
    </div>
  )
}
