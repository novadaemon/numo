import { DataTable } from '@/components/ui/data-table'
import { useDataRefresh } from '@/contexts'
import { conceptsService } from '@/services'
import type { Concept } from '@/types'
import { SortingState } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { createConceptsColumns } from './concepts-columns'

interface ConceptsTableProps {
  onEdit?: (concept: Concept) => void
  onDelete?: (concept: Concept) => void
  refreshTrigger?: number
}

/**
 * Tabla de conceptos con paginación y ordenamiento server-side
 * Maneja:
 * - Fetch de datos desde el servidor
 * - Paginación server-side
 * - Ordenamiento server-side
 * - Acciones (editar, eliminar)
 */
export function ConceptsTable({ onEdit, onDelete, refreshTrigger = 0 }: ConceptsTableProps) {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const availablePageSizes = [10, 25, 50, 100]

  // Trigger para refetch cuando hay cambios
  const [internalRefreshTrigger, setInternalRefreshTrigger] = useState(0)
  const { onRefresh } = useDataRefresh()

  // Suscribirse a eventos de actualización de datos
  useEffect(() => {
    const unsubscribe = onRefresh((event) => {
      if (
        event === 'concept-created' ||
        event === 'concept-updated' ||
        event === 'concept-deleted'
      ) {
        setCurrentPage(0)
        setInternalRefreshTrigger((prev) => prev + 1)
      }
    })

    return unsubscribe
  }, [onRefresh])

  // Fetch concepts
  useEffect(() => {
    let isMounted = true
    let isRunning = false

    const fetchConcepts = async () => {
      if (isRunning) return

      try {
        isRunning = true
        setLoading(true)

        let sortField: 'name' = 'name'
        let sortOrder: 'asc' | 'desc' = 'asc'

        if (sorting.length > 0) {
          const sortConfig = sorting[0]
          const validFields = ['name']
          if (validFields.includes(sortConfig.id)) {
            sortField = sortConfig.id as 'name'
          }
          sortOrder = sortConfig.desc ? 'desc' : 'asc'
        }

        const response = await conceptsService.getAll(currentPage, pageSize, sortField, sortOrder)

        if (!isMounted) return

        setConcepts(response.data || [])
        setTotalItems(response.total || 0)
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching table data:', error)
          toast.error('Error al cargar los conceptos')
          setConcepts([])
          setTotalItems(0)
        }
      } finally {
        isRunning = false
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchConcepts()

    return () => {
      isMounted = false
    }
  }, [currentPage, pageSize, sorting, refreshTrigger, internalRefreshTrigger])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(0)
  }

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting)
    setCurrentPage(0)
  }

  if (loading && concepts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Cargando conceptos...</p>
      </div>
    )
  }

  if (!loading && concepts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No hay conceptos registrados</p>
      </div>
    )
  }

  return (
    <DataTable
      columns={createConceptsColumns(onEdit, onDelete)}
      data={concepts}
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
