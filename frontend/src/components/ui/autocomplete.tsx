import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export interface AutocompleteItem {
  id: number
  name: string
}

interface AutocompleteProps {
  searchValue: string
  onSearchValueChange: (value: string) => void
  items: AutocompleteItem[]
  placeholder?: string
  maxLength?: number
}

export const Autocomplete = React.forwardRef<
  HTMLInputElement,
  AutocompleteProps
>(
  (
    {
      searchValue,
      onSearchValueChange,
      items,
      placeholder = "Concepto",
      maxLength = 255,
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    const handleInputChange = (value: string) => {
      if (value.length <= maxLength) {
        onSearchValueChange(value)
      }
    }

    const handleSelect = (item: AutocompleteItem) => {
      onSearchValueChange(item.name)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        onSearchValueChange('')
      }
    }

    return (
      <div className="relative w-full" ref={containerRef}>
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          className="w-full"
          autoComplete="off"
        />
        
        {/* Suggestions dropdown - only shown if there are items */}
        {items.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-input rounded-md shadow-md z-50 max-h-60 overflow-auto">
            <div className="space-y-0 p-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "w-full text-left px-3 py-2 rounded text-sm hover:bg-accent cursor-pointer transition-colors"
                  )}
                  onClick={() => handleSelect(item)}
                  onMouseDown={(e) => {
                    // Prevent input blur when clicking on suggestion
                    e.preventDefault()
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
)
Autocomplete.displayName = "Autocomplete"


