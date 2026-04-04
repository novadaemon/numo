import { useState } from 'react';
import { creditsService } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreditFormProps {
  onOpenChange: (open: boolean) => void;
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await creditsService.create({
        amount: parseFloat(formData.amount),
        observations: formData.observations || undefined,
        created_at: formData.created_at,
      });
      // Recargar la página para refrescar todos los datos
      window.location.reload();
    } catch (error) {
      console.error('Error creating credit:', error);
      alert('Error al crear el ingreso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Monto *</Label>
        <Input
          id="amount"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0.01"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations">Descripción (opcional)</Label>
        <Textarea
          id="observations"
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          placeholder="Fuente de ingreso, notas adicionales..."
          maxLength={500}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="created_at">Fecha y Hora *</Label>
        <Input
          id="created_at"
          type="datetime-local"
          name="created_at"
          value={formData.created_at}
          onChange={handleChange}
          required
        />
      </div>

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
