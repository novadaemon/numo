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
  const handleExpenses = () => {
    console.log('Navigate to Gastos');
  };

  const handleIncome = () => {
    console.log('Navigate to Ingresos');
  };

  const handleCategories = () => {
    console.log('Navigate to Categorías');
  };

  const handlePlaces = () => {
    console.log('Navigate to Lugares');
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
              Lugares
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
