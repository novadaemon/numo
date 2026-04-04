import { useState, useEffect } from 'react';
import { Debit } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { createDebitsColumns } from './debits-columns';
import { debitsService } from '@/services';
import toast from 'react-hot-toast';

interface DebitsTableProps {
  onEdit?: (debit: Debit) => void;
  onDelete?: (debit: Debit) => void;
}

/**
 * Tabla de gastos con paginación server-side
 * Maneja:
 * - Fetch de datos desde el servidor
 * - Paginación
 * - Ordenamiento
 * - Acciones (editar, eliminar)
 */
export function DebitsTable({ onEdit, onDelete }: DebitsTableProps) {
  const [debits, setDebits] = useState<Debit[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const availablePageSizes = [10, 25, 50, 100];

  // Fetch debits del mes actual
  useEffect(() => {
    fetchDebits();
  }, [currentPage, pageSize]);

  const fetchDebits = async () => {
    try {
      setLoading(true);
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

      // Handle paginated responses
      if (Array.isArray(response)) {
        setDebits(response);
        setTotalItems(response.length);
      } else {
        setDebits(response.data || []);
        setTotalItems(response.total || 0);
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
      toast.error('Error al cargar los gastos');
      setDebits([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // Resetear a la primera página
  };

  if (loading && debits.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Cargando gastos...</p>
      </div>
    );
  }

  if (!loading && debits.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No hay gastos registrados para este período</p>
      </div>
    );
  }

  return (
    <DataTable
      columns={createDebitsColumns(onEdit, onDelete)}
      data={debits}
      initialSorting={[{ id: 'created_at', desc: true }]}
      serverSidePagination={{
        currentPage,
        pageSize,
        totalItems,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
        availablePageSizes,
      }}
    />
  );
}
