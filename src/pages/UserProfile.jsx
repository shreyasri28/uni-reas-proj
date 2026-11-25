import { useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Briefcase, Heart } from 'lucide-react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import CollaborationRequestModal from '../components/CollaborationRequestModal'
import { mockData } from '../services/mockData'
import { AuthContext } from '../App'

export default function UserProfile() {
  const { userId } = useParams()
  const { currentUser } = useContext(AuthContext)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showCollaborationModal, setShowCollaborationModal] = useState(false)
  const navigate = useNavigate()

  // Get profile data from currentUser if viewing own profile, otherwise from mockData
  const getUserProfile = () => {
    if (currentUser && currentUser.id === userId) {
      // Viewing own profile - use currentUser data
      return {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role || 'Faculty',
        department: currentUser.department || 'Computer Science',
        profilePicture: currentUser.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`,
        about: currentUser.about || 'Passionate researcher focused on innovative projects.',
        researchInterests: currentUser.researchInterests || ['Research', 'Innovation'],
        currentProjects: currentUser.currentProjects || [],
        collaborationSkills: currentUser.collaborationSkills || [],
        yrsExperience: currentUser.yearsExperience || 0,
        publications: currentUser.publications || 0
      }
    }
    
    // Viewing other user's profile - use mockData
    const mockUser = mockData.users.find(u => u.id === userId)
    return mockUser ? {
      id: mockUser.id,
      name: mockUser.name,
      role: mockUser.role === 'faculty' ? 'Faculty' : 'Student',
      department: mockUser.department,
      profilePicture: mockUser.profilePicture,
      about: mockUser.about,
      researchInterests: mockUser.researchInterests,
      currentProjects: [],
      collaborationSkills: mockUser.skills || [],
      yrsExperience: mockUser.yearsExperience || 0,
      publications: 0
    } : null
  }

  const profile = getUserProfile()

  if (!profile) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
          <main className="flex-1 overflow-auto flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
              <button
                onClick={() => navigate('/directory')}
                className="mt-4 text-primary-600 hover:text-primary-700 font-semibold"
              >
                Back to Directory
              </button>
            </div>
          </main>
        </div>
      </div>
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
          <div className="p-8">
            {/* Back Button */}
            <button
              onClick={() => navigate('/directory')}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Directory
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Profile */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-700"></div>
                  
                  <div className="px-8 pb-8">
                    <div className="flex items-start justify-between -mt-16 mb-6">
                      <img 
                        src={profile.profilePicture}
                        alt={profile.name}
                        className="w-32 h-32 rounded-xl border-4 border-white shadow-lg"
                      />
                      <button
                        onClick={() => setShowCollaborationModal(true)}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition flex items-center gap-2"
                      >
                        <Heart className="w-4 h-4" />
                        Send Collaboration Request
                      </button>
                    </div>

                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                      <p className="text-lg text-gray-600">{profile.role} • {profile.department}</p>
                      <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                        <span>{profile.yrsExperience} years experience</span>
                        <span>•</span>
                        <span>{profile.publications} publications</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                  <p className="text-gray-700 leading-relaxed">{profile.about}</p>
                </div>

                {/* Research Interests */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Research Interests</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.researchInterests.map((interest, idx) => (
                      <span key={idx} className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Current Projects */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Current Projects
                  </h2>
                  <div className="space-y-3">
                    {profile.currentProjects.map((project, idx) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{project.members} team members</p>
                          </div>
                          <span className="bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-xs font-bold">
                            {project.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Collaboration Skills */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Collaboration Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.collaborationSkills.map((skill, idx) => (
                      <span key={idx} className="bg-accent-50 text-accent-700 px-4 py-2 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Info Card */}
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Quick Info</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600">Role</p>
                      <p className="font-semibold text-gray-900">{profile.role}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Department</p>
                      <p className="font-semibold text-gray-900">{profile.department}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Experience</p>
                      <p className="font-semibold text-gray-900">{profile.yrsExperience} years</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Publications</p>
                      <p className="font-semibold text-gray-900">{profile.publications}</p>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Contact</h3>
                  <button className="w-full flex items-center justify-center gap-2 bg-primary-100 hover:bg-primary-200 text-primary-700 font-semibold py-2 rounded-lg transition">
                    <Mail className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Collaboration Modal */}
      {showCollaborationModal && (
        <CollaborationRequestModal
          targetName={profile.name}
          onClose={() => setShowCollaborationModal(false)}
        />
      )}
    </div>
  )
}
