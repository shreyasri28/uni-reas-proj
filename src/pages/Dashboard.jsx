import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Briefcase, Clock, Bell, Edit } from 'lucide-react'
import { AuthContext } from '../App'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { currentUser, handleSignOut } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    handleSignOut()
    navigate('/signin')
  }

  const stats = [
    { icon: Briefcase, label: 'Projects', value: '12', color: 'blue', to: '/projects' },
    { icon: Users, label: 'Collaborations', value: '08', color: 'green', to: '/directory' },
    { icon: Clock, label: 'Pending Requests', value: '05', color: 'orange', to: '/requests' },
    { icon: Users, label: 'Recommended Matches', value: '10', color: 'purple', to: '/matches' }
  ]

  const activities = [
    {
      id: 1,
      user: 'Dr. Emily Chen',
      action: 'accepted your collaboration request',
      timestamp: '2 hours ago',
      type: 'acceptance'
    },
    {
      id: 2,
      user: 'Prof. James Wilson',
      action: 'sent you a collaboration request',
      timestamp: '5 hours ago',
      type: 'request'
    },
    {
      id: 3,
      user: 'Sarah Anderson',
      action: 'joined your project "AI Research"',
      timestamp: '1 day ago',
      type: 'project_join'
    },
    {
      id: 4,
      user: 'System',
      action: 'recommended Dr. Michael Brown as a match',
      timestamp: '1 day ago',
      type: 'recommendation'
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            {/* Welcome Section */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {currentUser?.name}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Here&apos;s what&apos;s happening with your research collaborations
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  icon={stat.icon}
                  label={stat.label}
                  value={stat.value}
                  color={stat.color}
                  to={stat.to}
                />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activities */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {activities.map(activity => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                {/* Notifications */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Bell className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <span className="ml-auto bg-accent-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">3</span>
                  </div>
                  <div className="space-y-3">
                    <NotificationItem 
                      title="New Collaboration Request"
                      time="Just now"
                      unread={true}
                      onClick={() => navigate('/requests')}
                    />
                    <NotificationItem 
                      title="Request Accepted"
                      time="2 hours ago"
                      onClick={() => navigate('/requests')}
                    />
                    <NotificationItem 
                      title="Project Update"
                      time="5 hours ago"
                      onClick={() => navigate('/projects')}
                    />
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-sm p-6 text-white space-y-3">
                  <h3 className="font-semibold">Quick Actions</h3>
                  <button 
                    onClick={() => navigate('/settings')}
                    className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium">
                    → Find Collaborators
                  </button>
                  <button className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium">
                    → View Requests
                  </button>
                  <button className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium">
                    → Create Project
                  </button>
                </div>

                {/* Profile Completion */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Complete Your Profile</h3>
                  <p className="text-xs text-blue-700 mb-3">
                    Add more details to improve your match recommendations
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function ActivityItem({ activity }) {
  const getIcon = (type) => {
    const icons = {
      acceptance: '✓',
      request: '?',
      project_join: '+',
      recommendation: '⭐'
    }
    return icons[type] || '•'
  }

  return (
    <div className="p-6 hover:bg-gray-50 transition cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
          {getIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900">
            <span className="font-semibold">{activity.user}</span> {activity.action}
          </p>
          <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
        </div>
      </div>
    </div>
  )
}

function NotificationItem({ title, time, unread, onClick }) {
  return (
    <button onClick={onClick} className={`w-full p-3 rounded-lg ${unread ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'} cursor-pointer hover:shadow-sm transition text-left`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm ${unread ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
            {title}
          </p>
          <p className="text-xs text-gray-500 mt-1">{time}</p>
        </div>
        {unread && <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>}
      </div>
    </button>
  )
}
