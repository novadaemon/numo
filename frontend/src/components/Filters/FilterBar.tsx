import { Button } from '@/components/ui/button'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FilterChip } from './FilterChip'
import type { FilterFieldConfig, FilterRule, SerializedFilterRule } from './types'
import { operatorNeedsValue } from './types'

type FilterBarProps = {
  /** All available filterable fields */
  fields: FilterFieldConfig[]
  /** Current active filter rules (from parent state) */
  value: FilterRule[]
  /** Called whenever filter rules change */
  onChange: (rules: FilterRule[]) => void
  /**
   * Filter rules that are always shown as locked chips (no X button, no editing).
   * Used for hardcoded views like "Casos abiertos" / "Casos cerrados".
   */
  lockedRules?: FilterRule[]
}

function generateFilterId(): string {
  return crypto.randomUUID()
}

export function FilterBar({ fields, value: rules, onChange, lockedRules = [] }: FilterBarProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null)

  // Fields locked by the view are not offered in the picker
  const lockedFieldNames = useMemo(() => new Set(lockedRules.map((r) => r.field)), [lockedRules])

  // Group fields by their group property for the picker (excluding locked fields)
  const fieldGroups = useMemo(() => {
    const groups: Record<string, FilterFieldConfig[]> = {}
    for (const field of fields) {
      if (lockedFieldNames.has(field.name)) {
        continue
      }

      const group = field.group ?? 'Main'

      if (!groups[group]) groups[group] = []
      groups[group].push(field)
    }

    return groups
  }, [fields, lockedFieldNames])

  // Field config lookup
  const fieldMap = useMemo(() => {
    const map = new Map<string, FilterFieldConfig>()

    for (const f of fields) {
      map.set(f.name, f)
    }

    return map
  }, [fields])

  function addFilter(fieldName: string) {
    const fieldConfig = fieldMap.get(fieldName)

    if (!fieldConfig) return

    const defaultOperator = fieldConfig.operators[0]?.value ?? 'equals'
    const newRule: FilterRule = {
      id: generateFilterId(),
      field: fieldName,
      operator: defaultOperator,
      value: undefined,
    }

    setNewlyAddedId(newRule.id)
    onChange([...rules, newRule])
    setAddOpen(false)
  }

  function updateRule(updatedRule: FilterRule) {
    onChange(rules.map((r) => (r.id === updatedRule.id ? updatedRule : r)))
  }

  function removeRule(ruleId: string) {
    onChange(rules.filter((r) => r.id !== ruleId))
  }

  function clearAll() {
    onChange([])
  }

  const totalChips = lockedRules.length + rules.length

  if (totalChips === 0 && fields.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-2">
      {/* Locked filter chips (read-only, no remove button) */}
      {lockedRules.map((rule) => {
        const fieldConfig = fieldMap.get(rule.field)
        if (!fieldConfig) return null

        return (
          <FilterChip
            key={rule.id}
            rule={rule}
            fieldConfig={fieldConfig}
            onUpdate={() => {}}
            onRemove={() => {}}
            locked
          />
        )
      })}

      {/* Active filter chips */}
      {rules.map((rule) => {
        const fieldConfig = fieldMap.get(rule.field)
        if (!fieldConfig) return null

        const isNew = newlyAddedId === rule.id

        return (
          <FilterChip
            key={rule.id}
            rule={rule}
            fieldConfig={fieldConfig}
            onUpdate={updateRule}
            onRemove={() => removeRule(rule.id)}
            autoOpen={isNew}
          />
        )
      })}

      {/* Add filter button */}
      <Popover open={addOpen} onOpenChange={setAddOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 border-dashed border-primary/20 text-xs text-primary/60 hover:bg-primary/10 hover:text-primary">
            <Plus className="h-3.5 w-3.5" />
            Add filter
            {rules.length > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary">
                {rules.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0" align="start">
          <Command>
            <CommandList>
              {Object.entries(fieldGroups).map(([group, groupFields]) => (
                <CommandGroup key={group} heading={group}>
                  {groupFields.map((field) => (
                    <CommandItem
                      key={field.name}
                      onSelect={() => addFilter(field.name)}>
                      {field.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Clear all button — only for editable rules */}
      {rules.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
          onClick={clearAll}>
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  )
}

// ── Serialization utilities ──

/** Convert FilterRule[] to the serialized format sent to the backend */
export function serializeFilters(rules: FilterRule[]): SerializedFilterRule[] {
  return rules
    .filter((r) => {
      // Only serialize rules that have enough data
      if (!r.field || !r.operator) return false
      // Operators that don't need a value
      if (!operatorNeedsValue(r.operator)) return true
      // between requires a complete range: both from and to must be non-empty
      if (r.operator === 'between') {
        return Array.isArray(r.value) && r.value[0] !== '' && r.value[1] !== ''
      }
      // Other operators need a value
      return r.value !== undefined && r.value !== null && r.value !== ''
    })
    .map((r) => ({
      field: r.field,
      operator: r.operator,
      value: r.value,
    }))
}

/** Restore FilterRule[] from serialized format (e.g. from saved state) */
export function deserializeFilters(serialized: SerializedFilterRule[]): FilterRule[] {
  if (!Array.isArray(serialized)) return []
  return serialized.map((s) => ({
    id: generateFilterId(),
    field: s.field,
    operator: s.operator,
    value: s.value,
  }))
}
