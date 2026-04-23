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
import { placesService } from '@/services'
import { Place } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { PlaceForm } from './PlaceForm'
import { PlacesTable } from './PlacesTable'

/**
 * Página CRUD para gestión de lugares
 * Renderiza:
 * - Tabla de places con paginación server-side
 * - Breadcrumb de navegación
 * - Form para crear/editar
 * - Dialogs de confirmación
 */
export function PlacesPage() {
  const navigate = useNavigate()

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<Place | undefined>()

  // Refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Delete confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [placeToDelete, setPlaceToDelete] = useState<Place | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleAddClick = () => {
    setSelectedPlace(undefined)
    setFormOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) {
      setSelectedPlace(undefined)
    }
  }

  const handleEdit = (place: Place) => {
    setSelectedPlace(place)
    setFormOpen(true)
  }

  const handleDelete = (place: Place) => {
    setPlaceToDelete(place)
    setDeleteOpen(true)
  }

  const handleFormSuccess = () => {
    // Cierra el form, limpia el lugar seleccionado y actualiza la tabla
    handleFormClose(false)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleConfirmDelete = async () => {
    if (!placeToDelete) return

    setDeleting(true)
    try {
      await placesService.delete(placeToDelete.id)
      toast.success('Lugar eliminado exitosamente')
      setDeleteOpen(false)
      setPlaceToDelete(null)
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error('Error deleting place:', error)
      toast.error('Error al eliminar el lugar')
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
                <BreadcrumbPage>Lugares</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Gestión de Lugares</h1>
            <p className="text-gray-600">Administra todos tus lugares de gasto</p>
          </div>
        </div>

        {/* Add Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Lugar
          </Button>
        </div>

        {/* Table */}
        <div>
          <PlacesTable
            onEdit={handleEdit}
            onDelete={handleDelete}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Form Dialog */}
        <Dialog open={formOpen} onOpenChange={handleFormClose}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedPlace ? 'Editar Lugar' : 'Nuevo Lugar'}</DialogTitle>
            </DialogHeader>
            <PlaceForm
              place={selectedPlace}
              onOpenChange={handleFormClose}
              onSuccess={handleFormSuccess}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteOpen}
          title="Eliminar Lugar"
          description={`¿Estás seguro de que quieres eliminar "${placeToDelete?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          isDestructive
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteOpen(false)
            setPlaceToDelete(null)
          }}
        />
      </div>
    </div>
  )
}
