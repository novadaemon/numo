import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { apiClient } from '@/services'
import { Dashboard, DebitsPage } from '@/pages'
import { HeaderMenu } from '@/components/layout'
import { CircleDollarSign } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Conectando...</p>
        </div>
      </div>
    )
  }

  if (status === 'disconnected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 rounded-full bg-red-500"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Conexión No Disponible
          </h1>
          <p className="text-gray-600 mb-6">
            No se pudo conectar con el servidor. Por favor, verifica que el backend esté ejecutándose.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center"><CircleDollarSign className="mr-2" />Numo</h1>
          <HeaderMenu />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/debits" element={<DebitsPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
