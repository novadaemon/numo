import { useState, useEffect } from 'react';
import { Debit } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { createDebitsColumns } from './debits-columns';
import { debitsService } from '@/services';
import type { FilterRule } from '@/components/Filters/types';
import toast from 'react-hot-toast';
import { SortingState } from '@tanstack/react-table';

interface DebitsTableProps {
  onEdit?: (debit: Debit) => void;
  onDelete?: (debit: Debit) => void;
  refreshTrigger?: number;
  filters?: FilterRule[];
}

/**
 * Tabla de gastos con paginación y ordenamiento server-side
 * Maneja:
 * - Fetch de datos desde el servidor
 * - Filtrado Notion-style
 * - Paginación server-side
 * - Ordenamiento server-side
 * - Acciones (editar, eliminar)
 */
export function DebitsTable({ 
  onEdit, 
  onDelete, 
  refreshTrigger = 0,
  filters = []
}: DebitsTableProps) {
  const [debits, setDebits] = useState<Debit[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_at', desc: true },
  ]);
  const availablePageSizes = [10, 25, 50, 100];

  // Fetch debits con filtros
  useEffect(() => {
    fetchDebits();
  }, [currentPage, pageSize, sorting, refreshTrigger, filters]);

  const fetchDebits = async () => {
    try {
      setLoading(true);

      // Get sort field and order from React Table sorting state
      let sortField: 'created_at' | 'category' | 'place' | 'amount' | 'concept' | 'method' = 'created_at';
      let sortOrder: 'asc' | 'desc' = 'desc';
      
      if (sorting.length > 0) {
        const sortConfig = sorting[0];
        const validFields = ['created_at', 'category', 'place', 'amount', 'concept', 'method'];
        if (validFields.includes(sortConfig.id)) {
          sortField = sortConfig.id as 'created_at' | 'category' | 'place' | 'amount' | 'concept' | 'method';
        }
        sortOrder = sortConfig.desc ? 'desc' : 'asc';
      }

      // Use filters from FilterBar
      const response = await debitsService.getAllWithFilters(
        filters,
        currentPage,
        pageSize,
        sortField,
        sortOrder
      );

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

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting);
    setCurrentPage(0); // Resetear a la primera página al cambiar sorting
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
      serverSidePagination={{
        currentPage,
        pageSize,
        totalItems,
        currentSorting: sorting,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
        onSortingChange: handleSortingChange,
        availablePageSizes,
      }}
    />
  );
}
