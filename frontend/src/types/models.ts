/**
 * Category model - represents an expense category
 */
export interface Category {
  id: number;
  name: string;
}

/**
 * Place model - represents a transaction location/place
 */
export interface Place {
  id: number;
  name: string;
}

/**
 * Embedded category reference in Debit response
 */
export interface CategoryRef {
  id: number;
  name: string;
}

/**
 * Embedded place reference in Debit response
 */
export interface PlaceRef {
  id: number;
  name: string;
}

/**
 * Debit model - represents an expense/debit transaction
 */
export interface Debit {
  id: number;
  category_id: number;
  category: CategoryRef;
  place_id: number | null;
  place: PlaceRef | null;
  amount: number;
  debited_at: string; // ISO-8601 datetime
  concept?: string | null;
  observations?: string | null;
}

/**
 * Credit model - represents an income/credit transaction
 */
export interface Credit {
  id: number;
  amount: number;
  credited_at: string; // ISO-8601 datetime
  observations?: string | null;
}

/**
 * Type for accessing all models
 */
export type Entity = Category | Place | Debit | Credit;
