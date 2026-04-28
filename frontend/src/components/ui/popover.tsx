import { cn } from '@/lib/utils'
import React, { ReactNode, useEffect, useRef } from 'react'

type PopoverContextType = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined)

export function Popover({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  return (
    <PopoverContext.Provider value={{ open, onOpenChange }}>
      <div className="relative">{children}</div>
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({ asChild, children }: { asChild?: boolean; children: ReactNode }) {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error('PopoverTrigger must be used within Popover')

  const child = React.Children.only(children) as React.ReactElement
  const handleClick = () => {
    context.onOpenChange(!context.open)
  }

  if (asChild) {
    return React.cloneElement(child, {
      onClick: handleClick,
      'data-popover-trigger': true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  }

  return (
    <div onClick={handleClick} data-popover-trigger>
      {children}
    </div>
  )
}

export function PopoverContent({
  align = 'start',
  children,
  className,
}: {
  align?: 'start' | 'end' | 'center'
  children: ReactNode
  className?: string
}) {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error('PopoverContent must be used within Popover')

  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Check if click is on the trigger by searching up the DOM tree
      let isTrigger = false
      let current = target
      while (current) {
        if (current.hasAttribute('data-popover-trigger')) {
          isTrigger = true
          break
        }
        current = current.parentElement as HTMLElement
      }

      // Check if click is inside the popover content
      const isInPopover = contentRef.current && contentRef.current.contains(target)

      // Check if click is within a Radix UI portal (like SelectContent, etc)
      // This prevents closing the popover when interacting with dropdowns
      let isInRadixPortal = false
      current = target
      while (current) {
        // Check for Radix UI portal attributes
        if (
          current.hasAttribute('data-radix-select-content') ||
          current.hasAttribute('data-radix-command-item') ||
          (current.hasAttribute('role') && current.getAttribute('role') === 'listbox')
        ) {
          isInRadixPortal = true
          break
        }
        current = current.parentElement as HTMLElement
      }

      // Only close if click is OUTSIDE both the trigger, popover, and Radix portals
      if (!isTrigger && !isInPopover && !isInRadixPortal) {
        context.onOpenChange(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        context.onOpenChange(false)
      }
    }

    if (context.open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [context.open, context.onOpenChange])

  if (!context.open) return null

  const alignmentClasses =
    align === 'end' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'

  return (
    <div
      className={cn(
        `absolute top-full ${alignmentClasses} z-50 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg`,
        className
      )}
      data-popover-content>
      <div ref={contentRef}>{children}</div>
    </div>
  )
}
