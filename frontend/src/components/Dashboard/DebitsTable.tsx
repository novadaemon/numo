import { Debit } from '@/types/models';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface DebitsTableProps {
  debits: Debit[];
  page?: number;
  size?: number;
  total?: number;
  loading?: boolean;
  onPageChange?: (page: number) => void;
}

/**
 * Tabla que muestra los gastos ordenados de forma descendente por created_at
 * con soporte para paginación
 */
export function DebitsTable({ 
  debits, 
  page = 0, 
  size = 10, 
  total = 0,
  loading = false,
  onPageChange 
}: DebitsTableProps) {

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

  const totalPages = Math.ceil(total / size);
  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  const handlePrevPage = () => {
    if (hasPrevPage && onPageChange) {
      onPageChange(page - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage && onPageChange) {
      onPageChange(page + 1);
    }
  };

  if (debits.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No hay gastos registrados para este período</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-gray-700">Fecha</TableHead>
              <TableHead className="text-gray-700">Categoría</TableHead>
              <TableHead className="text-gray-700">Lugar</TableHead>
              <TableHead className="text-right text-gray-700">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debits.map((debit) => (
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
                <TableCell className="text-right text-sm font-semibold text-red-600">
                  -{formatCurrency(debit.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4">
          <div className="text-sm text-gray-600">
            Página {page + 1} de {totalPages} ({total} total)
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePrevPage}
              disabled={!hasPrevPage || loading}
              variant="outline"
              size="sm"
            >
              Anterior
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={!hasNextPage || loading}
              variant="outline"
              size="sm"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
