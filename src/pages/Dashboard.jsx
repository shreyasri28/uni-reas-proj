import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Briefcase, Clock, Bell, Edit, GraduationCap, BookOpen,
  FilePlus2, Search, ClipboardCheck, FolderKanban, ArrowUpRight,
  Microscope, Lightbulb, CalendarDays
} from 'lucide-react'
import { AuthContext } from '../App'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { currentUser, handleSignOut } = useContext(AuthContext)
  const navigate = useNavigate()
  const isFaculty = currentUser?.role === 'faculty'

  const handleLogout = () => {
    handleSignOut()
    navigate('/signin')
  }

  if (isFaculty) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
              <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-primary-900 to-primary-700 p-7 md:p-9 text-white">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide mb-4">
                      <GraduationCap className="w-4 h-4" /> FACULTY RESEARCH WORKSPACE
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold">Welcome, {currentUser?.name || 'Researcher'}</h1>
                    <p className="text-blue-100 mt-2 max-w-2xl">
                      Lead research, mentor emerging researchers, and build collaborations across your university.
                    </p>
                    {currentUser?.department && <p className="text-sm text-blue-200 mt-3">{currentUser.department}</p>}
                  </div>
                  <button onClick={() => navigate('/projects')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-primary-900 font-semibold hover:bg-blue-50 transition">
                    <FilePlus2 className="w-5 h-5" /> Create research project
                  </button>
                </div>
              </section>

              <section>
                <div className="flex items-end justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Faculty workspace</h2>
                    <p className="text-sm text-gray-500 mt-1">Tools for leading projects and supporting student researchers</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <FacultyAction icon={FolderKanban} title="Manage research projects" description="Create projects, review your ongoing work, and coordinate research teams." action="Open projects" onClick={() => navigate('/projects')} />
                  <FacultyAction icon={ClipboardCheck} title="Review collaboration requests" description="Respond to student and researcher requests to work with you." action="Review requests" onClick={() => navigate('/requests')} />
                  <FacultyAction icon={Search} title="Discover student researchers" description="Find students by department, skills, and research interests." action="Explore directory" onClick={() => navigate('/directory')} />
                  <FacultyAction icon={BookOpen} title="Researcher profile" description="Keep your expertise, research interests, and academic profile up to date." action="Edit profile" onClick={() => navigate('/settings')} />
                </div>
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center"><Microscope className="w-5 h-5" /></div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Research leadership</h2>
                      <p className="text-sm text-gray-500">A focused workflow for faculty members</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <FacultyStep number="01" title="Publish a research opportunity" description="Describe the research problem, skills required, expected commitment, and how students can apply." />
                    <FacultyStep number="02" title="Build your research team" description="Discover students with relevant interests and review incoming collaboration requests." />
                    <FacultyStep number="03" title="Coordinate active projects" description="Open your project workspace to organize collaborators and keep research activity moving." />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Lightbulb className="w-5 h-5 text-amber-600" />
                      <h3 className="font-bold text-gray-900">Opportunity board</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Invite students to contribute to a research topic or join a project team.</p>
                    <button onClick={() => navigate('/projects')} className="text-sm font-semibold text-primary-700 hover:text-primary-900 inline-flex items-center gap-1">
                      Add an opportunity <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Bell className="w-5 h-5 text-primary-600" />
                      <h3 className="font-bold text-gray-900">Faculty notifications</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Stay informed about collaboration activity and project updates.</p>
                    <button onClick={() => navigate('/notifications')} className="text-sm font-semibold text-primary-700 hover:text-primary-900 inline-flex items-center gap-1">
                      View notifications <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CalendarDays className="w-5 h-5 text-blue-700 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-950">Keep your academic profile current</h3>
                    <p className="text-sm text-blue-800 mt-1">Add your research domains, expertise, publications, and mentoring interests so students can find you.</p>
                  </div>
                </div>
                <button onClick={() => navigate('/settings')} className="shrink-0 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Update profile</button>
              </section>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const stats = [
    { icon: Briefcase, label: 'Projects', value: '12', color: 'blue', to: '/projects' },
    { icon: Users, label: 'Collaborations', value: '08', color: 'green', to: '/directory' },
    { icon: Clock, label: 'Pending Requests', value: '05', color: 'orange', to: '/requests' },
    { icon: Users, label: 'Recommended Matches', value: '10', color: 'purple', to: '/matches' }
  ]

  const activities = [
    { id: 1, user: 'Dr. Emily Chen', action: 'accepted your collaboration request', timestamp: '2 hours ago', type: 'acceptance' },
    { id: 2, user: 'Prof. James Wilson', action: 'sent you a collaboration request', timestamp: '5 hours ago', type: 'request' },
    { id: 3, user: 'Sarah Anderson', action: 'joined your project "AI Research"', timestamp: '1 day ago', type: 'project_join' },
    { id: 4, user: 'System', action: 'recommended Dr. Michael Brown as a match', timestamp: '1 day ago', type: 'recommendation' }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {currentUser?.name}! 👋</h1>
              <p className="text-gray-600 mt-1">Here&apos;s what&apos;s happening with your research collaborations</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => <StatCard key={index} icon={stat.icon} label={stat.label} value={stat.value} color={stat.color} to={stat.to} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200"><h2 className="text-xl font-bold text-gray-900">Recent Activities</h2></div>
                  <div className="divide-y divide-gray-200">{activities.map(activity => <ActivityItem key={activity.id} activity={activity} />)}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4"><Bell className="w-5 h-5 text-primary-600" /><h3 className="font-semibold text-gray-900">Notifications</h3><span className="ml-auto bg-accent-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">3</span></div>
                  <div className="space-y-3">
                    <NotificationItem title="New Collaboration Request" time="Just now" unread onClick={() => navigate('/requests')} />
                    <NotificationItem title="Request Accepted" time="2 hours ago" onClick={() => navigate('/requests')} />
                    <NotificationItem title="Project Update" time="5 hours ago" onClick={() => navigate('/projects')} />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-sm p-6 text-white space-y-3">
                  <h3 className="font-semibold">Quick Actions</h3>
                  <button onClick={() => navigate('/settings')} className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium flex items-center gap-2"><Edit className="w-4 h-4" />Edit Profile</button>
                  <button onClick={() => navigate('/directory')} className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium">→ Find Collaborators</button>
                  <button onClick={() => navigate('/requests')} className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium">→ View Requests</button>
                  <button onClick={() => navigate('/projects')} className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium">→ Explore Projects</button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Complete Your Profile</h3>
                  <p className="text-xs text-blue-700 mb-3">Add more details to improve your match recommendations</p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mb-3"><div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }} /></div>
                  <button onClick={() => navigate('/settings')} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition">Edit Profile</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function FacultyAction({ icon: Icon, title, description, action, onClick }) {
  return (
    <button onClick={onClick} className="text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-md transition group">
      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mb-4"><Icon className="w-5 h-5" /></div>
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-2 min-h-16">{description}</p>
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 mt-4">{action}<ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" /></span>
    </button>
  )
}

function FacultyStep({ number, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-9 h-9 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-sm font-bold">{number}</div>
      <div><h3 className="font-semibold text-gray-900">{title}</h3><p className="text-sm text-gray-600 mt-1">{description}</p></div>
    </div>
  )
}

function ActivityItem({ activity }) {
  const icons = { acceptance: '✓', request: '?', project_join: '+', recommendation: '⭐' }
  return (
    <div className="p-6 hover:bg-gray-50 transition cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">{icons[activity.type] || '•'}</div>
        <div className="flex-1 min-w-0"><p className="text-gray-900"><span className="font-semibold">{activity.user}</span> {activity.action}</p><p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p></div>
      </div>
    </div>
  )
}

function NotificationItem({ title, time, unread, onClick }) {
  return (
    <button onClick={onClick} className={`w-full p-3 rounded-lg ${unread ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'} cursor-pointer hover:shadow-sm transition text-left`}>
      <div className="flex items-start justify-between">
        <div className="flex-1"><p className={`text-sm ${unread ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>{title}</p><p className="text-xs text-gray-500 mt-1">{time}</p></div>
        {unread && <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />}
      </div>
    </button>
  )
}
