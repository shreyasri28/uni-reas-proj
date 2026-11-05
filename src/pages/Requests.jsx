import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../App'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

const initialRequests = [
  {
    id: 1,
    from: 'Dr. Emily Chen',
    to: 'You',
    topic: 'AI for Medical Imaging',
    message: 'Would love to collaborate on the imaging pipeline and model validation for the next paper iteration.',
    status: 'pending',
    time: '2 hours ago',
    priority: 'High'
  },
  {
    id: 2,
    from: 'Sarah Anderson',
    to: 'You',
    topic: 'Bioinformatics Study Group',
    message: 'I’d like to invite you to co-lead a literature review on experimental design and computational analysis.',
    status: 'pending',
    time: '1 day ago',
    priority: 'Medium'
  },
  {
    id: 3,
    from: 'Prof. James Wilson',
    to: 'You',
    topic: 'Quantum Research Collaboration',
    message: 'Your profile matches our current research direction. We would like to set up a team meeting this week.',
    status: 'accepted',
    time: '3 days ago',
    priority: 'Low'
  }
]

export default function Requests() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filter, setFilter] = useState('all')
  const { currentUser } = useContext(AuthContext)
  const storageKey = 'uni-reas-requests-' + (currentUser?.id || 'guest')
  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : initialRequests
    } catch {
      return initialRequests
    }
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(requests))
  }, [requests, storageKey])

  const filteredRequests = useMemo(() => {
    if (filter === 'all') return requests
    return requests.filter(request => request.status === filter)
  }, [filter, requests])

  const updateStatus = (id, status) => {
    setRequests(prev =>
      prev.map(request =>
        request.id === id ? { ...request, status } : request
      )
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Collaboration Requests</h1>
              <p className="text-gray-600 mt-2 text-lg">Here you can review and manage incoming collaboration requests.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">Requests</span>
                  <span className="bg-primary-50 text-primary-700 rounded-full px-2.5 py-1 text-xs font-semibold">
                    {filteredRequests.length}
                  </span>
                </div>

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No requests in this filter.</div>
                ) : (
                  filteredRequests.map((request) => (
                    <div key={request.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="w-11 h-11 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                              {request.from.split(' ').map(name => name[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{request.from}</h3>
                              <p className="text-sm text-gray-500">{request.time}</p>
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-500">Project:</span>
                              <span className="font-semibold text-gray-900">{request.topic}</span>
                              <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${
                                request.priority === 'High'
                                  ? 'bg-red-100 text-red-700'
                                  : request.priority === 'Medium'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {request.priority}
                              </span>
                            </div>

                            <p className="text-gray-700 leading-relaxed max-w-3xl">{request.message}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-start lg:items-end gap-3 min-w-[180px]">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${
                            request.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : request.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                          }`}>
                            {request.status}
                          </span>

                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateStatus(request.id, 'accepted')}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => updateStatus(request.id, 'rejected')}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
