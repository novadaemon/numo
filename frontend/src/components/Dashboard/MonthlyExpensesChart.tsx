import { useDashboardData } from '@/hooks';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyExpensesChartProps {
  className?: string;
}

/**
 * Gráfico de barras verticales mostrando gastos por mes del año actual
 */
export function MonthlyExpensesChart({ className = '' }: MonthlyExpensesChartProps) {
  const { expensesByMonth, loading } = useDashboardData('year');

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="h-96 flex items-center justify-center">
          <div className="text-gray-400">Cargando datos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Gastos por Mes - {new Date().getFullYear()}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={expensesByMonth}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{ value: 'Monto ($)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}
            formatter={(value) => {
              if (typeof value === 'number') {
                return `$${value.toFixed(2)}`;
              }
              return value;
            }}
          />
          <Legend />
          <Bar
            dataKey="total"
            fill="#ef4444"
            name="Gastos"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
