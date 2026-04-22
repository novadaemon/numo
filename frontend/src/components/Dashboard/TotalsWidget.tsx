import { useDashboardData } from '@/hooks';
import { useState, useEffect } from 'react';
import { creditsService } from '@/services';
import { Credit } from '@/types';
import { DebitForm, CreditForm } from '@/components/Forms';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [showDebitForm, setShowDebitForm] = useState(false);
  const [showCreditForm, setShowCreditForm] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchIncome = async () => {
      try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Crear rango para el mes actual
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);

        // Obtener ingresos del mes con fechas requeridas
        const response = await creditsService.getAll({ 
          page: 0,
          from_date: startDate.toISOString().split('T')[0],
          to_date: endDate.toISOString().split('T')[0],
          size: 100
        });
        
        if (!isMounted) {
          return;
        }
        
        // Validar respuesta y extraer credits
        let allCredits: Credit[] = [];
        if (response && typeof response === 'object') {
          if ('data' in response && Array.isArray(response.data)) {
            allCredits = response.data;
          } else if (Array.isArray(response)) {
            allCredits = response;
          }
        }

        const total = allCredits.reduce((sum, credit) => sum + credit.amount, 0);
        if (isMounted) {
          setTotalIncome(total);
        }
      } catch (err) {
        console.error('Error loading income:', err);
      } finally {
        if (isMounted) {
          setIncomeLoading(false);
        }
      }
    };

    fetchIncome();

    // Cleanup: prevenir setState si el componente se desmonta
    return () => {
      isMounted = false;
    };
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
    <>
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
        {/* Widget de Ingresos */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium mb-2">Ingresos</p>
          <p className="text-3xl font-bold text-green-600">
            ${totalIncome.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-2 capitalize mb-4">{currentMonth}</p>
          <Button
            onClick={() => setShowCreditForm(true)}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            size="sm"
          >
            + Agregar Ingreso
          </Button>
        </div>

        {/* Widget de Gastos */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm font-medium mb-2">Gastos</p>
          <p className="text-3xl font-bold text-red-600">
            ${totalExpenses.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-2 capitalize mb-4">{currentMonth}</p>
          <Button
            onClick={() => setShowDebitForm(true)}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            size="sm"
          >
            + Agregar Gasto
          </Button>
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

      {/* Dialog para Debit */}
      <Dialog open={showDebitForm} onOpenChange={setShowDebitForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Gasto</DialogTitle>
            <DialogDescription>
              Registra un nuevo gasto en tu cuenta
            </DialogDescription>
          </DialogHeader>
          <DebitForm onOpenChange={setShowDebitForm} />
        </DialogContent>
      </Dialog>

      {/* Dialog para Credit */}
      <Dialog open={showCreditForm} onOpenChange={setShowCreditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Ingreso</DialogTitle>
            <DialogDescription>
              Registra un nuevo ingreso en tu cuenta
            </DialogDescription>
          </DialogHeader>
          <CreditForm onOpenChange={setShowCreditForm} />
        </DialogContent>
      </Dialog>
    </>
  );
}
