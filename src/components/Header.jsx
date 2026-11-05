import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Bell, Search, LogOut, Settings } from 'lucide-react'
import { AuthContext } from '../App'

export default function Header({ onMenuClick, sidebarOpen }) {
  const { currentUser, handleSignOut } = useContext(AuthContext)
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (event) => {
    event.preventDefault()
    const query = searchTerm.trim()
    navigate(query ? '/directory?q=' + encodeURIComponent(query) : '/directory')
  }

  const handleLogout = () => {
    handleSignOut()
    navigate('/signin')
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6 gap-4">
        {/* Left Side - Menu & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="font-bold text-xl text-primary-900">
            Research Portal
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search people or research areas..." aria-label="Search researchers and research areas" className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" />
          </form>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button onClick={() => navigate('/notifications')} className="relative p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 relative">
            <div className="hidden sm:text-right">
              <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
            </div>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 rounded-full bg-primary-100 overflow-hidden hover:opacity-80 transition"
            >
              <img
                src={currentUser?.profilePicture}
                alt={currentUser?.name}
                className="w-full h-full object-cover"
              />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute top-16 right-0 bg-white rounded-lg shadow-lg border border-gray-200 w-48 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  <Settings className="w-4 h-4" />
                  Settings & Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setShowUserMenu(false)
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition font-medium border-t border-gray-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
