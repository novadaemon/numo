import { Button } from '@/components/ui/button'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

/**
 * Encabezado sorteable reutilizable con indicadores direccionales
 * Muestra: Arriba (↑) ascendente, Abajo (↓) descendente, Doble (⇅) sin ordenar
 * 
 * @example
 * ```tsx
 * <SortableHeader column={column} title="Fecha" />
 * ```
 */
export const SortableHeader = ({
  column,
  title,
}: {
  column: any
  title: string
}) => {
  const sorted = column.getIsSorted()
  let icon = <ArrowUpDown className="ml-2 h-4 w-4" />
  
  if (sorted === 'asc') {
    icon = <ArrowUp className="ml-2 h-4 w-4" />
  } else if (sorted === 'desc') {
    icon = <ArrowDown className="ml-2 h-4 w-4" />
  }

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="h-8 p-0 hover:bg-transparent"
    >
      {title}
      {icon}
    </Button>
  )
}
