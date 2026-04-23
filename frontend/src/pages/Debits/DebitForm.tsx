import { useState, useEffect } from 'react';
import { debitsService, categoriesService, placesService, conceptsService } from '@/services';
import { useDataRefresh } from '@/contexts';
import { Category, Place, Debit, Concept } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Autocomplete } from '@/components/ui/autocomplete';
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
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface DebitFormProps {
  debit?: Debit;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (debit: Debit) => void;
}

interface FormErrors {
  category_id?: string[] | string;
  place_id?: string[] | string;
  amount?: string[] | string;
  concept?: string[] | string;
  method?: string[] | string;
  observations?: string[] | string;
  expensed_at?: string[] | string;
}

/**
 * Formulario para crear o editar un gasto (debit)
 * 
 * @param debit - Si se proporciona, el formulario entra en modo edición
 * @param onOpenChange - Callback para cerrar el diálogo
 * @param onSuccess - Callback post-create/update exitoso
 */
export function DebitForm({ debit, onOpenChange, onSuccess }: DebitFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [creatingPlace, setCreatingPlace] = useState(false);
  
  // Concept autocomplete states
  const [conceptSearchValue, setConceptSearchValue] = useState('');
  const [conceptSuggestions, setConceptSuggestions] = useState<Concept[]>([]);
  
  const isEditMode = Boolean(debit);
  const { triggerRefresh } = useDataRefresh();
  const [formData, setFormData] = useState({
    category_id: '',
    place_id: '',
    concept: '',
    amount: '',
    method: 'debit',
    observations: '',
    expensed_at: new Date().toISOString().slice(0, 10),
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Cargar categorías y lugares al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const cats = await categoriesService.getAll();
        setCategories(cats);
        const placesList = await placesService.getAll();
        setPlaces(placesList);
        
        // Pre-poblar form si es modo edición (después de cargar datos)
        if (isEditMode && debit) {
          setFormData({
            category_id: debit.category_id.toString(),
            place_id: debit.place_id?.toString() || '',
            concept: debit.concept || '',
            amount: debit.amount.toString(),
            method: debit.method,
            observations: debit.observations || '',
            expensed_at: debit.expensed_at,
          });
          // Sincronizar conceptSearchValue para modo edición
          if (debit.concept) {
            setConceptSearchValue(debit.concept);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error al cargar datos');
      }
    };
    loadData();
  }, [debit, isEditMode]);

  // Reset form en modo creación
  useEffect(() => {
    if (!isEditMode) {
      setFormData({
        category_id: '',
        place_id: '',
        concept: '',
        amount: '',
        method: 'debit',
        observations: '',
        expensed_at: new Date().toISOString().slice(0, 10),
      });
      setErrors({});
    }
  }, [isEditMode]);

  // Limpiar error cuando el usuario interactúa con el campo concepto
  useEffect(() => {
    if (errors.concept && conceptSearchValue) {
      setErrors((prev) => ({
        ...prev,
        concept: undefined,
      }));
    }
  }, [conceptSearchValue, errors.concept]);

  // Search concepts with debounce
  useEffect(() => {
    // Si el campo está vacío, limpiar concept
    if (!conceptSearchValue.trim()) {
      setConceptSuggestions([]);
      setFormData((prev) => ({ ...prev, concept: '' }));
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const results = await conceptsService.search(conceptSearchValue);
        
        // If exactly one match and it's an exact match, treat as selection
        if (results.length === 1 && results[0].name === conceptSearchValue) {
          // Auto-select this concept
          setConceptSuggestions([]);
          setFormData((prev) => ({ ...prev, concept: conceptSearchValue }));
        } else {
          // Show suggestions
          setConceptSuggestions(results);
          
          // If no sugerencias, confirmar el valor actual
          if (results.length === 0) {
            setFormData((prev) => ({ ...prev, concept: conceptSearchValue }));
          }
        }
      } catch (error) {
        console.error('Error searching concepts:', error);
        setConceptSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [conceptSearchValue]);

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

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category_id: value,
    }));
    if (errors.category_id) {
      setErrors((prev) => ({
        ...prev,
        category_id: undefined,
      }));
    }
  };

  const handlePlaceChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      place_id: value,
    }));
    if (errors.place_id) {
      setErrors((prev) => ({
        ...prev,
        place_id: undefined,
      }));
    }
  };

  const handleMethodChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      method: value,
    }));
    if (errors.method) {
      setErrors((prev) => ({
        ...prev,
        method: undefined,
      }));
    }
  };

  const handleAddPlace = async () => {
    if (!newPlaceName.trim()) {
      toast.error('Por favor ingresa un nombre para el lugar');
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
      toast.success('Lugar creado exitosamente');
    } catch (error) {
      console.error('Error creating place:', error);
      toast.error('Error al crear el lugar');
    } finally {
      setCreatingPlace(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const debitData = {
        category_id: parseInt(formData.category_id),
        place_id: parseInt(formData.place_id),
        concept: formData.concept || undefined,
        amount: parseFloat(formData.amount),
        method: formData.method,
        observations: formData.observations || undefined,
        expensed_at: formData.expensed_at,
      };

      let result: Debit;
      if (isEditMode && debit) {
        result = await debitsService.update(debit.id, debitData);
        toast.success('Gasto actualizado exitosamente');
        triggerRefresh('debit-updated');
      } else {
        result = await debitsService.create(debitData);
        toast.success('Gasto creado exitosamente');
        triggerRefresh('debit-created');
      }

      onOpenChange(false);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error: unknown) {
      console.error('Error saving debit:', error);
      
      // Extract validation errors from backend response
      const err = error as Error & { data?: { errors?: Record<string, string[]>; error?: string } };
      if (err.data?.errors) {
        setErrors(err.data.errors);
      } else if (err.data?.error) {
        // Generic error message
        setErrors({
          category_id: err.data.error,
        });
      } else {
        // Network or other error
        toast.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} el gasto`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup>
        <Field invalid={!!errors.category_id}>
          <FieldLabel htmlFor="category">Categoría *</FieldLabel>
          <Select value={formData.category_id} onValueChange={handleCategoryChange}>
            <SelectTrigger aria-invalid={!!errors.category_id}>
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
          {errors.category_id && (
            <FieldError>{formatError(errors.category_id)}</FieldError>
          )}
        </Field>

        <Field invalid={!!errors.place_id}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="place">Lugar *</FieldLabel>
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
            <SelectTrigger aria-invalid={!!errors.place_id}>
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
          {errors.place_id && (
            <FieldError>{formatError(errors.place_id)}</FieldError>
          )}
        </Field>

        <Field invalid={!!errors.concept}>
          <FieldLabel htmlFor="concept">Concepto (opcional)</FieldLabel>
          <Autocomplete
            searchValue={conceptSearchValue}
            onSearchValueChange={setConceptSearchValue}
            items={conceptSuggestions}
            placeholder="Ej: Suscripción Netflix, Compra online, etc."
            maxLength={255}
          />
          {errors.concept && (
            <FieldError>{formatError(errors.concept)}</FieldError>
          )}
        </Field>

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

        <Field invalid={!!errors.method}>
          <FieldLabel htmlFor="method">Método de Pago *</FieldLabel>
          <Select value={formData.method} onValueChange={handleMethodChange}>
            <SelectTrigger aria-invalid={!!errors.method}>
              <SelectValue placeholder="Selecciona un método de pago" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="debit">Débito</SelectItem>
              <SelectItem value="cash">Efectivo</SelectItem>
              <SelectItem value="credit">Crédito</SelectItem>
            </SelectContent>
          </Select>
          {errors.method && (
            <FieldError>{formatError(errors.method)}</FieldError>
          )}
        </Field>

        <Field invalid={!!errors.observations}>
          <FieldLabel htmlFor="observations">Observaciones (opcional)</FieldLabel>
          <Textarea
            id="observations"
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            placeholder="Notas adicionales..."
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

        <Field invalid={!!errors.expensed_at}>
          <FieldLabel htmlFor="expensed_at">Fecha del Gasto *</FieldLabel>
          <Input
            id="expensed_at"
            type="date"
            name="expensed_at"
            value={formData.expensed_at}
            onChange={handleChange}
            aria-invalid={!!errors.expensed_at}
          />
          {errors.expensed_at && (
            <FieldError>{formatError(errors.expensed_at)}</FieldError>
          )}
        </Field>
      </FieldGroup>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1 bg-red-500 hover:bg-red-600">
          {loading ? 'Guardando...' : (isEditMode ? 'Actualizar Gasto' : 'Agregar Gasto')}
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
