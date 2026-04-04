import { useState, useEffect } from 'react';
import { TotalsWidget, MonthlyExpensesChart, CategoryExpensesChart, DebitsTable } from '@/components/Dashboard';
import { debitsService } from '@/services';
import { PaginatedResponse } from '@/types';
import { Debit } from '@/types/models';

/**
 * Página principal del Dashboard
 * Muestra:
 * - Widget de totales (ingresos, gastos, saldo)
 * - Gráfico de gastos por mes
 * - Gráfico de gastos por categoría
 * - Tabla paginada de gastos del mes ordenados por fecha
 */
export function Dashboard() {
  // Obtener datos paginados del mes actual para la tabla
  const [tableData, setTableData] = useState<PaginatedResponse<Debit> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [tableLoading, setTableLoading] = useState(true);

  // Obtener datos paginados de la tabla
  useEffect(() => {
    const fetchTableData = async () => {
      try {
        setTableLoading(true);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);

        const response = await debitsService.getAll({
          from_date: startDate.toISOString().split('T')[0],
          to_date: endDate.toISOString().split('T')[0],
          page: currentPage,
          size: pageSize,
        });

        // Handle both paginated responses and direct arrays (for backwards compatibility)
        if (Array.isArray(response)) {
          setTableData({
            data: response,
            page: 0,
            size: pageSize,
            total: response.length,
          });
        } else {
          setTableData(response);
        }
      } catch (error) {
        console.error('Error fetching table data:', error);
        setTableData(null);
      } finally {
        setTableLoading(false);
      }
    };

    fetchTableData();
  }, [currentPage]);

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
          {tableLoading ? (
            <div className="rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Cargando gastos...</p>
            </div>
          ) : tableData && tableData.data && tableData.data.length > 0 ? (
            <DebitsTable 
              debits={tableData.data}
              page={tableData.page}
              size={tableData.size}
              total={tableData.total}
              onPageChange={setCurrentPage}
            />
          ) : (
            <div className="rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No hay gastos registrados para este período</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
