import React from 'react'
import Dashboard from './components/Dashboard'
import { EventProvider } from './context/EventContext'

function App() {
  return (
    <EventProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🎉 College TechFest 2024
            </h1>
            <p className="text-lg text-gray-600">
              QR Code Based Event Entry System
            </p>
          </header>
          <Dashboard />
        </div>
      </div>
    </EventProvider>
  )
}

export default App