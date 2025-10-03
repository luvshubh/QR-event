import React, { useState } from 'react'
import StudentPass from './StudentPass'
import TeacherScanner from './TeacherScanner'
import StatusLog from './StatusLog'
import { useEvent } from '../context/EventContext'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('student')
  const { stats } = useEvent()

  return (
    <div className="max-w-6xl mx-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
          <div className="text-gray-600">Total Students</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.scannedCount}</div>
          <div className="text-gray-600">Entered</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.remaining}</div>
          <div className="text-gray-600">Remaining</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.passesGenerated}</div>
          <div className="text-gray-600">Passes Generated</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 px-6 text-lg font-medium text-center transition-colors ${
              activeTab === 'student'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('student')}
          >
            🎓 Student Portal
          </button>
          <button
            className={`flex-1 py-4 px-6 text-lg font-medium text-center transition-colors ${
              activeTab === 'teacher'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('teacher')}
          >
            👨‍🏫 Teacher Portal
          </button>
          <button
            className={`flex-1 py-4 px-6 text-lg font-medium text-center transition-colors ${
              activeTab === 'activity'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            📊 Live Activity
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'student' && <StudentPass />}
          {activeTab === 'teacher' && <TeacherScanner />}
          {activeTab === 'activity' && <StatusLog />}
        </div>
      </div>
    </div>
  )
}

export default Dashboard