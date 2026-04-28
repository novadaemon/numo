import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { LockIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FilterValueEditor } from './FilterValueEditor'
import type { FilterFieldConfig, FilterRule } from './types'
import { operatorNeedsValue } from './types'

type FilterChipProps = {
  rule: FilterRule
  fieldConfig: FilterFieldConfig
  onUpdate: (rule: FilterRule) => void
  onRemove: () => void
  /** When true, the popover opens automatically on mount */
  autoOpen?: boolean
  /** When true, the chip is read-only: no X button and no edit popover */
  locked?: boolean
}

/** Renders a single active filter as a clickeable chip/pill */
export function FilterChip({
  rule,
  fieldConfig,
  onUpdate,
  onRemove,
  autoOpen,
  locked = false,
}: FilterChipProps) {
  const [open, setOpen] = useState(false)

  // Auto-open popover for newly created filters
  useEffect(() => {
    if (!autoOpen) {
      return
    }

    // Small delay to let the DOM settle after render
    const timer = setTimeout(() => setOpen(true), 50)
    return () => clearTimeout(timer)
  }, [autoOpen])

  const operatorLabel =
    fieldConfig.operators.find((op) => op.value === rule.operator)?.label ?? rule.operator
  const valueLabel = getValueLabel(rule, fieldConfig)
  const showValue = operatorNeedsValue(rule.operator)

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen && operatorNeedsValue(rule.operator) && !rule.value) {
      onRemove()
      return
    }
    setOpen(isOpen)
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    onRemove()
  }

  const chipContent = (
    <button
      disabled={locked}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-[color,box-shadow]',
        'focus-visible:ring-ring/50 ring-offset-background focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[2px]',
        locked
          ? 'border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground'
          : 'border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary'
      )}>
      {/* Filter field label */}
      <span className="font-semibold">{fieldConfig.label}</span>

      {/* Filter operator label */}
      <span className={locked ? 'text-muted-foreground/60' : 'text-primary/60'}>
        {operatorLabel}
      </span>

      {/* Filter value label */}
      {showValue && valueLabel && (
        <span className="max-w-[150px] truncate font-semibold">{valueLabel}</span>
      )}

      {/* Remove button */}
      {!locked && (
        <span
          role="button"
          tabIndex={0}
          className="hover:bg-primary/20 ml-0.5 rounded-sm p-0.5"
          onClick={handleRemove}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleRemove(e)
            }
          }}>
          <X className="size-3" />
        </span>
      )}

      {/* Locked icon */}
      {locked && <LockIcon className="ml-0.5 size-3" />}
    </button>
  )

  // Locked chips: no popover, just the pill
  if (locked) {
    return chipContent
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{chipContent}</PopoverTrigger>

      <PopoverContent className="w-auto min-w-[280px] p-3" align="start">
        <div className="space-y-3">
          {/* Field name (read-only label) */}
          <div className="text-xs font-medium text-muted-foreground">{fieldConfig.label}</div>

          {/* Operator selector */}
          <Select
            value={rule.operator}
            onValueChange={(op) => {
              const needsValue = operatorNeedsValue(op)
              onUpdate({
                ...rule,
                operator: op,
                value: needsValue ? rule.value : undefined,
              })
            }}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fieldConfig.operators.map((op) => (
                <SelectItem key={op.value} value={op.value} className="text-xs">
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Value editor */}
          {operatorNeedsValue(rule.operator) && (
            <FilterValueEditor
              fieldConfig={fieldConfig}
              operator={rule.operator}
              value={rule.value}
              onChange={(value) => onUpdate({ ...rule, value })}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Resolves the display label for a filter value */
function getValueLabel(rule: FilterRule, fieldConfig: FilterFieldConfig): string {
  if (!operatorNeedsValue(rule.operator)) return ''

  const { value } = rule

  if (value === undefined || value === null || value === '') return ''

  // For select/boolean fields, show the option label
  if (fieldConfig.options && fieldConfig.options.length > 0) {
    if (Array.isArray(value)) {
      // multi_select
      return value
        .map((v: string) => fieldConfig.options!.find((o) => o.value === v)?.label ?? v)
        .join(', ')
    }
    return fieldConfig.options.find((o) => o.value === String(value))?.label ?? String(value)
  }

  // For dates, format dd/mm/yyyy from "yyyy-mm-dd" without timezone conversion
  if (fieldConfig.type === 'date') {
    if (Array.isArray(value)) {
      // between operator: [from, to]
      const fmt = (d: string) => {
        const parts = d.split('-')
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d
      }
      const from = value[0] ? fmt(value[0]) : '...'
      const to = value[1] ? fmt(value[1]) : '...'
      return `${from} to ${to}`
    }
    if (typeof value === 'string') {
      const parts = value.split('-')
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`
      }
      return value
    }
  }

  return String(value)
}
