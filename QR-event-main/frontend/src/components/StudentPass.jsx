import React, { useState } from 'react'
import axios from 'axios'
import { useEvent } from '../context/EventContext'

const StudentPass = () => {
  const [studentId, setStudentId] = useState('')
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { refreshData } = useEvent()

  const generatePass = async (id) => {
    if (!id.trim()) return
    
    setLoading(true)
    setError('')
    try {
      const response = await axios.post(`/api/student/${id}/generate-pass`)
      setStudentData(response.data.student)
      refreshData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate pass')
      setStudentData(null)
    }
    setLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    generatePass(studentId)
  }

  const refreshStatus = async () => {
    if (!studentData) return
    
    try {
      const response = await axios.post(`/api/student/${studentId}/refresh`)
      setStudentData(prev => ({
        ...prev,
        scanned: response.data.scanned,
        scannedAt: response.data.scannedAt
      }))
    } catch (err) {
      console.error('Error refreshing status:', err)
    }
  }

  return (
    <div className="student-pass">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🎓 Student Event Pass
        </h2>
        
        <form onSubmit={handleSubmit} className="card mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Enter Your Student ID
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.toUpperCase())}
              placeholder="e.g., STU001, STU002, ... STU008"
              className="input-field"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Available IDs: STU001 to STU008 (Demo accounts)
            </p>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Generating Pass...' : '🎫 Generate Event Pass'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-500 text-lg mr-2">❌</div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {studentData && (
          <div className="card">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {studentData.name}
              </h3>
              <p className="text-gray-600">Student ID: {studentData.studentId}</p>
              <p className="text-gray-600">Email: {studentData.email}</p>
              <p className="text-sm text-gray-500 mt-2">
                Pass Generated: {new Date(studentData.generatedAt).toLocaleString()}
              </p>
            </div>

            {studentData.scanned ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mb-6">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Entry Provided
                </h3>
                <p className="text-green-700">
                  Scanned at: {new Date(studentData.scannedAt).toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  You have successfully entered the event!
                </p>
              </div>
            ) : (
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">
                  Your Event QR Code
                </h4>
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                  <img 
                    src={studentData.qrCodeDataURL} 
                    alt="QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <p className="text-gray-600 mt-4">
                  Show this QR code to the teacher at the event entrance
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This pass will become invalid after scanning
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                className="btn btn-outline flex-1"
                onClick={refreshStatus}
                disabled={loading}
              >
                🔄 Refresh Status
              </button>
              <button 
                className="btn btn-outline flex-1"
                onClick={() => {
                  setStudentData(null)
                  setStudentId('')
                }}
              >
                🎫 Generate New Pass
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentPass