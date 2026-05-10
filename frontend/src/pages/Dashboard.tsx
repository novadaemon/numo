import {
  CategoryExpensesChart,
  CategoryExpensesTable,
  MonthlyExpensesChart,
  TotalsWidget,
} from '@/components/Dashboard'
import { useDashboardData } from '@/hooks'

/**
 * Página principal del Dashboard
 * Muestra:
 * - Widget de totales (ingresos, gastos, saldo)
 * - Gráfico de gastos por mes
 * - Gráfico de gastos por categoría
 * - Tabla de gastos por categoría del mes actual
 */
export function Dashboard() {
  const { expensesByCategory } = useDashboardData('month')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Resumen de tu actividad financiera de {new Date().getFullYear()}
          </p>
        </div>

        {/* Totals Widget - Mes Actual */}
        <div className="mb-4">
          <p className="mb-3 text-sm font-medium text-gray-500">
            Mes Actual - {new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
          <TotalsWidget className="mb-8" />
        </div>

        {/* Charts Grid - Año Actual */}
        <div>
          <p className="mb-3 text-sm font-medium text-gray-500">
            Año Actual - {new Date().getFullYear()}
          </p>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MonthlyExpensesChart />
            <CategoryExpensesChart />
          </div>
        </div>

        {/* Category Expenses Table - Mes Actual */}
        <div className="mt-8">
          <CategoryExpensesTable data={expensesByCategory} />
        </div>
      </div>
    </div>
  )
}
