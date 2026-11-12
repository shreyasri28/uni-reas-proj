import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
)

const messageFrom = (error, fallback) => error.response?.data?.message || fallback

export const authService = {
  signin: async (email, password) => {
    try {
      const { data } = await apiClient.post('/auth/signin', { email, password })
      if (data.token) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('currentUser', JSON.stringify(data.user))
      }
      return data
    } catch (error) {
      throw new Error(messageFrom(error, 'Sign in failed'))
    }
  },
  signup: async userData => {
    try {
      const { data } = await apiClient.post('/auth/register', userData)
      return data
    } catch (error) {
      throw new Error(messageFrom(error, 'Registration failed'))
    }
  },
  verifyEmail: async (email, code) => {
    try {
      const { data } = await apiClient.post('/auth/verify-email', { email, code })
      if (data.token) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('currentUser', JSON.stringify(data.user))
      }
      return data
    } catch (error) {
      throw new Error(messageFrom(error, 'Email verification failed'))
    }
  },
  resendCode: async email => {
    try {
      const { data } = await apiClient.post('/auth/resend-code', { email })
      return data
    } catch (error) {
      throw new Error(messageFrom(error, 'Could not resend the verification code'))
    }
  },
  getMe: async () => {
    try {
      const { data } = await apiClient.get('/auth/me')
      return data.user
    } catch (error) {
      throw new Error(messageFrom(error, 'Your session is invalid or has expired'))
    }
  },
  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
  }
}

export const userService = {
  getProfile: async userId => {
    try { return (await apiClient.get(`/users/${userId}`)).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to fetch profile')) }
  },
  updateProfile: async (userId, data) => {
    try { return (await apiClient.put(`/users/${userId}`, data)).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to update profile')) }
  },
  searchUsers: async (query, filters = {}) => {
    try { return (await apiClient.get('/users/search', { params: { q: query, ...filters } })).data }
    catch (error) { throw new Error(messageFrom(error, 'Search failed')) }
  },
  getRecommendedMatches: async userId => {
    try { return (await apiClient.get(`/users/${userId}/recommendations`)).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to fetch recommendations')) }
  }
}

export const collaborationService = {
  sendRequest: async data => {
    try { return (await apiClient.post('/collaborations/requests', data)).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to send request')) }
  },
  getRequests: async (status = 'all') => {
    try { return (await apiClient.get('/collaborations/requests', { params: { status } })).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to fetch requests')) }
  },
  respondToRequest: async (requestId, status) => {
    try { return (await apiClient.put(`/collaborations/requests/${requestId}`, { status })).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to respond to request')) }
  },
  getCollaborations: async () => {
    try { return (await apiClient.get('/collaborations')).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to fetch collaborations')) }
  }
}

export const projectService = {
  getProjects: async () => {
    try { return (await apiClient.get('/projects')).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to fetch projects')) }
  },
  getProject: async projectId => {
    try { return (await apiClient.get(`/projects/${projectId}`)).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to fetch project')) }
  },
  createProject: async data => {
    try { return (await apiClient.post('/projects', data)).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to create project')) }
  },
  getMessages: async projectId => {
    try { return (await apiClient.get(`/projects/${projectId}/messages`)).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to fetch messages')) }
  },
  sendMessage: async (projectId, message) => {
    try { return (await apiClient.post(`/projects/${projectId}/messages`, { message })).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to send message')) }
  }
}

export const adminService = {
  getStats: async () => {
    try { return (await apiClient.get('/admin/stats')).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to fetch stats')) }
  },
  getUsers: async (page = 1, limit = 10) => {
    try { return (await apiClient.get('/admin/users', { params: { page, limit } })).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to fetch users')) }
  },
  updateUser: async (userId, data) => {
    try { return (await apiClient.put(`/admin/users/${userId}`, data)).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to update user')) }
  },
  deleteUser: async userId => {
    try { return (await apiClient.delete(`/admin/users/${userId}`)).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to delete user')) }
  },
  getCollaborationRequests: async (status = 'all') => {
    try { return (await apiClient.get('/admin/collaboration-requests', { params: { status } })).data }
    catch (error) { throw new Error(messageFrom(error, 'Failed to fetch collaboration requests')) }
  }
}

export default apiClient
