import { HeaderMenu } from '@/components/layout'
import { DataRefreshProvider } from '@/contexts'
import { CategoriesPage, CreditsPage, Dashboard, DebitsPage } from '@/pages'
import { apiClient } from '@/services'
import { CircleDollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'

function App() {
  const [status, setStatus] = useState<string>('loading')

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiClient.health()
        setStatus('connected')
      } catch (error) {
        setStatus('disconnected')
      }
    }

    checkHealth()
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Conectando...</p>
        </div>
      </div>
    )
  }

  if (status === 'disconnected') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <div className="h-6 w-6 rounded-full bg-red-500"></div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Conexión No Disponible</h1>
          <p className="mb-6 text-gray-600">
            No se pudo conectar con el servidor. Por favor, verifica que el backend esté
            ejecutándose.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <DataRefreshProvider>
      <div className="flex min-h-screen flex-col">
        {/* Header with Navigation */}
        <div className="border-b border-gray-200 bg-white">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <h1 className="flex items-center text-2xl font-bold text-gray-900">
              <CircleDollarSign className="mr-2" />
              Numo
            </h1>
            <HeaderMenu />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/debits" element={<DebitsPage />} />
            <Route path="/credits" element={<CreditsPage />} />
          </Routes>
        </div>
      </div>
    </DataRefreshProvider>
  )
}

export default App
