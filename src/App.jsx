import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Pages
import SignIn from './pages/SignIn'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Directory from './pages/Directory'
import UserProfile from './pages/UserProfile'
import AdminPanel from './pages/AdminPanel'
import ProjectHub from './pages/ProjectHub'
import Projects from './pages/Projects'
import Requests from './pages/Requests'
import Notifications from './pages/Notifications'
import Matches from './pages/Matches'
import Settings from './pages/Settings'

// Context for auth state
export const AuthContext = React.createContext()

function safeReadStoredUser() {
  try {
    const storedUser = localStorage.getItem('currentUser')
    if (!storedUser) return null
    const parsed = JSON.parse(storedUser)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    localStorage.removeItem('currentUser')
    return null
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate checking auth state from localStorage
    const storedUser = safeReadStoredUser()
    if (storedUser) {
      setCurrentUser(storedUser)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-900 to-primary-700">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="text-white mt-4">Loading...</p>
      </div>
    </div>
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser, handleSignOut }}>
      <Router>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignIn />} />
          <Route path="/signin" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignIn />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" />} />
          <Route path="/directory" element={isAuthenticated ? <Directory /> : <Navigate to="/signin" />} />
          <Route path="/projects" element={isAuthenticated ? <Projects /> : <Navigate to="/signin" />} />
          <Route path="/requests" element={isAuthenticated ? <Requests /> : <Navigate to="/signin" />} />
          <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/signin" />} />
          <Route path="/matches" element={isAuthenticated ? <Matches /> : <Navigate to="/signin" />} />
          <Route path="/profile/:userId" element={isAuthenticated ? <UserProfile /> : <Navigate to="/signin" />} />
          <Route path="/projects/:projectId" element={isAuthenticated ? <ProjectHub /> : <Navigate to="/signin" />} />
          <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/signin" />} />
          <Route path="/admin" element={isAuthenticated && currentUser?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
          
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/signin"} />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  )
}

export default App
