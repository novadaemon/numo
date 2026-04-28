import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useDataRefresh } from '@/contexts'
import { creditsService } from '@/services'
import { Credit } from '@/types'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface CreditFormProps {
  credit?: Credit
  onOpenChange: (open: boolean) => void
  onSuccess?: (credit: Credit) => void
}

interface FormErrors {
  amount?: string[] | string
  observations?: string[] | string
  credited_at?: string[] | string
}

/**
 * Formulario para agregar o editar un ingreso (credit)
 * Modo crear: sin prop `credit`
 * Modo editar: con prop `credit` que pre-rellena el formulario
 */
export function CreditForm({ credit, onOpenChange, onSuccess }: CreditFormProps) {
  const [loading, setLoading] = useState(false)
  const { triggerRefresh } = useDataRefresh()
  const [formData, setFormData] = useState({
    amount: '',
    observations: '',
    credited_at: new Date().toISOString().slice(0, 10),
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Initialize form data from credit prop if in edit mode
  useEffect(() => {
    if (credit) {
      setFormData({
        amount: credit.amount.toString(),
        observations: credit.observations || '',
        credited_at: credit.credited_at,
      })
    }
  }, [credit])

  const isEditMode = !!credit

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const formatError = (error: string[] | string): string => {
    if (Array.isArray(error)) {
      return error[0] // Show first error message
    }
    return error
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const creditData = {
        amount: parseFloat(formData.amount),
        observations: formData.observations || undefined,
        credited_at: formData.credited_at,
      }

      let result: Credit
      if (isEditMode && credit) {
        // Edit mode
        result = await creditsService.update(credit.id, creditData)
        toast.success('Ingreso actualizado exitosamente')
        triggerRefresh('credit-updated')
      } else {
        // Create mode
        result = await creditsService.create(creditData)
        toast.success('Ingreso creado exitosamente')
        triggerRefresh('credit-created')
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result)
      }

      // Cerrar el diálogo
      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error saving credit:', error)

      // Extract validation errors from backend response
      const err = error as Error & { data?: { errors?: Record<string, string[]>; error?: string } }
      if (err.data?.errors) {
        setErrors(err.data.errors)
      } else if (err.data?.error) {
        // Generic error message
        setErrors({
          amount: err.data.error,
        })
      } else {
        // Network or other error
        setErrors({
          amount: 'Error al guardar el ingreso. Por favor intenta nuevamente.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup>
        <Field invalid={!!errors.amount}>
          <FieldLabel htmlFor="amount">Monto *</FieldLabel>
          <Input
            id="amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            aria-invalid={!!errors.amount}
          />
          {errors.amount && <FieldError>{formatError(errors.amount)}</FieldError>}
        </Field>

        <Field invalid={!!errors.observations}>
          <FieldLabel htmlFor="observations">Observaciones (opcional)</FieldLabel>
          <Textarea
            id="observations"
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            placeholder="Fuente de ingreso, notas adicionales..."
            maxLength={500}
            rows={3}
            aria-invalid={!!errors.observations}
          />
          {formData.observations && (
            <div className="text-xs text-muted-foreground">{formData.observations.length}/500</div>
          )}
          {errors.observations && <FieldError>{formatError(errors.observations)}</FieldError>}
        </Field>

        <Field invalid={!!errors.credited_at}>
          <FieldLabel htmlFor="credited_at">Fecha del Ingreso *</FieldLabel>
          <Input
            id="credited_at"
            type="date"
            name="credited_at"
            value={formData.credited_at}
            onChange={handleChange}
            aria-invalid={!!errors.credited_at}
          />
          {errors.credited_at && <FieldError>{formatError(errors.credited_at)}</FieldError>}
        </Field>
      </FieldGroup>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1 bg-green-500 hover:bg-green-600">
          {loading ? 'Guardando...' : isEditMode ? 'Actualizar Ingreso' : 'Agregar Ingreso'}
        </Button>
        <Button
          type="button"
          onClick={() => onOpenChange(false)}
          disabled={loading}
          variant="outline"
          className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  )
}
