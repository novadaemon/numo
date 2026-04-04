import { Debit } from '@/types/models';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DebitsTableProps {
  debits: Debit[];
}

/**
 * Tabla que muestra los gastos ordenados de forma descendente por created_at
 */
export function DebitsTable({ debits }: DebitsTableProps) {
  // Ordenar debits de forma descendente por created_at
  const sortedDebits = [...debits].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (sortedDebits.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No hay gastos registrados para este período</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-gray-700">Fecha</TableHead>
            <TableHead className="text-gray-700">Categoría</TableHead>
            <TableHead className="text-gray-700">Lugar</TableHead>
            <TableHead className="text-gray-700">Concepto</TableHead>
            <TableHead className="text-right text-gray-700">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDebits.map((debit) => (
            <TableRow key={debit.id} className="hover:bg-gray-50">
              <TableCell className="text-sm text-gray-900">
                {formatDate(debit.created_at)}
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                {debit.category?.name || 'Sin categoría'}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {debit.place?.name || '-'}
              </TableCell>
              <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                {debit.concept || debit.observations || '-'}
              </TableCell>
              <TableCell className="text-right text-sm font-semibold text-red-600">
                -{formatCurrency(debit.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
