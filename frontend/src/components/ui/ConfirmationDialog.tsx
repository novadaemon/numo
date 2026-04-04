import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: 'destructive' | 'default';
  onConfirm: () => void | Promise<void>;
}

/**
 * Diálogo de confirmación reutilizable para acciones destructivas
 * (eliminar, cancelar, etc.)
 *
 * @example
 * const [openDelete, setOpenDelete] = useState(false);
 * const [debitToDelete, setDebitToDelete] = useState<Debit | null>(null);
 *
 * <ConfirmationDialog
 *   open={openDelete}
 *   onOpenChange={setOpenDelete}
 *   title="Eliminar gasto?"
 *   description="Esta acción no se puede deshacer"
 *   confirmText="Eliminar"
 *   cancelText="Cancelar"
 *   variant="destructive"
 *   loading={deleting}
 *   onConfirm={() => handleDelete(debitToDelete!.id)}
 * />
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  variant = 'default',
  onConfirm,
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done by the caller
      console.error('Confirmation error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Procesando...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
