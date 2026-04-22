import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Command({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-md border border-gray-200', className)}>
      {children}
    </div>
  )
}

export function CommandInput() {
  return null
}

export function CommandList({ children }: { children: ReactNode }) {
  return (
    <div className="max-h-[300px] overflow-y-auto">
      {children}
    </div>
  )
}

export function CommandEmpty({ children }: { children: ReactNode }) {
  return <div className="py-6 text-center text-sm text-gray-500">{children}</div>
}

export function CommandGroup({
  heading,
  children,
}: {
  heading?: string
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden p-1">
      {heading && (
        <div className="px-2 py-1.5 text-xs font-medium text-gray-500">{heading}</div>
      )}
      <div>{children}</div>
    </div>
  )
}

export function CommandItem({
  onSelect,
  children,
  className,
}: {
  onSelect: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100',
        className
      )}>
      {children}
    </button>
  )
}
