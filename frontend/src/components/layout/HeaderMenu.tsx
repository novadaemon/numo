import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function HeaderMenu() {
  const navigate = useNavigate()

  const handleExpenses = () => {
    navigate('/debits')
  }

  const handleMonthlyExpenses = () => {
    navigate('/monthly-expenses')
  }

  const handleIncome = () => {
    navigate('/credits')
  }

  const handleCategories = () => {
    navigate('/categories')
  }

  const handlePlaces = () => {
    navigate('/places')
  }

  const handleConcepts = () => {
    navigate('/concepts')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-md p-2 transition-colors hover:bg-accent">
          <Menu className="h-6 w-6" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Gastos</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={handleExpenses}>Todos</DropdownMenuItem>
            <DropdownMenuItem onClick={handleMonthlyExpenses}>Por mes</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={handleIncome}>Ingresos</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Taxonomía</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={handleCategories}>Categorías</DropdownMenuItem>
            <DropdownMenuItem onClick={handlePlaces}>Lugares</DropdownMenuItem>
            <DropdownMenuItem onClick={handleConcepts}>Conceptos</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
