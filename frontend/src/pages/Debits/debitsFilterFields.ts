import { categoriesService } from '@/services/categoriesService'
import { placesService } from '@/services/placesService'
import type { FilterFieldConfig } from '@/types/filters'

/**
 * Build the list of filterable fields for Debits.
 *
 * Core fields: expensed_at, category_id, place_id, concept, method, amount.
 */
export async function getDebitsFilterFields(): Promise<FilterFieldConfig[]> {
  const fields: FilterFieldConfig[] = []

  // Load dynamic options
  const categories = await categoriesService.getAllSimple()
  const places = await placesService.getAll()

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

  const containsOperators = [{ value: 'contains', label: 'Contains' }]

  // 1. Date field
  fields.push({
    name: 'expensed_at',
    label: 'Date',
    type: 'date',
    operators: dateOperators,
    group: 'Main',
  })

  // 2. Category field
  fields.push({
    name: 'category_id',
    label: 'Category',
    type: 'multi_select',
    operators: containsOperators,
    options: categories.map((cat) => ({
      value: String(cat.id),
      label: cat.name,
    })),
    group: 'Main',
  })

  // 3. Place field
  fields.push({
    name: 'place_id',
    label: 'Place',
    type: 'multi_select',
    operators: containsOperators,
    options: places.map((place) => ({
      value: String(place.id),
      label: place.name,
    })),
    group: 'Main',
  })

  // 4. Concept field
  fields.push({
    name: 'concept',
    label: 'Concept',
    type: 'text',
    operators: textOperators,
    group: 'Main',
  })

  // 5. Method field
  fields.push({
    name: 'method',
    label: 'Method',
    type: 'multi_select',
    operators: containsOperators,
    options: [
      { value: 'debit', label: 'Debit' },
      { value: 'credit', label: 'Credit' },
      { value: 'cash', label: 'Cash' },
    ],
    group: 'Main',
  })

  // 6. Amount field
  fields.push({
    name: 'amount',
    label: 'Amount',
    type: 'number',
    operators: numberOperators,
    group: 'Main',
  })

  return fields
}
