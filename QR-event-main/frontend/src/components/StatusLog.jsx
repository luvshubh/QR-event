import React from 'react'
import { useEvent } from '../context/EventContext'

const StatusLog = () => {
  const { statusLog, stats, students, refreshData } = useEvent()

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅'
      case 'duplicate': return '⚠️'
      case 'generated': return '🎫'
      default: return '📝'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'status-success'
      case 'duplicate': return 'status-warning'
      case 'generated': return 'status-info'
      default: return 'bg-gray-50'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return 'Entry Provided'
      case 'duplicate': return 'Duplicate Scan'
      case 'generated': return 'Pass Generated'
      default: return 'Info'
    }
  }

  return (
    <div className="status-log">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              📊 Event Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Total Students</span>
                <span className="font-bold text-blue-600">{stats.totalStudents}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Entered</span>
                <span className="font-bold text-green-600">{stats.scannedCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-700">Remaining</span>
                <span className="font-bold text-orange-600">{stats.remaining}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700">Passes Generated</span>
                <span className="font-bold text-purple-600">{stats.passesGenerated}</span>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="card mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🎓 Students List
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {students.map(student => (
                <div key={student.studentId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.studentId}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      student.scanned 
                        ? 'bg-green-100 text-green-800' 
                        : student.passGenerated
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.scanned ? 'Entered' : student.passGenerated ? 'Pass Ready' : 'No Pass'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                📝 Live Activity Log
              </h3>
              <button 
                className="btn btn-outline flex items-center gap-2"
                onClick={refreshData}
              >
                🔄 Refresh
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {statusLog.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No activity yet</p>
                  <p className="text-sm">Activity will appear here when students generate passes or scan QR codes</p>
                </div>
              ) : (
                statusLog.map(log => (
                  <div key={log.id} className={`p-4 rounded-lg border ${getStatusColor(log.status)}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-1">{getStatusIcon(log.status)}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-gray-800">{log.message}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            log.status === 'success' 
                              ? 'bg-green-100 text-green-800'
                              : log.status === 'duplicate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {getStatusText(log.status)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>ID: {log.studentId}</span>
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusLog