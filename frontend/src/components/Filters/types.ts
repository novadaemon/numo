// Re-export filter types from the canonical location
// This file is deprecated and kept for backwards compatibility
// Use @/types/filters directly instead
export type {
  FilterFieldConfig,
  FilterFieldType,
  FilterOperator,
  FilterOption,
  FilterRule,
  SerializedFilterRule,
} from '@/types/filters'

/** Returns whether the given operator needs a value input */
export function operatorNeedsValue(operator: string): boolean {
  return !['is_empty', 'is_not_empty'].includes(operator)
}
