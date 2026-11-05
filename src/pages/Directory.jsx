import { useState } from 'react'
import { Search, Filter, MapPin, Briefcase } from 'lucide-react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Directory() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [researchDomainFilter, setResearchDomainFilter] = useState('')
  const navigate = useNavigate()

  // Mock data
  const researchers = [
    {
      id: 1,
      name: 'Dr. Emily Chen',
      role: 'Faculty',
      department: 'Computer Science',
      skillTags: ['Machine Learning', 'AI', 'Deep Learning'],
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      matchScore: 92
    },
    {
      id: 2,
      name: 'Prof. James Wilson',
      role: 'Faculty',
      department: 'Physics',
      skillTags: ['Quantum Computing', 'Research', 'Collaboration'],
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      matchScore: 87
    },
    {
      id: 3,
      name: 'Sarah Anderson',
      role: 'Student',
      department: 'Biology',
      skillTags: ['Biomedical Research', 'Lab Work', 'Data Analysis'],
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      matchScore: 78
    },
    {
      id: 4,
      name: 'Michael Brown',
      role: 'Faculty',
      department: 'Chemistry',
      skillTags: ['Organic Chemistry', 'Research', 'Publishing'],
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      matchScore: 85
    }
  ]

  const matchRecommendations = researchers.slice(0, 3)

  const filteredResearchers = researchers.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.skillTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesDept = !departmentFilter || r.department === departmentFilter
    const matchesDomain = !researchDomainFilter || r.skillTags.includes(researchDomainFilter)
    return matchesSearch && matchesDept && matchesDomain
  })

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Directory & Search</h1>
              <p className="text-gray-600 mt-1">
                Find researchers and collaborators matching your interests
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Search & Filter Panel */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="font-bold text-gray-900 mb-4">Search & Filter</h2>

                  {/* Search */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keywords
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Department Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Departments</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Physics">Physics</option>
                      <option value="Biology">Biology</option>
                      <option value="Chemistry">Chemistry</option>
                    </select>
                  </div>

                  {/* Research Domain Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Research Domain
                    </label>
                    <select
                      value={researchDomainFilter}
                      onChange={(e) => setResearchDomainFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Domains</option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="AI">AI</option>
                      <option value="Research">Research</option>
                      <option value="Data Analysis">Data Analysis</option>
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2">
                    <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition">
                      Search
                    </button>
                    <button 
                      onClick={() => {
                        setSearchQuery('')
                        setDepartmentFilter('')
                        setResearchDomainFilter('')
                      }}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 rounded-lg transition"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Results & Recommendations */}
              <div className="lg:col-span-3 space-y-8">
                {/* Search Results */}
                <div className="space-y-4">
                  <h2 className="font-bold text-gray-900 text-lg">
                    Search Results ({filteredResearchers.length})
                  </h2>
                  <div className="grid gap-4">
                    {filteredResearchers.map(researcher => (
                      <ResearcherCard 
                        key={researcher.id} 
                        researcher={researcher}
                        onViewProfile={() => navigate(`/profile/${researcher.id}`)}
                      />
                    ))}
                  </div>
                </div>

                {/* Recommended Matches */}
                <div className="bg-gradient-to-br from-accent-50 to-green-50 rounded-xl border border-accent-200 p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-4">
                    🌟 Recommended Matches for You
                  </h2>
                  <div className="grid gap-4">
                    {matchRecommendations.map(researcher => (
                      <div key={researcher.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src={researcher.profilePicture}
                            alt={researcher.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{researcher.name}</p>
                            <p className="text-xs text-gray-500">{researcher.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-sm font-bold">
                            {researcher.matchScore}% Match
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function ResearcherCard({ researcher, onViewProfile }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <img 
            src={researcher.profilePicture}
            alt={researcher.name}
            className="w-16 h-16 rounded-lg"
          />
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{researcher.name}</h3>
            <p className="text-sm text-gray-600">{researcher.role} • {researcher.department}</p>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-600">{researcher.department}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-sm font-bold">
            {researcher.matchScore}%
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {researcher.skillTags.map((tag, idx) => (
            <span key={idx} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action */}
      <button
        onClick={onViewProfile}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition"
      >
        View Profile
      </button>
    </div>
  )
}
