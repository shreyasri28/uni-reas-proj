import { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Briefcase, Clock, Settings, LogOut, Bell, Shield, GraduationCap, Search, ClipboardCheck } from 'lucide-react'
import { AuthContext } from '../App'

const studentMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Research Directory', href: '/directory' },
  { icon: Briefcase, label: 'Explore Projects', href: '/projects' },
  { icon: Clock, label: 'My Requests', href: '/requests' },
  { icon: Bell, label: 'Notifications', href: '/notifications' }
]

const facultyMenuItems = [
  { icon: LayoutDashboard, label: 'Faculty Dashboard', href: '/dashboard' },
  { icon: Search, label: 'Find Student Researchers', href: '/directory' },
  { icon: Briefcase, label: 'Manage Research Projects', href: '/projects' },
  { icon: ClipboardCheck, label: 'Review Requests', href: '/requests' },
  { icon: Bell, label: 'Research Notifications', href: '/notifications' }
]

export default function Sidebar({ isOpen, onLogout }) {
  const location = useLocation()
  const { currentUser } = useContext(AuthContext)
  const isFaculty = currentUser?.role === 'faculty'
  const visibleMenuItems = isFaculty ? facultyMenuItems : studentMenuItems
  const menuItems = currentUser?.role === 'admin'
    ? [...studentMenuItems, { icon: Shield, label: 'Admin Panel', href: '/admin' }]
    : visibleMenuItems

  return (
    <aside className={`fixed md:static top-0 left-0 h-screen bg-white border-r border-gray-200 transition-transform duration-300 z-40 ${
      isOpen ? 'w-64' : '-translate-x-full md:translate-x-0 md:w-0'
    }`}>
      <div className="flex flex-col h-full w-64">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-900">UNI-REAS</h1>
          <p className="text-xs text-gray-500 mt-1">{isFaculty ? 'Faculty Research Workspace' : 'University Research Portal'}</p>
          {isFaculty && <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"><GraduationCap className="w-3.5 h-3.5" /> Faculty account</div>}
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link key={item.href} to={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}>
                <Icon className="w-5 h-5" /><span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            <Settings className="w-5 h-5" /><span>{isFaculty ? 'Academic Profile' : 'Settings'}</span>
          </Link>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition font-medium">
            <LogOut className="w-5 h-5" /><span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
