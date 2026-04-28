import { useDashboardData } from '@/hooks'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface CategoryExpensesChartProps {
  className?: string
}

// Colores para el gráfico de pastel (paleta profesional)
const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
  '#14b8a6', // teal
]

/**
 * Gráfico de pastel mostrando gastos por categoría del año actual
 */
export function CategoryExpensesChart({ className = '' }: CategoryExpensesChartProps) {
  const { expensesByCategory, loading } = useDashboardData('year')

  if (loading) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow ${className}`}>
        <div className="flex h-96 items-center justify-center">
          <div className="text-gray-400">Cargando datos...</div>
        </div>
      </div>
    )
  }

  if (expensesByCategory.length === 0) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow ${className}`}>
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          Gastos por Categoría - {new Date().getFullYear()}
        </h3>
        <div className="flex h-96 items-center justify-center">
          <div className="text-gray-400">Sin datos disponibles</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg bg-white p-6 shadow ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-gray-800">
        Gastos por Categoría - {new Date().getFullYear()}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={expensesByCategory}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name} (${((entry.percent || 0) * 100).toFixed(0)}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value">
            {expensesByCategory.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => {
              if (typeof value === 'number') {
                return `$${value.toFixed(2)}`
              }
              return value as string
            }}
            contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(_, entry) => {
              const data = entry?.payload as Record<string, unknown>
              return data ? `${data.name}: $${(data.value as number).toFixed(2)}` : ''
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
