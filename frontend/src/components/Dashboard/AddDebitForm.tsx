import { useState, useEffect } from 'react';
import { debitsService, categoriesService } from '@/services';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface AddDebitFormProps {
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Formulario para agregar un nuevo gasto (debit)
 */
export function AddDebitForm({ onOpenChange, onSuccess }: AddDebitFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    concept: '',
    observations: '',
  });

  // Cargar categorías al montar
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoriesService.getAll();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category_id: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await debitsService.create({
        category_id: parseInt(formData.category_id),
        amount: parseFloat(formData.amount),
        concept: formData.concept,
        observations: formData.observations || undefined,
      });
      setFormData({
        category_id: '',
        amount: '',
        concept: '',
        observations: '',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating debit:', error);
      alert('Error al crear el gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Categoría *</Label>
        <Select value={formData.category_id} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
        <Label htmlFor="concept">Concepto *</Label>
        <Input
          id="concept"
          type="text"
          name="concept"
          value={formData.concept}
          onChange={handleChange}
          placeholder="Descripción del gasto"
          required
          maxLength={255}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations">Observaciones (opcional)</Label>
        <Textarea
          id="observations"
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          placeholder="Notas adicionales..."
          maxLength={500}
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1 bg-red-500 hover:bg-red-600">
          {loading ? 'Guardando...' : 'Agregar Gasto'}
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
