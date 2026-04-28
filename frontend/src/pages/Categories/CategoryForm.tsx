import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useDataRefresh } from '@/contexts'
import { categoriesService } from '@/services'
import { Category } from '@/types'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface CategoryFormProps {
  category?: Category
  onOpenChange: (open: boolean) => void
  onSuccess?: (category: Category) => void
}

interface FormErrors {
  name?: string[] | string
}

/**
 * Formulario para crear o editar una categoría
 *
 * @param category - Si se proporciona, el formulario entra en modo edición
 * @param onOpenChange - Callback para cerrar el diálogo
 * @param onSuccess - Callback post-create/update exitoso
 */
export function CategoryForm({ category, onOpenChange, onSuccess }: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const isEditMode = Boolean(category)
  const { triggerRefresh } = useDataRefresh()
  const [formData, setFormData] = useState({
    name: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Pre-poblar form si es modo edición
  useEffect(() => {
    if (isEditMode && category) {
      setFormData({
        name: category.name,
      })
    } else {
      setFormData({
        name: '',
      })
    }
    setErrors({})
  }, [category, isEditMode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      if (isEditMode && category) {
        // Update
        const updated = await categoriesService.update(category.id, formData)
        toast.success('Categoría actualizada exitosamente')
        triggerRefresh('category-updated')
        if (onSuccess) {
          onSuccess(updated)
        }
      } else {
        // Create
        const created = await categoriesService.create(formData)
        toast.success('Categoría creada exitosamente')
        triggerRefresh('category-created')
        if (onSuccess) {
          onSuccess(created)
        }
      }
      onOpenChange(false)
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any
      console.error('Error saving category:', err)
      // Handle validation errors from API
      if (err.data?.errors) {
        setErrors(err.data.errors)
      } else if (err.data?.message) {
        toast.error(err.data.message)
      } else {
        toast.error('Error al guardar la categoría')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field>
        <FieldLabel htmlFor="name">Nombre de la categoría</FieldLabel>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Ej: Groceries, Transportation..."
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
          required
        />
        {errors.name && (
          <FieldError>
            {Array.isArray(errors.name) ? errors.name.join(', ') : errors.name}
          </FieldError>
        )}
      </Field>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700">
          {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={loading}
          className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  )
}
