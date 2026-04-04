import { useDashboardData } from '@/hooks';
import { useState, useEffect } from 'react';
import { creditsService } from '@/services';

interface TotalsWidgetProps {
  className?: string;
}

/**
 * Widget que muestra el total de gastos y el saldo del mes actual
 */
export function TotalsWidget({ className = '' }: TotalsWidgetProps) {
  const { totalExpenses, loading } = useDashboardData('month');
  const [totalIncome, setTotalIncome] = useState(0);
  const [incomeLoading, setIncomeLoading] = useState(true);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Crear rango para el mes actual
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);

        // Obtener todos los ingresos
        const allCredits = await creditsService.getAll();
        const credits = allCredits.filter((credit) => {
          const creditDate = new Date(credit.created_at);
          return creditDate >= startDate && creditDate <= endDate;
        });

        const total = credits.reduce((sum, credit) => sum + credit.amount, 0);
        setTotalIncome(total);
      } catch (err) {
        console.error('Error loading income:', err);
      } finally {
        setIncomeLoading(false);
      }
    };

    fetchIncome();
  }, []);

  const balance = totalIncome - totalExpenses;
  const currentMonth = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  if (loading || incomeLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {/* Widget de Ingresos */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <p className="text-gray-600 text-sm font-medium mb-2">Ingresos</p>
        <p className="text-3xl font-bold text-green-600">
          ${totalIncome.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500 mt-2 capitalize">{currentMonth}</p>
      </div>

      {/* Widget de Gastos */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
        <p className="text-gray-600 text-sm font-medium mb-2">Gastos</p>
        <p className="text-3xl font-bold text-red-600">
          ${totalExpenses.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500 mt-2 capitalize">{currentMonth}</p>
      </div>

      {/* Widget de Saldo */}
      <div
        className={`bg-white rounded-lg shadow p-6 border-l-4 ${
          balance >= 0 ? 'border-blue-500' : 'border-orange-500'
        }`}
      >
        <p className="text-gray-600 text-sm font-medium mb-2">Saldo</p>
        <p
          className={`text-3xl font-bold ${
            balance >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}
        >
          ${balance.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {balance >= 0 ? 'Positivo' : 'Negativo'}
        </p>
      </div>
    </div>
  );
}
