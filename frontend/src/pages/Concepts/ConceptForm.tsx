import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useDataRefresh } from '@/contexts'
import { conceptsService } from '@/services'
import { Concept } from '@/types'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface ConceptFormProps {
  concept?: Concept
  onOpenChange: (open: boolean) => void
  onSuccess?: (concept: Concept) => void
}

interface FormErrors {
  name?: string[] | string
}

/**
 * Formulario para crear o editar un concepto
 *
 * @param concept - Si se proporciona, el formulario entra en modo edición
 * @param onOpenChange - Callback para cerrar el diálogo
 * @param onSuccess - Callback post-create/update exitoso
 */
export function ConceptForm({ concept, onOpenChange, onSuccess }: ConceptFormProps) {
  const [loading, setLoading] = useState(false)
  const isEditMode = Boolean(concept)
  const { triggerRefresh } = useDataRefresh()
  const [formData, setFormData] = useState({
    name: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Pre-poblar form si es modo edición
  useEffect(() => {
    if (isEditMode && concept) {
      setFormData({
        name: concept.name,
      })
    } else {
      setFormData({
        name: '',
      })
    }
    setErrors({})
  }, [concept, isEditMode])

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
      if (isEditMode && concept) {
        // Update
        const updated = await conceptsService.update(concept.id, formData)
        toast.success('Concepto actualizado exitosamente')
        triggerRefresh('concept-updated')
        if (onSuccess) {
          onSuccess(updated)
        }
      } else {
        // Create
        const created = await conceptsService.create(formData)
        toast.success('Concepto creado exitosamente')
        triggerRefresh('concept-created')
        if (onSuccess) {
          onSuccess(created)
        }
      }
      onOpenChange(false)
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any
      console.error('Error saving concept:', err)
      // Handle validation errors from API
      if (err.data?.errors) {
        setErrors(err.data.errors)
      } else if (err.data?.message) {
        toast.error(err.data.message)
      } else {
        toast.error('Error al guardar el concepto')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field>
        <FieldLabel htmlFor="name">Nombre del concepto</FieldLabel>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Ej: Alquiler, Servicios, Alimentación..."
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
