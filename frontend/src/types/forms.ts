/**
 * Category creation/update payload
 */
export interface CategoryFormData {
  name: string
}

/**
 * Place creation/update payload
 */
export interface PlaceFormData {
  name: string
}

/**
 * Concept creation/update payload
 */
export interface ConceptFormData {
  name: string
}

/**
 * Debit creation/update payload
 */
export interface DebitFormData {
  category_id: number
  place_id: number
  amount: number
  expensed_at: string // ISO-8601 date
  observations?: string | null
}

/**
 * Credit creation/update payload
 */
export interface CreditFormData {
  amount: number
  credited_at: string // ISO-8601 date
  observations?: string | null
}
