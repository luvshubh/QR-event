import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const EventContext = createContext()

const API_BASE_URL = '/api'

export const useEvent = () => {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider')
  }
  return context
}

export const EventProvider = ({ children }) => {
  const [statusLog, setStatusLog] = useState([])
  const [stats, setStats] = useState({ 
    totalStudents: 0, 
    scannedCount: 0, 
    remaining: 0, 
    passesGenerated: 0 
  })
  const [students, setStudents] = useState([])

  const fetchStatusLog = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/status-log`)
      setStatusLog(response.data.logs)
    } catch (error) {
      console.error('Error fetching status log:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`)
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students`)
      setStudents(response.data.students)
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const refreshData = () => {
    fetchStatusLog()
    fetchStats()
    fetchStudents()
  }

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 3000) // Refresh every 3 seconds
    return () => clearInterval(interval)
  }, [])

  const value = {
    statusLog,
    stats,
    students,
    refreshData,
    API_BASE_URL
  }

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  )
}