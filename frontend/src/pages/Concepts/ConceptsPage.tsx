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
import { conceptsService } from '@/services'
import { Concept } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { ConceptForm } from './ConceptForm'
import { ConceptsTable } from './ConceptsTable'

/**
 * Página CRUD para gestión de conceptos
 * Renderiza:
 * - Tabla de conceptos con paginación server-side
 * - Breadcrumb de navegación
 * - Form para crear/editar
 * - Dialogs de confirmación
 */
export function ConceptsPage() {
  const navigate = useNavigate()

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [selectedConcept, setSelectedConcept] = useState<Concept | undefined>()

  // Refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Delete confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [conceptToDelete, setConceptToDelete] = useState<Concept | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleAddClick = () => {
    setSelectedConcept(undefined)
    setFormOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) {
      setSelectedConcept(undefined)
    }
  }

  const handleEdit = (concept: Concept) => {
    setSelectedConcept(concept)
    setFormOpen(true)
  }

  const handleDelete = (concept: Concept) => {
    setConceptToDelete(concept)
    setDeleteOpen(true)
  }

  const handleFormSuccess = () => {
    handleFormClose(false)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleConfirmDelete = async () => {
    if (!conceptToDelete) return

    setDeleting(true)
    try {
      await conceptsService.delete(conceptToDelete.id)
      toast.success('Concepto eliminado exitosamente')
      setDeleteOpen(false)
      setConceptToDelete(null)
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error('Error deleting concept:', error)
      toast.error('Error al eliminar el concepto')
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
                <BreadcrumbPage>Conceptos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Gestión de Conceptos</h1>
            <p className="text-gray-600">Administra todos tus conceptos de gastos</p>
          </div>
        </div>

        {/* Add Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Concepto
          </Button>
        </div>

        {/* Table */}
        <div>
          <ConceptsTable
            onEdit={handleEdit}
            onDelete={handleDelete}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedConcept ? 'Editar Concepto' : 'Nuevo Concepto'}</DialogTitle>
          </DialogHeader>
          <ConceptForm
            concept={selectedConcept}
            onOpenChange={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar concepto?"
        description="Esta acción no se puede deshacer. El concepto será eliminado permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
