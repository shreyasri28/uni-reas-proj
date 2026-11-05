import axios from 'axios'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
      window.location.href = '/signin'
    }
    return Promise.reject(error)
  }
)

// Auth Service
export const authService = {
  signin: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/signin', { email, password })
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('currentUser', JSON.stringify(response.data.user))
      }
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Sign in failed')
    }
  },

  signup: async (userData) => {
    try {
      const response = await apiClient.post('/auth/signup', userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Sign up failed')
    }
  },

  verifyEmail: async (email, code) => {
    try {
      const response = await apiClient.post('/auth/verify-email', { email, code })
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
      }
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Email verification failed')
    }
  },

  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
  }
}

// User Service
export const userService = {
  getProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile')
    }
  },

  updateProfile: async (userId, data) => {
    try {
      const response = await apiClient.put(`/users/${userId}`, data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile')
    }
  },

  searchUsers: async (query, filters = {}) => {
    try {
      const response = await apiClient.get('/users/search', {
        params: { q: query, ...filters }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Search failed')
    }
  },

  getRecommendedMatches: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}/recommendations`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recommendations')
    }
  }
}

// Collaboration Service
export const collaborationService = {
  sendRequest: async (data) => {
    try {
      const response = await apiClient.post('/collaborations/requests', data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send request')
    }
  },

  getRequests: async (status = 'all') => {
    try {
      const response = await apiClient.get('/collaborations/requests', {
        params: { status }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch requests')
    }
  },

  respondToRequest: async (requestId, status) => {
    try {
      const response = await apiClient.put(`/collaborations/requests/${requestId}`, { status })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to respond to request')
    }
  },

  getCollaborations: async () => {
    try {
      const response = await apiClient.get('/collaborations')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch collaborations')
    }
  }
}

// Project Service
export const projectService = {
  getProjects: async () => {
    try {
      const response = await apiClient.get('/projects')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch projects')
    }
  },

  getProject: async (projectId) => {
    try {
      const response = await apiClient.get(`/projects/${projectId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch project')
    }
  },

  createProject: async (data) => {
    try {
      const response = await apiClient.post('/projects', data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create project')
    }
  },

  getMessages: async (projectId) => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/messages`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch messages')
    }
  },

  sendMessage: async (projectId, message) => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/messages`, { message })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send message')
    }
  }
}

// Admin Service
export const adminService = {
  getStats: async () => {
    try {
      const response = await apiClient.get('/admin/stats')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch stats')
    }
  },

  getUsers: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get('/admin/users', {
        params: { page, limit }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users')
    }
  },

  updateUser: async (userId, data) => {
    try {
      const response = await apiClient.put(`/admin/users/${userId}`, data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user')
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  },

  getCollaborationRequests: async (status = 'all') => {
    try {
      const response = await apiClient.get('/admin/collaboration-requests', {
        params: { status }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch collaboration requests')
    }
  },

  getAnalytics: async (period = 'month') => {
    try {
      const response = await apiClient.get('/admin/analytics', {
        params: { period }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics')
    }
  }
}

export default apiClient
