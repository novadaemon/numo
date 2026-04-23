import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useDataRefresh } from '@/contexts'
import { placesService } from '@/services'
import { Place } from '@/types'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface PlaceFormProps {
  place?: Place
  onOpenChange: (open: boolean) => void
  onSuccess?: (place: Place) => void
}

interface FormErrors {
  name?: string[] | string
}

/**
 * Formulario para crear o editar un lugar
 *
 * @param place - Si se proporciona, el formulario entra en modo edición
 * @param onOpenChange - Callback para cerrar el diálogo
 * @param onSuccess - Callback post-create/update exitoso
 */
export function PlaceForm({ place, onOpenChange, onSuccess }: PlaceFormProps) {
  const [loading, setLoading] = useState(false)
  const isEditMode = Boolean(place)
  const { triggerRefresh } = useDataRefresh()
  const [formData, setFormData] = useState({
    name: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Pre-poblar form si es modo edición
  useEffect(() => {
    if (isEditMode && place) {
      setFormData({
        name: place.name,
      })
    } else {
      setFormData({
        name: '',
      })
    }
    setErrors({})
  }, [place, isEditMode])

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
      if (isEditMode && place) {
        // Update
        const updated = await placesService.update(place.id, formData)
        toast.success('Lugar actualizado exitosamente')
        triggerRefresh('place-updated')
        if (onSuccess) {
          onSuccess(updated)
        }
      } else {
        // Create
        const created = await placesService.create(formData)
        toast.success('Lugar creado exitosamente')
        triggerRefresh('place-created')
        if (onSuccess) {
          onSuccess(created)
        }
      }
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error saving place:', error)
      // Handle validation errors from API
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Error al guardar el lugar')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field>
        <FieldLabel htmlFor="name">Nombre del lugar</FieldLabel>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Ej: Supermercado Carrefour"
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
