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
import { categoriesService } from '@/services'
import { Category } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { CategoriesTable } from './CategoriesTable'
import { CategoryForm } from './CategoryForm'

/**
 * Página CRUD para gestión de categorías
 * Renderiza:
 * - Tabla de categorías con paginación server-side
 * - Breadcrumb de navegación
 * - Form para crear/editar
 * - Dialogs de confirmación
 */
export function CategoriesPage() {
  const navigate = useNavigate()

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>()

  // Refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Delete confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleAddClick = () => {
    setSelectedCategory(undefined)
    setFormOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) {
      setSelectedCategory(undefined)
    }
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setFormOpen(true)
  }

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteOpen(true)
  }

  const handleFormSuccess = () => {
    // Cierra el form, limpia la categoría seleccionada y actualiza la tabla
    handleFormClose(false)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return

    setDeleting(true)
    try {
      await categoriesService.delete(categoryToDelete.id)
      toast.success('Categoría eliminada exitosamente')
      setDeleteOpen(false)
      setCategoryToDelete(null)
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Error al eliminar la categoría')
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
                <BreadcrumbPage>Categorías</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Gestión de Categorías</h1>
            <p className="text-gray-600">Administra todas tus categorías de gastos</p>
          </div>
        </div>

        {/* Add Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Categoría
          </Button>
        </div>

        {/* Table */}
        <div>
          <CategoriesTable
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
            <DialogTitle>{selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={selectedCategory}
            onOpenChange={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar categoría?"
        description="Esta acción no se puede deshacer. La categoría será eliminada permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
