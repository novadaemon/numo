import { TotalsWidget, MonthlyExpensesChart, CategoryExpensesChart, DebitsTable } from '@/components/Dashboard';
import { useDashboardData } from '@/hooks/useDashboardData';

/**
 * Página principal del Dashboard
 * Muestra:
 * - Widget de totales (ingresos, gastos, saldo)
 * - Gráfico de gastos por mes
 * - Gráfico de gastos por categoría
 * - Tabla de gastos del mes ordenados por fecha
 */
export function Dashboard() {
  // Obtener datos del mes actual para la tabla
  const { debits: monthDebits, loading } = useDashboardData('month');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Resumen de tu actividad financiera de {new Date().getFullYear()}
          </p>
        </div>

        {/* Totals Widget - Mes Actual */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 font-medium mb-3">
            Mes Actual - {new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
          <TotalsWidget className="mb-8" />
        </div>

        {/* Charts Grid - Año Actual */}
        <div>
          <p className="text-sm text-gray-500 font-medium mb-3">
            Año Actual - {new Date().getFullYear()}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyExpensesChart />
            <CategoryExpensesChart />
          </div>
        </div>

        {/* Debits Table - Mes Actual */}
        <div className="mt-8">
          <p className="text-sm text-gray-500 font-medium mb-3">
            Gastos del Mes - {new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
          {loading ? (
            <div className="rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Cargando gastos...</p>
            </div>
          ) : (
            <DebitsTable debits={monthDebits} />
          )}
        </div>
      </div>
    </div>
  );
}
