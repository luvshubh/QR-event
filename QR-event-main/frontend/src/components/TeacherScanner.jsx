import { useState } from 'react'
import { QrReader } from "react-qr-reader";

import axios from 'axios'
import { useEvent } from '../context/EventContext'

const TeacherScanner = () => {
  const [scanResult, setScanResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [useCamera, setUseCamera] = useState(true)
  const [manualInput, setManualInput] = useState('')
  const [cameraActive, setCameraActive] = useState(true)
  const { refreshData, students } = useEvent()

  const handleScan = async (qrData) => {
    if (!qrData || scanning) return
    
    setScanning(true)
    setScanResult(null)

    try {
      const response = await axios.post('/api/scan', {
        qrData: qrData
      })

      setScanResult({
        success: response.data.success,
        message: response.data.message,
        student: response.data.student
      })

      refreshData()

      // Auto-clear result after 3 seconds
      setTimeout(() => {
        setScanResult(null)
      }, 3000)

    } catch (error) {
      setScanResult({
        success: false,
        message: error.response?.data?.message || 'Scan failed. Please try again.'
      })
    }

    setScanning(false)
  }

  const handleError = (error) => {
    console.log('QR Scanner error:', error)
    if (error && error.name === 'NotAllowedError') {
      setScanResult({
        success: false,
        message: 'Camera permission denied. Please allow camera access.'
      })
    }
  }

  const handleManualScan = (e) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    handleScan(manualInput)
    setManualInput('')
  }

  const simulateQRScan = async (studentId) => {
    try {
      // First generate a pass for the student
      const passResponse = await axios.post(`/api/student/${studentId}/generate-pass`)
      const qrData = passResponse.data.student.qrData
      
      // Then scan it
      handleScan(qrData)
    } catch (error) {
      setScanResult({
        success: false,
        message: `Failed to process ${studentId}: ${error.response?.data?.error || 'Please try again'}`
      })
    }
  }

  const toggleCamera = () => {
    setCameraActive(!cameraActive)
  }

  return (
    <div className="teacher-scanner">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          👨‍🏫 Teacher QR Scanner
        </h2>

        {/* Scanner Mode Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              useCamera
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setUseCamera(true)}
          >
            📷 Camera Scanner
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              !useCamera
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setUseCamera(false)}
          >
            ⌨️ Manual Input
          </button>
        </div>

        {/* Camera Scanner */}
        {useCamera && (
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Camera QR Scanner
              </h3>
              <button 
                onClick={toggleCamera}
                className="btn btn-outline text-sm"
              >
                {cameraActive ? 'Stop Camera' : 'Start Camera'}
              </button>
            </div>
            
            {cameraActive ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-black">
                <QrReader
                  delay={300}
                  onError={handleError}
                  onScan={(data) => {
                    if (data) {
                      handleScan(data)
                    }
                  }}
                  style={{ width: '100%' }}
                  constraints={{
                    facingMode: 'environment' // Use back camera
                  }}
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 text-center">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-gray-600">Camera is stopped</p>
                <p className="text-sm text-gray-500 mt-1">
                  Click &quot;Start Camera&quot; to begin scanning
                </p>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Scanning Instructions:</strong>
                <br/>• Point camera at student&apos QR code
                <br/>• Ensure good lighting
                <br/>• Hold steady for 2-3 seconds
                <br/>• Allow camera permissions if prompted
              </p>
            </div>
          </div>
        )}

        {/* Manual Input */}
        {!useCamera && (
          <div className="card mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Manual QR Data Input
            </h3>
            <form onSubmit={handleManualScan}>
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder='Paste QR code data here (copied from student pass)'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
                required
              />
              <button 
                type="submit" 
                className="btn btn-primary w-full mt-3"
                disabled={scanning || !manualInput.trim()}
              >
                {scanning ? 'Scanning...' : 'Validate QR Code'}
              </button>
            </form>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <div className={`card mb-6 ${
            scanResult.success 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="text-center">
              <div className={`text-4xl mb-3 ${
                scanResult.success ? 'text-green-500' : 'text-red-500'
              }`}>
                {scanResult.success ? '✅' : '❌'}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                scanResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {scanResult.success ? 'Scan Successful!' : 'Scan Failed'}
              </h3>
              <p className={`mb-4 ${
                scanResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {scanResult.message}
              </p>
              
              {scanResult.student && (
                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Student Details:
                  </h4>
                  <p><strong>Name:</strong> {scanResult.student.name}</p>
                  <p><strong>ID:</strong> {scanResult.student.studentId}</p>
                  {scanResult.student.email && (
                    <p><strong>Email:</strong> {scanResult.student.email}</p>
                  )}
                  {scanResult.student.scannedAt && (
                    <p><strong>Scanned At:</strong> {new Date(scanResult.student.scannedAt).toLocaleString()}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Test Section */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            🧪 Quick Test
          </h3>
          <p className="text-gray-600 mb-4">
            Test the scanner with these students:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {students.slice(0, 8).map(student => (
              <button
                key={student.studentId}
                className={`btn py-2 ${
                  student.scanned 
                    ? 'bg-green-100 text-green-800 border-green-300' 
                    : 'btn-outline'
                }`}
                onClick={() => simulateQRScan(student.studentId)}
                disabled={scanning}
              >
                {student.scanned ? '✅ ' : '🔲 '}{student.studentId}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                <strong>✅ Scanned Students:</strong> {students.filter(s => s.scanned).length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                <strong>🎫 Passes Generated:</strong> {students.filter(s => s.passGenerated).length}
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Testing Instructions:</strong> 
              <br/>1. Go to Student Portal and generate a pass for any student
              <br/>2. Come back here and use camera to scan the QR code
              <br/>3. Or click test buttons above for quick simulation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherScanner