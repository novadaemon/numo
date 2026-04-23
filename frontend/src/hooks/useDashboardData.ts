import { useState, useEffect } from 'react';
import { debitsService } from '@/services';
import { Debit } from '@/types/models';
import { useDataRefresh } from '@/contexts';

export type DatePeriod = 'month' | 'year';

export interface DashboardData {
  totalExpenses: number;
  debits: Debit[];
  expensesByMonth: Array<{
    month: string;
    monthNumber: number;
    total: number;
  }>;
  expensesByCategory: Array<{
    id: number;
    name: string;
    value: number;
    percentage: number;
  }>;
  loading: boolean;
  error: string | null;
}

/**
 * Get date range for the specified period
 */
function getDateRange(period: DatePeriod): { startDate: string; endDate: string } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  if (period === 'month') {
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  // year
  return {
    startDate: `${currentYear}-01-01`,
    endDate: `${currentYear}-12-31`,
  };
}

/**
 * Hook para obtener y procesar datos del dashboard
 * Se suscribe a eventos de actualización para refetch automático
 * @param period - 'month' para mes actual, 'year' para año actual
 */
export function useDashboardData(period: DatePeriod = 'year'): DashboardData {
  const [data, setData] = useState<DashboardData>({
    totalExpenses: 0,
    debits: [],
    expensesByMonth: [],
    expensesByCategory: [],
    loading: true,
    error: null,
  });

  // Trigger para refetch cuando hay cambios
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const { onRefresh } = useDataRefresh();

  // Suscribirse a eventos de actualización de datos
  useEffect(() => {
    const unsubscribe = onRefresh((event) => {
      // Refetch cuando hay cambios en débitos o créditos
      if (
        event === 'debit-created' ||
        event === 'debit-updated' ||
        event === 'debit-deleted' ||
        event === 'credit-created' ||
        event === 'credit-updated' ||
        event === 'credit-deleted'
      ) {
        // Trigger a refetch
        setRefetchTrigger((prev) => prev + 1);
      }
    });

    return unsubscribe;
  }, [onRefresh]);

  // Fetch datos cuando period o refetchTrigger cambian
  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    const fetchData = async () => {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));
        
        const { startDate, endDate } = getDateRange(period);

        // Obtener gastos del período con paginación
        // Necesitamos todos los datos del período, así que usamos size=100
        const response = await debitsService.getAll({ 
          page: 0,
          from_date: startDate, 
          to_date: endDate,
          size: 100
        });
        
        // Verificar que el componente aún está montado antes de updatear estado
        if (!isMounted) {
          return;
        }
        
        // Validar respuesta y extraer debits
        let debits: Debit[] = [];
        if (response) {
          if ('data' in response && Array.isArray(response.data)) {
            debits = response.data;
          } else if (Array.isArray(response)) {
            debits = response as Debit[];
          }
        }

        // Calcular total de gastos
        const totalExpenses = debits.reduce((sum, debit) => sum + debit.amount, 0);

        // Agrupar por mes (solo para período anual)
        let expensesByMonth: DashboardData['expensesByMonth'] = [];
        if (period === 'year') {
          const monthMap = new Map<number, number>();
          const months = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
          ];

          debits.forEach((debit) => {
            const date = new Date(debit.expensed_at);
            const month = date.getMonth();
            monthMap.set(month, (monthMap.get(month) || 0) + debit.amount);
          });

          expensesByMonth = Array.from({ length: 12 }, (_, index) => ({
            month: months[index],
            monthNumber: index + 1,
            total: monthMap.get(index) || 0,
          }));
        }

        // Agrupar por categoría
        const categoryMap = new Map<number, { name: string; total: number }>();

        debits.forEach((debit) => {
          const categoryId = debit.category_id;
          const existing = categoryMap.get(categoryId) || { name: debit.category.name, total: 0 };
          existing.total += debit.amount;
          categoryMap.set(categoryId, existing);
        });

        const expensesByCategory = Array.from(categoryMap.entries())
          .map(([id, { name, total }]) => ({
            id,
            name,
            value: total,
            percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
          }))
          .sort((a, b) => b.value - a.value); // Ordenar por mayor gasto

        if (isMounted) {
          setData({
            totalExpenses,
            debits,
            expensesByMonth,
            expensesByCategory,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        // Ignorar errores de abort
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        if (isMounted) {
          setData((prev) => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Error al cargar datos',
          }));
        }
      }
    };

    fetchData();

    // Cleanup: cancelar petición si el componente se desmonta o period cambia
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [period, refetchTrigger]);

  return data;
}
