// ── Filter types for advanced filtering (Notion-style) ──

export type FilterFieldType = 'text' | 'multi_select' | 'date' | 'number'

export type FilterOperator = {
  value: string
  label: string
}

/** Describes a filterable field and its available operators/options */
export type FilterFieldConfig = {
  /** Unique field identifier sent to the backend */
  name: string
  /** Human-readable label displayed in the UI */
  label: string
  /** Data type – determines which operators and value editor to show */
  type: FilterFieldType
  /** Icon component (optional, from lucide-react) */
  icon?: React.ComponentType<{ className?: string }>
  /** Available operators for this field */
  operators: FilterOperator[]
  /** Static options for select / multi_select fields */
  options?: FilterOption[]
  /** Group label for organizing fields in the picker (e.g. "General", "Contencioso") */
  group?: string
}

export type FilterOption = {
  value: string
  label: string
}

/** A single active filter rule */
export type FilterRule = {
  /** Client-side unique id for React keys */
  id: string
  /** Field name matching FilterFieldConfig.name */
  field: string
  /** Operator value matching FilterOperator.value */
  operator: string
  /** The filter value – type depends on the field type */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
}

/** Serialized format sent to the backend */
export type SerializedFilterRule = {
  field: string
  operator: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
}

/** Returns whether the given operator needs a value input */
export function operatorNeedsValue(operator: string): boolean {
  return !['is_empty', 'is_not_empty'].includes(operator)
}
