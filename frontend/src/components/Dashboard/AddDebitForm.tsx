import { useState, useEffect } from 'react';
import { debitsService, categoriesService, placesService } from '@/services';
import { Category, Place } from '@/types';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface AddDebitFormProps {
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Formulario para agregar un nuevo gasto (debit)
 */
export function AddDebitForm({ onOpenChange, onSuccess }: AddDebitFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [creatingPlace, setCreatingPlace] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    place_id: '',
    amount: '',
    concept: '',
    observations: '',
  });

  // Cargar categorías y lugares al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const cats = await categoriesService.getAll();
        setCategories(cats);
        const placesList = await placesService.getAll();
        setPlaces(placesList);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
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

  const handlePlaceChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      place_id: value,
    }));
  };

  const handleAddPlace = async () => {
    if (!newPlaceName.trim()) {
      alert('Por favor ingresa un nombre para el lugar');
      return;
    }

    setCreatingPlace(true);
    try {
      const newPlace = await placesService.create({ name: newPlaceName });
      setPlaces((prev) => [...prev, newPlace]);
      setFormData((prev) => ({
        ...prev,
        place_id: newPlace.id.toString(),
      }));
      setNewPlaceName('');
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating place:', error);
      alert('Error al crear el lugar');
    } finally {
      setCreatingPlace(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await debitsService.create({
        category_id: parseInt(formData.category_id),
        place_id: formData.place_id ? parseInt(formData.place_id) : undefined,
        amount: parseFloat(formData.amount),
        concept: formData.concept,
        observations: formData.observations || undefined,
      });
      setFormData({
        category_id: '',
        place_id: '',
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
        <div className="flex items-center justify-between">
          <Label htmlFor="place">Lugar (opcional)</Label>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-6 px-2">
                <Plus className="h-4 w-4 mr-1" />
                Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar nuevo lugar</DialogTitle>
                <DialogDescription>
                  Ingresa el nombre del lugar donde realizaste este gasto
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Ej: Supermercado, Farmacia, etc."
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  disabled={creatingPlace}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddPlace();
                    }
                  }}
                />
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={creatingPlace}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddPlace}
                    disabled={creatingPlace}
                  >
                    {creatingPlace ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Select value={formData.place_id} onValueChange={handlePlaceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un lugar" />
          </SelectTrigger>
          <SelectContent searchable>
            {places.map((place) => (
              <SelectItem key={place.id} value={place.id.toString()}>
                {place.name}
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
