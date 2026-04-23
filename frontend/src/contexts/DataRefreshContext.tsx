import React, { createContext, ReactNode, useCallback, useState } from 'react'

/**
 * Contexto para notificar a los componentes cuando hay cambios en datos
 * Los componentes pueden suscribirse a estos eventos para refetch data
 */

type RefreshEvent =
  | 'category-created'
  | 'category-updated'
  | 'category-deleted'
  | 'place-created'
  | 'place-updated'
  | 'place-deleted'
  | 'debit-created'
  | 'debit-updated'
  | 'debit-deleted'
  | 'credit-created'
  | 'credit-updated'
  | 'credit-deleted'

interface DataRefreshContextType {
  /**
   * Disparar un evento de actualización
   */
  triggerRefresh: (event: RefreshEvent) => void

  /**
   * Suscribirse a cambios
   */
  onRefresh: (callback: (event: RefreshEvent) => void) => () => void
}

export const DataRefreshContext = createContext<DataRefreshContextType | undefined>(undefined)

interface DataRefreshProviderProps {
  children: ReactNode
}

/**
 * Proveedor del contexto de actualización de datos
 * Envuelve el árbol de componentes para permitir notificación de cambios
 */
export function DataRefreshProvider({ children }: DataRefreshProviderProps) {
  const [listeners, setListeners] = useState<Set<(event: RefreshEvent) => void>>(new Set())

  const triggerRefresh = useCallback(
    (event: RefreshEvent) => {
      // Notificar a todos los listeners
      listeners.forEach((listener) => {
        listener(event)
      })
    },
    [listeners]
  )

  const onRefresh = useCallback((callback: (event: RefreshEvent) => void) => {
    setListeners((prev) => {
      const newListeners = new Set(prev)
      newListeners.add(callback)
      return newListeners
    })

    // Retornar función para desuscribirse
    return () => {
      setListeners((prev) => {
        const newListeners = new Set(prev)
        newListeners.delete(callback)
        return newListeners
      })
    }
  }, [])

  return (
    <DataRefreshContext.Provider value={{ triggerRefresh, onRefresh }}>
      {children}
    </DataRefreshContext.Provider>
  )
}

/**
 * Hook para usar el contexto de actualización de datos
 */
export function useDataRefresh() {
  const context = React.useContext(DataRefreshContext)
  if (!context) {
    throw new Error('useDataRefresh must be used within DataRefreshProvider')
  }
  return context
}
