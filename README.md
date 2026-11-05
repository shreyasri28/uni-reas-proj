# University Research Collaboration Portal

A modern, responsive web application built with React, Tailwind CSS, and Lucide Icons for managing university research collaborations. This platform connects students, faculty, and researchers to facilitate collaborative research projects.

## 🚀 Features

### Authentication & Onboarding
- Sign In / Sign Up with email verification
- Role-based account creation (Student / Faculty)
- Email verification with 6-digit OTP
- Secure session management

### User Dashboard
- Personalized welcome with user stats
- Quick access to projects, collaborations, and requests
- Real-time notifications
- Recent activity feed
- Profile completion progress tracker

### Directory & Discovery
- Searchable researcher directory
- Filter by department and research domain
- AI-powered match recommendations (similarity scoring)
- User profile cards with skills and interests
- Match score display

### User Profiles
- Detailed researcher/faculty profiles
- Research interests and skills showcase
- Current projects overview
- Publication and experience metrics
- Collaboration request modal

### Collaboration Workflow
- Send and receive collaboration requests
- Accept/reject requests
- Collaboration request messaging
- Project-based communication hub

### Project Hub
- Integrated chat system for team communication
- Shared file management
- Task tracking and assignment
- Project activity timeline

### Admin Panel
- User management and statistics
- Collaboration request approval workflow
- System analytics and reporting
- Bar chart visualizations
- Metrics dashboard

## 🛠 Tech Stack

- **Frontend Framework**: React 18.2.0
- **Styling**: Tailwind CSS 3.3.0
- **UI Icons**: Lucide React 0.294.0
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Build Tool**: Vite 5.0.0
- **Package Manager**: npm

## 📋 Prerequisites

- Node.js 16.0 or higher
- npm 8.0 or higher

## 🔧 Installation

1. **Clone the repository** (or extract the project)
```bash
cd "Uni Reas"
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env.local
```

4. **Update environment variables** (optional)
Edit `.env.local` to configure API endpoints (Vite requires the `VITE_` prefix):
```
VITE_API_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=true
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The application will start on `http://localhost:5173`

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   ├── StatCard.jsx
│   ├── EmailVerificationModal.jsx
│   └── CollaborationRequestModal.jsx
├── pages/              # Page components
│   ├── SignIn.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Directory.jsx
│   ├── UserProfile.jsx
│   ├── ProjectHub.jsx
│   └── AdminPanel.jsx
├── services/           # API and data services
│   ├── api.js         # Axios client and API endpoints
│   └── mockData.js    # Mock data for development
├── App.jsx            # Main app component with routing
├── main.jsx           # App entry point
└── index.css          # Global styles

public/               # Static assets
tailwind.config.js    # Tailwind configuration
vite.config.js        # Vite configuration
postcss.config.js     # PostCSS configuration
package.json          # Dependencies and scripts
```

## 🔐 Authentication Flow

### Mock Authentication
For development, the app uses mock authentication:
- **Demo Email**: demo@university.edu
- **Demo Password**: password123
- **Registration demo OTP**: 123456 (no email is sent)

Demo users are stored in browser `localStorage` (`currentUser` and `registeredUsers`). This is for local demonstration only; it is not secure production authentication.

### Production Integration
To integrate with a backend API:

1. Update API endpoints in `src/services/api.js`
2. The `authService` module handles authentication requests:
```javascript
// Sign in
await authService.signin(email, password)

// Sign up
await authService.signup(userData)

// Email verification
await authService.verifyEmail(email, code)

// Logout
authService.logout()
```

## 🔗 API Integration

The application includes a comprehensive API service layer in `src/services/api.js`:

### Available Services

#### User Service
```javascript
import { userService } from './services/api'

// Get user profile
await userService.getProfile(userId)

// Update profile
await userService.updateProfile(userId, data)

// Search users
await userService.searchUsers(query, filters)

// Get recommendations
await userService.getRecommendedMatches(userId)
```

#### Collaboration Service
```javascript
import { collaborationService } from './services/api'

// Send request
await collaborationService.sendRequest(data)

// Get requests
await collaborationService.getRequests(status)

// Respond to request
await collaborationService.respondToRequest(requestId, status)
```

#### Project Service
```javascript
import { projectService } from './services/api'

// Get projects
await projectService.getProjects()

// Get project details
await projectService.getProject(projectId)

// Get messages
await projectService.getMessages(projectId)

// Send message
await projectService.sendMessage(projectId, message)
```

#### Admin Service
```javascript
import { adminService } from './services/api'

// Get statistics
await adminService.getStats()

// Manage users
await adminService.getUsers(page, limit)
await adminService.updateUser(userId, data)
await adminService.deleteUser(userId)
```

## 🎨 Theming

### Color Palette

**Primary Colors**
- Primary-600: `#1e3a5f` (Navy Blue)
- Primary-900: `#0d0f1f` (Dark Navy)

**Accent Colors**
- Accent-500: `#10b981` (Emerald Green)
- Accent-600: `#059669`

**Neutral Colors**
- Gray-50 to Gray-900 (Standard grayscale)

### Customizing Theme
Edit `tailwind.config.js` to adjust colors, spacing, or typography.

## 🔄 Component Usage Examples

### StatCard
```jsx
import StatCard from './components/StatCard'
import { Users } from 'lucide-react'

<StatCard
  icon={Users}
  label="Collaborators"
  value="12"
  color="blue"
/>
```

### CollaborationRequestModal
```jsx
import CollaborationRequestModal from './components/CollaborationRequestModal'

<CollaborationRequestModal
  targetName="Dr. Jane Smith"
  onClose={() => setShowModal(false)}
/>
```

## 📱 Responsive Design

The application is fully responsive across:
- **Desktop** (1920px and above)
- **Tablet** (768px - 1919px)
- **Mobile** (320px - 767px)

## ⚙️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (when configured)

## 🐛 Mock Data

For development purposes, the app includes comprehensive mock data in `src/services/mockData.js`:

- 3+ sample users with profiles
- 2+ sample projects
- Collaboration requests
- Activity feeds
- Admin statistics

To switch between mock and real data, update the `useMockData` flag in `.env`.

## 🔐 Security Considerations

- **Tokens**: Store in `localStorage` (consider `httpOnly` cookies for production)
- **CORS**: Configure on backend to allow your domain
- **API Keys**: Never commit to repository; use environment variables
- **Validation**: Implement both client-side and server-side validation

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Supported Platforms
- Vercel (recommended for Vite)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Traditional hosting (nginx, Apache)

### Build Output
The `dist/` folder contains production-ready files.

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [Vite Documentation](https://vitejs.dev)
- [Axios Documentation](https://axios-http.com)

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the University Research Collaboration initiative.

## 💬 Support

For issues, questions, or suggestions, please contact the development team or create an issue in the repository.

## 🎯 Next Steps

1. **Configure Backend**: Connect to your actual API by updating `VITE_API_URL` in `.env`
2. **Add Authentication**: Implement backend authentication with JWT tokens
3. **Database**: Set up database for persistent data storage
4. **Testing**: Add unit and integration tests
5. **Deployment**: Configure CI/CD pipeline and deploy to production

---

**Happy Coding! 🚀**
