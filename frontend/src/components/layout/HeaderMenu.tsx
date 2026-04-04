import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

export function HeaderMenu() {
  const navigate = useNavigate();

  const handleExpenses = () => {
    navigate('/debits');
  };

  const handleIncome = () => {
    navigate('/credits');
  };

  const handleCategories = () => {
    navigate('/categories');
  };

  const handlePlaces = () => {
    navigate('/places');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 hover:bg-accent rounded-md transition-colors">
          <Menu className="h-6 w-6" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleExpenses}>
          Gastos
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleIncome}>
          Ingresos
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            Taxonomía
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={handleCategories}>
              Categorías
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePlaces}>
              Lugares/Conceptos
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
