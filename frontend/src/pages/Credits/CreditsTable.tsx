import { DataTable } from '@/components/ui/data-table'
import { useDataRefresh } from '@/contexts'
import { creditsService } from '@/services'
import { Credit } from '@/types'
import type { FilterRule } from '@/types/filters'
import { SortingState } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { createCreditsColumns } from './credits-columns'

interface CreditsTableProps {
  onEdit?: (credit: Credit) => void
  onDelete?: (credit: Credit) => void
  refreshTrigger?: number
  filters?: FilterRule[]
}

/**
 * Tabla de ingresos con paginación y ordenamiento server-side
 * Maneja:
 * - Fetch de datos desde el servidor
 * - Filtrado Notion-style
 * - Paginación server-side
 * - Ordenamiento server-side
 * - Acciones (editar, eliminar)
 */
export function CreditsTable({
  onEdit,
  onDelete,
  refreshTrigger = 0,
  filters = [],
}: CreditsTableProps) {
  const [credits, setCredits] = useState<Credit[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'credited_at', desc: true }])
  const availablePageSizes = [10, 25, 50, 100]

  // Memoize filters to prevent unnecessary re-renders when filters reference changes
  const memoizedFilters = useMemo(() => filters, [filters])

  // Trigger para refetch cuando hay cambios
  const [internalRefreshTrigger, setInternalRefreshTrigger] = useState(0)
  const { onRefresh } = useDataRefresh()

  // Suscribirse a eventos de actualización de datos
  useEffect(() => {
    const unsubscribe = onRefresh((event) => {
      // Refetch cuando hay cambios en créditos
      if (event === 'credit-created' || event === 'credit-updated' || event === 'credit-deleted') {
        // Resetear página y triggear refetch
        setCurrentPage(0)
        setInternalRefreshTrigger((prev) => prev + 1)
      }
    })

    return unsubscribe
  }, [onRefresh])

  // Fetch credits con filtros
  useEffect(() => {
    let isMounted = true
    let isRunning = false // Prevenir fetches concurrentes

    const fetchCredits = async () => {
      // Prevenir múltiples fetches simultáneos
      if (isRunning) return

      try {
        isRunning = true
        setLoading(true)

        // Get sort field and order from React Table sorting state
        let sortField: 'credited_at' | 'amount' | 'observations' = 'credited_at'
        let sortOrder: 'asc' | 'desc' = 'desc'

        if (sorting.length > 0) {
          const sortConfig = sorting[0]
          const validFields = ['credited_at', 'amount', 'observations']
          if (validFields.includes(sortConfig.id)) {
            sortField = sortConfig.id as 'credited_at' | 'amount' | 'observations'
          }
          sortOrder = sortConfig.desc ? 'desc' : 'asc'
        }

        // Use filters from FilterBar
        const response = await creditsService.getAllWithFilters(
          memoizedFilters,
          currentPage,
          pageSize,
          sortField,
          sortOrder
        )

        if (!isMounted) return

        // Handle paginated responses
        if (Array.isArray(response)) {
          setCredits(response)
          setTotalItems(response.length)
        } else {
          setCredits(response.data || [])
          setTotalItems(response.total || 0)
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching table data:', error)
          toast.error('Error al cargar los ingresos')
          setCredits([])
          setTotalItems(0)
        }
      } finally {
        isRunning = false
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchCredits()

    return () => {
      isMounted = false
    }
  }, [currentPage, pageSize, sorting, refreshTrigger, internalRefreshTrigger, memoizedFilters])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(0) // Resetear a la primera página
  }

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting)
    setCurrentPage(0) // Resetear a la primera página al cambiar sorting
  }

  if (loading && credits.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Cargando ingresos...</p>
      </div>
    )
  }

  if (!loading && credits.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No hay ingresos registrados para este período</p>
      </div>
    )
  }

  return (
    <DataTable
      columns={createCreditsColumns(onEdit, onDelete)}
      data={credits}
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
  )
}
