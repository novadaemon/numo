import { useState } from 'react';
import { creditsService } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field';

interface CreditFormProps {
  onOpenChange: (open: boolean) => void;
}

interface FormErrors {
  amount?: string[] | string;
  observations?: string[] | string;
  created_at?: string[] | string;
}

/**
 * Formulario para agregar un nuevo ingreso (credit)
 */
export function CreditForm({ onOpenChange }: CreditFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    observations: '',
    created_at: new Date().toISOString().slice(0, 16),
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const formatError = (error: string[] | string): string => {
    if (Array.isArray(error)) {
      return error[0]; // Show first error message
    }
    return error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await creditsService.create({
        amount: parseFloat(formData.amount),
        observations: formData.observations || undefined,
        created_at: formData.created_at,
      });
      // Recargar la página para refrescar todos los datos
      window.location.reload();
    } catch (error: unknown) {
      console.error('Error creating credit:', error);
      
      // Extract validation errors from backend response
      const err = error as Error & { data?: { errors?: Record<string, string[]>; error?: string } };
      if (err.data?.errors) {
        setErrors(err.data.errors);
      } else if (err.data?.error) {
        // Generic error message
        setErrors({
          amount: err.data.error,
        });
      } else {
        // Network or other error
        setErrors({
          amount: 'Error al crear el ingreso. Por favor intenta nuevamente.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

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
          {errors.amount && (
            <FieldError>{formatError(errors.amount)}</FieldError>
          )}
        </Field>

        <Field invalid={!!errors.observations}>
          <FieldLabel htmlFor="observations">Descripción (opcional)</FieldLabel>
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
            <div className="text-xs text-muted-foreground">
              {formData.observations.length}/500
            </div>
          )}
          {errors.observations && (
            <FieldError>{formatError(errors.observations)}</FieldError>
          )}
        </Field>

        <Field invalid={!!errors.created_at}>
          <FieldLabel htmlFor="created_at">Fecha y Hora *</FieldLabel>
          <Input
            id="created_at"
            type="datetime-local"
            name="created_at"
            value={formData.created_at}
            onChange={handleChange}
            aria-invalid={!!errors.created_at}
          />
          {errors.created_at && (
            <FieldError>{formatError(errors.created_at)}</FieldError>
          )}
        </Field>
      </FieldGroup>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1 bg-green-500 hover:bg-green-600">
          {loading ? 'Guardando...' : 'Agregar Ingreso'}
        </Button>
        <Button
          type="button"
          onClick={() => onOpenChange(false)}
          disabled={loading}
          variant="outline"
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
