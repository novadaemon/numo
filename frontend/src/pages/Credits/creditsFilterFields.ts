import type { FilterFieldConfig } from '@/types/filters'

/**
 * Build the list of filterable fields for Credits.
 *
 * Core fields: credited_at, amount, observations.
 */
export async function getCreditsFilterFields(): Promise<FilterFieldConfig[]> {
  const fields: FilterFieldConfig[] = []

  const textOperators = [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
  ]

  const dateOperators = [
    { value: 'equals', label: 'On' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'between', label: 'Between' },
  ]

  const numberOperators = [
    { value: 'equals', label: 'Equals' },
    { value: 'gt', label: 'Greater than' },
    { value: 'lt', label: 'Less than' },
    { value: 'between', label: 'Between' },
  ]

  // 1. Date field
  fields.push({
    name: 'credited_at',
    label: 'Date',
    type: 'date',
    operators: dateOperators,
    group: 'Main',
  })

  // 2. Amount field
  fields.push({
    name: 'amount',
    label: 'Amount',
    type: 'number',
    operators: numberOperators,
    group: 'Main',
  })

  // 3. Observations field
  fields.push({
    name: 'observations',
    label: 'Observations',
    type: 'text',
    operators: textOperators,
    group: 'Main',
  })

  return fields
}
