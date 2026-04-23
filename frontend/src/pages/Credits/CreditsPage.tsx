import { FilterBar, deserializeFilters, serializeFilters } from '@/components/Filters/FilterBar'
import type { FilterRule } from '@/components/Filters/types'
import { CreditForm } from '@/components/Forms/CreditForm'
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
import { creditsService } from '@/services'
import { Credit } from '@/types'
import type { FilterFieldConfig } from '@/types/filters'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CreditsTable } from './CreditsTable'
import { getCreditsFilterFields } from './creditsFilterFields'

/**
 * Página CRUD para gestión de ingresos (credits)
 * Renderiza:
 * - Barra de filtros Notion-style
 * - Tabla de ingresos con paginación server-side
 * - Breadcrumb de navegación
 * - Form para crear/editar
 * - Dialogs de confirmación
 */
export function CreditsPage() {
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
  const [selectedCredit, setSelectedCredit] = useState<Credit | undefined>()

  // Refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Delete confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [creditToDelete, setCreditToDelete] = useState<Credit | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Load filter fields on mount
  useEffect(() => {
    const loadFields = async () => {
      try {
        const fields = await getCreditsFilterFields()
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
    setSelectedCredit(undefined)
    setFormOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) {
      setSelectedCredit(undefined)
    }
  }

  const handleEdit = (credit: Credit) => {
    setSelectedCredit(credit)
    setFormOpen(true)
  }

  const handleDelete = (credit: Credit) => {
    setCreditToDelete(credit)
    setDeleteOpen(true)
  }

  const handleFormSuccess = () => {
    // Cierra el form, limpia el credit seleccionado y actualiza la tabla
    handleFormClose(false)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleConfirmDelete = async () => {
    if (!creditToDelete) return

    setDeleting(true)
    try {
      await creditsService.delete(creditToDelete.id)
      toast.success('Ingreso eliminado exitosamente')
      setDeleteOpen(false)
      setCreditToDelete(null)
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error('Error deleting credit:', error)
      toast.error('Error al eliminar el ingreso')
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
                <BreadcrumbPage>Ingresos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Gestión de Ingresos</h1>
            <p className="text-gray-600">Administra todos tus ingresos</p>
          </div>
        </div>

        {/* Add Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={handleAddClick} className="bg-green-500 text-white hover:bg-green-600">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Ingreso
          </Button>
        </div>

        {/* Table */}
        <div>
          {!loadingFields && (
            <>
              <FilterBar fields={filterFields} value={filters} onChange={handleFiltersChange} />
            </>
          )}
          <CreditsTable
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
            <DialogTitle>{selectedCredit ? 'Editar Ingreso' : 'Nuevo Ingreso'}</DialogTitle>
          </DialogHeader>
          <CreditForm
            credit={selectedCredit}
            onOpenChange={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar ingreso?"
        description="Esta acción no se puede deshacer. El ingreso será eliminado permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
