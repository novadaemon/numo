/**
 * Category creation/update payload
 */
export interface CategoryFormData {
  name: string;
}

/**
 * Place creation/update payload
 */
export interface PlaceFormData {
  name: string;
}

/**
 * Debit creation/update payload
 */
export interface DebitFormData {
  category_id: number;
  place_id?: number | null;
  amount: number;
  debited_at?: string; // ISO-8601 datetime (optional, defaults to now)
  concept?: string | null;
  observations?: string | null;
}

/**
 * Credit creation/update payload
 */
export interface CreditFormData {
  amount: number;
  credited_at?: string; // ISO-8601 datetime (optional, defaults to now)
  observations?: string | null;
}
