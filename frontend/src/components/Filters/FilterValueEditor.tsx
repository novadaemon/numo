import { Button } from '@/components/ui/button'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FilterFieldConfig } from './types'

type Props = {
  fieldConfig: FilterFieldConfig
  /** Current operator – used to pick specialized editors (e.g. between) */
  operator?: string
  value: unknown
  onChange: (value: unknown) => void
}

export function FilterValueEditor({ fieldConfig, operator, value, onChange }: Props) {
  switch (fieldConfig.type) {
    case 'multi_select':
      return (
        <MultiSelectValueEditor
          options={fieldConfig.options ?? []}
          value={value ?? []}
          onChange={onChange}
        />
      )
    case 'text':
      return <TextValueEditor value={value ?? ''} onChange={onChange} />
    case 'date':
      if (operator === 'between') {
        const rangeValue: [string, string] = Array.isArray(value)
          ? [value[0] ?? '', value[1] ?? '']
          : ['', '']
        return <DateRangeValueEditor value={rangeValue} onChange={onChange} />
      }
      return <DateValueEditor value={value ?? ''} onChange={onChange} />
    case 'number':
      if (operator === 'between') {
        const rangeValue: [string, string] = Array.isArray(value)
          ? [value[0] ? value[0].toString() : '', value[1] ? value[1].toString() : '']
          : ['', '']
        return <NumberRangeValueEditor value={rangeValue} onChange={onChange} />
      }
      return <NumberValueEditor value={value ?? ''} onChange={onChange} />
    default:
      return <TextValueEditor value={value ?? ''} onChange={onChange} />
  }
}

// Multi Select

function MultiSelectValueEditor({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const selectedLabels = options.filter((o) => value.includes(o.value)).map((o) => o.label)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-8 w-full min-w-[120px] justify-between text-xs font-normal">
          <span className="truncate">
            {selectedLabels.length > 0 ? selectedLabels.join(', ') : 'Select...'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        onChange(value.filter((v) => v !== option.value))
                      } else {
                        onChange([...value, option.value])
                      }
                      // Popover stays open for multi-select (user may select multiple items)
                      // Don't close here - user can click outside or press Escape to close
                    }}>
                    {option.label}
                    <Check
                      className={cn('ml-auto h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ── Text (debounced) ──

function TextValueEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [localValue, setLocalValue] = useState(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Set up debounce timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, 400)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [localValue, onChange, value])

  return (
    <Input
      type="text"
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value)
      }}
      placeholder="Type value..."
      className="h-8 min-w-[120px] text-xs"
    />
  )
}

// ── Number (debounced) ──

function NumberValueEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [localValue, setLocalValue] = useState(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Set up debounce timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, 400)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [localValue, onChange, value])

  return (
    <Input
      type="number"
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value)
      }}
      placeholder="Type value..."
      className="h-8 min-w-[120px] text-xs"
    />
  )
}

// ── Number range (between) ──

function NumberRangeValueEditor({
  value,
  onChange,
}: {
  value: [string, string]
  onChange: (v: [string, string]) => void
}) {
  const [localFrom, setLocalFrom] = useState(value[0] ?? '')
  const [localTo, setLocalTo] = useState(value[1] ?? '')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const rangeInvalid =
    localFrom !== '' && localTo !== '' && parseFloat(localTo) < parseFloat(localFrom)

  useEffect(() => {
    // Set up debounce timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      const incomplete = localFrom === '' || localTo === ''
      const invalid = !incomplete && parseFloat(localTo) < parseFloat(localFrom)
      if (!incomplete && !invalid) {
        onChange([localFrom, localTo])
      }
    }, 500)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [localFrom, localTo, onChange])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={localFrom}
          onChange={(e) => setLocalFrom(e.target.value)}
          className="h-8 min-w-[80px] text-xs"
          placeholder="From"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <Input
          type="number"
          value={localTo}
          onChange={(e) => setLocalTo(e.target.value)}
          className={`h-8 min-w-[80px] text-xs ${rangeInvalid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          placeholder="To"
        />
      </div>
      {rangeInvalid && <p className="text-xs text-destructive">To must be greater than From</p>}
    </div>
  )
}

// ── Date (native browser date picker) ──

function DateValueEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [localValue, setLocalValue] = useState(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Set up debounce timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, 500)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [localValue, onChange, value])

  return (
    <Input
      type="date"
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value)
      }}
      className="h-8 min-w-[140px] text-xs"
    />
  )
}

// ── Date range (between) ──

function DateRangeValueEditor({
  value,
  onChange,
}: {
  value: [string, string]
  onChange: (v: [string, string]) => void
}) {
  const [localFrom, setLocalFrom] = useState(value[0] ?? '')
  const [localTo, setLocalTo] = useState(value[1] ?? '')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const rangeInvalid = localFrom !== '' && localTo !== '' && localTo < localFrom

  useEffect(() => {
    // Set up debounce timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      const incomplete = localFrom === '' || localTo === ''
      const invalid = !incomplete && localTo < localFrom
      if (!incomplete && !invalid) {
        onChange([localFrom, localTo])
      }
    }, 500)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [localFrom, localTo, onChange])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={localFrom}
          onChange={(e) => setLocalFrom(e.target.value)}
          className="h-8 min-w-[130px] text-xs"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <Input
          type="date"
          value={localTo}
          min={localFrom || undefined}
          onChange={(e) => setLocalTo(e.target.value)}
          className={`h-8 min-w-[130px] text-xs ${rangeInvalid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
      </div>
      {rangeInvalid && <p className="text-xs text-destructive">To date must be after From date</p>}
    </div>
  )
}
