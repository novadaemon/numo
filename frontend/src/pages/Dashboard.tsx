import { useMemo } from 'react';
import { TotalsWidget, MonthlyExpensesChart, CategoryExpensesChart, DebitsTable } from '@/components/Dashboard';
import type { FilterRule } from '@/components/Filters/types';

/**
 * Página principal del Dashboard
 * Muestra:
 * - Widget de totales (ingresos, gastos, saldo)
 * - Gráfico de gastos por mes
 * - Gráfico de gastos por categoría
 * - Tabla de gastos del mes (DebitsTable maneja paginación server-side)
 */
export function Dashboard() {
  // Calcular fechas del mes actual para filtrar gastos
  const monthFilters = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    const firstDayStr = firstDay.toISOString().split('T')[0];
    
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    const lastDayStr = lastDay.toISOString().split('T')[0];
    
    // Crear filtro de tipo "between" para expensed_at
    const filters: FilterRule[] = [
      {
        id: 'dashboard-month-filter',
        field: 'expensed_at',
        operator: 'between',
        value: [firstDayStr, lastDayStr],
      },
    ];
    
    return filters;
  }, []);

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
          <DebitsTable filters={monthFilters} />
        </div>
      </div>
    </div>
  );
}
