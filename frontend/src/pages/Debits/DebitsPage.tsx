import { FilterBar, deserializeFilters, serializeFilters } from '@/components/Filters/FilterBar'
import type { FilterRule } from '@/components/Filters/types'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { debitsService } from '@/services'
import { Debit } from '@/types'
import type { FilterFieldConfig } from '@/types/filters'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DebitForm } from './DebitForm'
import { DebitsTable } from './DebitsTable'
import { getDebitsFilterFields } from './debitsFilterFields'

/**
 * Página CRUD para gestión de gastos (debits)
 * Renderiza:
 * - Barra de filtros Notion-style
 * - Tabla de gastos con paginación server-side
 * - Breadcrumb de navegación
 * - Form para crear/editar
 * - Dialogs de confirmación
 */
export function DebitsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter state
  const [filters, setFilters] = useState<FilterRule[]>(() => {
    const filtersParam = searchParams.get('filters')
    if (filtersParam) {
      try {
        return deserializeFilters(JSON.parse(filtersParam))
      } catch {
        return []
      }
    }
    return []
  })

  const [filterFields, setFilterFields] = useState<FilterFieldConfig[]>([])
  const [loadingFields, setLoadingFields] = useState(true)

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [selectedDebit, setSelectedDebit] = useState<Debit | undefined>()

  // Refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Delete confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [debitToDelete, setDebitToDelete] = useState<Debit | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Load filter fields on mount
  useEffect(() => {
    const loadFields = async () => {
      try {
        const fields = await getDebitsFilterFields()
        setFilterFields(fields)
      } catch (error) {
        console.error('Error loading filter fields:', error)
        toast.error('Error loading filters')
      } finally {
        setLoadingFields(false)
      }
    }

    loadFields()
  }, [])

  // Sync filters to URL params
  useEffect(() => {
    const serialized = serializeFilters(filters)
    if (serialized.length > 0) {
      setSearchParams({ filters: JSON.stringify(serialized) })
    } else {
      setSearchParams({})
    }
  }, [filters, setSearchParams])

  const handleFiltersChange = (newFilters: FilterRule[]) => {
    setFilters(newFilters)
  }

  const handleAddClick = () => {
    setSelectedDebit(undefined)
    setFormOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) {
      setSelectedDebit(undefined)
    }
  }

  const handleEdit = (debit: Debit) => {
    setSelectedDebit(debit)
    setFormOpen(true)
  }

  const handleDelete = (debit: Debit) => {
    setDebitToDelete(debit)
    setDeleteOpen(true)
  }

  const handleFormSuccess = () => {
    // Cierra el form, limpia el debit seleccionado y actualiza la tabla
    handleFormClose(false)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleConfirmDelete = async () => {
    if (!debitToDelete) return

    setDeleting(true)
    try {
      await debitsService.delete(debitToDelete.id)
      toast.success('Gasto eliminado exitosamente')
      setDeleteOpen(false)
      setDebitToDelete(null)
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error('Error deleting debit:', error)
      toast.error('Error al eliminar el gasto')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/')
                  }}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Gastos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Gestión de Gastos</h1>
            <p className="text-gray-600">Administra todos tus gastos</p>
          </div>
        </div>

        {/* Add Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Gasto
          </Button>
        </div>

        {/* Table */}
        <div>
          {!loadingFields && (
            <>
              <FilterBar fields={filterFields} value={filters} onChange={handleFiltersChange} />
            </>
          )}
          <DebitsTable
            onEdit={handleEdit}
            onDelete={handleDelete}
            refreshTrigger={refreshTrigger}
            filters={filters}
          />
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedDebit ? 'Editar Gasto' : 'Nuevo Gasto'}</DialogTitle>
          </DialogHeader>
          <DebitForm
            debit={selectedDebit}
            onOpenChange={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar gasto?"
        description="Esta acción no se puede deshacer. El gasto será eliminado permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
