import { useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook to debounce function calls
 * Returns a memoized debounced version of the callback
 */
export default function useDebounce(callback: () => void, delay: number): () => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedCallback = useCallback(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callback()
    }, delay)
  }, [callback, delay])

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}
