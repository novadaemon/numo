import { DataTable } from '@/components/ui/data-table'
import { useDataRefresh } from '@/contexts'
import { placesService } from '@/services'
import type { Place } from '@/types'
import { SortingState } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { createPlacesColumns } from './places-columns'

interface PlacesTableProps {
  onEdit?: (place: Place) => void
  onDelete?: (place: Place) => void
  refreshTrigger?: number
}

/**
 * Tabla de places con paginación y ordenamiento server-side
 * Maneja:
 * - Fetch de datos desde el servidor
 * - Paginación server-side
 * - Ordenamiento server-side
 * - Acciones (editar, eliminar)
 */
export function PlacesTable({ onEdit, onDelete, refreshTrigger = 0 }: PlacesTableProps) {
  const [places, setPlaces] = useState<Place[]>([])
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
      // Refetch cuando hay cambios en places
      if (event === 'place-created' || event === 'place-updated' || event === 'place-deleted') {
        // Resetear página y triggear refetch
        setCurrentPage(0)
        setInternalRefreshTrigger((prev) => prev + 1)
      }
    })

    return unsubscribe
  }, [onRefresh])

  // Fetch places
  useEffect(() => {
    let isMounted = true
    let isRunning = false // Prevenir fetches concurrentes

    const fetchPlaces = async () => {
      // Prevenir múltiples fetches simultáneos
      if (isRunning) return

      try {
        isRunning = true
        setLoading(true)

        // Get sort field and order from React Table sorting state
        let sortField = 'name' as const
        let sortOrder: 'asc' | 'desc' = 'asc'

        if (sorting.length > 0) {
          const sortConfig = sorting[0]
          const validFields = ['name']
          if (validFields.includes(sortConfig.id)) {
            sortField = sortConfig.id as 'name'
          }
          sortOrder = sortConfig.desc ? 'desc' : 'asc'
        }

        const response = await placesService.getAll(currentPage, pageSize, sortField, sortOrder)

        if (!isMounted) return

        // Handle paginated responses
        setPlaces(response.data || [])
        setTotalItems(response.total || 0)
      } catch (error) {
        if (isMounted) {
          console.error('❌ Error fetching table data:', error)
          toast.error('Error al cargar los lugares')
          setPlaces([])
          setTotalItems(0)
        }
      } finally {
        isRunning = false
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchPlaces()

    return () => {
      isMounted = false
    }
  }, [currentPage, pageSize, sorting, internalRefreshTrigger, refreshTrigger])

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

  if (loading && places.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Cargando lugares...</p>
      </div>
    )
  }

  if (!loading && places.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No hay lugares registrados</p>
      </div>
    )
  }

  return (
    <DataTable
      columns={createPlacesColumns(onEdit, onDelete)}
      data={places}
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
