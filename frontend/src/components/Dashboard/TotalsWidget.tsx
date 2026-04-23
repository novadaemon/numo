import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDataRefresh } from '@/contexts'
import { useDashboardData } from '@/hooks'
import { creditsService } from '@/services'
import { Credit } from '@/types'
import { useEffect, useState } from 'react'
import { CreditForm } from '../../pages/Credits/CreditForm'
import { DebitForm } from '../../pages/Debits/DebitForm'

interface TotalsWidgetProps {
  className?: string
}

/**
 * Widget que muestra el total de gastos y el saldo del mes actual
 */
export function TotalsWidget({ className = '' }: TotalsWidgetProps) {
  const { totalExpenses, loading } = useDashboardData('month')
  const [totalIncome, setTotalIncome] = useState(0)
  const [incomeLoading, setIncomeLoading] = useState(true)
  const [showDebitForm, setShowDebitForm] = useState(false)
  const [showCreditForm, setShowCreditForm] = useState(false)
  const [refetchTrigger, setRefetchTrigger] = useState(0)
  const { onRefresh } = useDataRefresh()

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
        setRefetchTrigger((prev) => prev + 1)
      }
    })

    return unsubscribe
  }, [onRefresh])

  useEffect(() => {
    let isMounted = true

    const fetchIncome = async () => {
      try {
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth()

        // Crear rango para el mes actual
        const startDate = new Date(currentYear, currentMonth, 1)
        const endDate = new Date(currentYear, currentMonth + 1, 0)

        // Obtener ingresos del mes con fechas requeridas
        const response = await creditsService.getAll({
          page: 0,
          from_date: startDate.toISOString().split('T')[0],
          to_date: endDate.toISOString().split('T')[0],
          size: 100,
        })

        if (!isMounted) {
          return
        }

        // Validar respuesta y extraer credits
        let allCredits: Credit[] = []
        if (response && typeof response === 'object') {
          if ('data' in response && Array.isArray(response.data)) {
            allCredits = response.data
          } else if (Array.isArray(response)) {
            allCredits = response
          }
        }

        const total = allCredits.reduce((sum, credit) => sum + credit.amount, 0)
        if (isMounted) {
          setTotalIncome(total)
        }
      } catch (err) {
        console.error('Error loading income:', err)
      } finally {
        if (isMounted) {
          setIncomeLoading(false)
        }
      }
    }

    fetchIncome()

    // Cleanup: prevenir setState si el componente se desmonta
    return () => {
      isMounted = false
    }
  }, [refetchTrigger])

  const balance = totalIncome - totalExpenses
  const currentMonth = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })

  if (loading || incomeLoading) {
    return (
      <div className={`grid grid-cols-1 gap-6 md:grid-cols-3 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg bg-white p-6 shadow">
            <div className="mb-4 h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-8 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className={`grid grid-cols-1 gap-6 md:grid-cols-3 ${className}`}>
        {/* Widget de Ingresos */}
        <div className="rounded-lg border-l-4 border-green-500 bg-white p-6 shadow">
          <p className="mb-2 text-sm font-medium text-gray-600">Ingresos</p>
          <p className="text-3xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
          <p className="mb-4 mt-2 text-xs capitalize text-gray-500">{currentMonth}</p>
          <Button
            onClick={() => setShowCreditForm(true)}
            className="w-full bg-green-500 text-white hover:bg-green-600"
            size="sm">
            + Agregar Ingreso
          </Button>
        </div>

        {/* Widget de Gastos */}
        <div className="rounded-lg border-l-4 border-red-500 bg-white p-6 shadow">
          <p className="mb-2 text-sm font-medium text-gray-600">Gastos</p>
          <p className="text-3xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
          <p className="mb-4 mt-2 text-xs capitalize text-gray-500">{currentMonth}</p>
          <Button
            onClick={() => setShowDebitForm(true)}
            className="w-full bg-red-500 text-white hover:bg-red-600"
            size="sm">
            + Agregar Gasto
          </Button>
        </div>

        {/* Widget de Saldo */}
        <div
          className={`rounded-lg border-l-4 bg-white p-6 shadow ${
            balance >= 0 ? 'border-blue-500' : 'border-orange-500'
          }`}>
          <p className="mb-2 text-sm font-medium text-gray-600">Saldo</p>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            ${balance.toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-gray-500">{balance >= 0 ? 'Positivo' : 'Negativo'}</p>
        </div>
      </div>

      {/* Dialog para Debit */}
      <Dialog open={showDebitForm} onOpenChange={setShowDebitForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Gasto</DialogTitle>
            <DialogDescription>Registra un nuevo gasto en tu cuenta</DialogDescription>
          </DialogHeader>
          <DebitForm onOpenChange={setShowDebitForm} />
        </DialogContent>
      </Dialog>

      {/* Dialog para Credit */}
      <Dialog open={showCreditForm} onOpenChange={setShowCreditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Ingreso</DialogTitle>
            <DialogDescription>Registra un nuevo ingreso en tu cuenta</DialogDescription>
          </DialogHeader>
          <CreditForm onOpenChange={setShowCreditForm} />
        </DialogContent>
      </Dialog>
    </>
  )
}
