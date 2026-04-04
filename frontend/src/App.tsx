import { useState, useEffect } from 'react'
import { apiClient } from '@/services'

function App() {
  const [status, setStatus] = useState<string>('loading')
  const [apiVersion, setApiVersion] = useState<string>('')

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await apiClient.health()
        setStatus('connected')
        if (data.version) {
          setApiVersion(data.version)
        }
      } catch (error) {
        setStatus('disconnected')
      }
    }

    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-indigo-900 mb-6">
            Numo
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Personal Expense Tracker
          </p>
          
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className={`w-3 h-3 rounded-full ${
              status === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium text-gray-700">
              {status === 'connected' 
                ? 'Backend Connected' 
                : 'Backend Disconnected'}
            </span>
          </div>

          <p className="text-center text-sm text-gray-500">
            Welcome! Start tracking your expenses.
          </p>
          
          {apiVersion && (
            <p className="text-center text-xs text-gray-400 mt-6">
              API v{apiVersion}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
