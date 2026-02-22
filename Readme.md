# Taskflow - A Project Management System

Taskflow is a comprehensive project management and team collaboration platform built with modern web technologies. It enables teams to organize projects, manage tasks, track progress, and collaborate efficiently with subscription-based feature tiers.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [Project Structure](#project-structure)
6. [Installation & Setup](#installation--setup)
7. [Database Schema](#database-schema)
8. [API Documentation](#api-documentation)
9. [Authentication & Authorization](#authentication--authorization)
10. [Deployment](#deployment)

---

## 🎯 Project Overview

Taskflow is a full-stack web application that allows users to:
- Create and manage multiple workspaces
- Organize projects with team members
- Create and assign tasks with priorities and deadlines
- Track project progress and analytics
- Collaborate through comments and activity feeds
- Subscribe to plans for extended features

### Core Capabilities:
- **Multi-workspace support** with role-based access control
- **Subscription tiers** (FREE and PRO) with feature limits
- **Real-time collaboration** with comments and activity tracking
- **Dark/Light theme** support
- **Invite system** for adding team members
- **Analytics & reporting** for projects and tasks

---

## 🏗️ System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND - React/Vite                     │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ UI Components│  │ Redux Store │  │  Context API     │   │
│  │ (Navbar,     │  │(Workspace,  │  │  (UserContext)   │   │
│  │ Sidebar,     │  │ Theme)      │  │                  │   │
│  │ Cards)       │  │             │  │                  │   │
│  └──────────────┘  └─────────────┘  └──────────────────┘   │
│         │                │                    │              │
│         └────────────────┴────────────────────┘              │
│                         │                                    │
│              ┌──────────▼──────────┐                         │
│              │   Axios Instance    │                         │
│              │  (API Communication)│                         │
│              └────────────┬────────┘                         │
└───────────────────────────┼───────────────────────────────────┘
                            │
                   REST API (/api/*)
                            │
┌───────────────────────────▼───────────────────────────────────┐
│              BACKEND - Node.js/Express                         │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────┐         │
│  │  Routes  │  │ Controllers │  │  Middleware      │         │
│  │  (/api)  │  │ (Business   │  │ (Auth, Perms)    │         │
│  │          │  │  Logic)     │  │                  │         │
│  └────┬─────┘  └──────┬──────┘  └────────┬─────────┘         │
│       │               │                  │                   │
│       └───────────────┼──────────────────┘                   │
│                       │                                      │
│            ┌──────────▼──────────┐                           │
│            │  MongoDB Models     │                           │
│            │ (User, Workspace,   │                           │
│            │  Project, Task...)  │                           │
│            └────────────┬────────┘                           │
└───────────────────────────┼───────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────┐
│            DATABASE - MongoDB                                 │
│  ┌──────┐  ┌───────────┐  ┌────────┐  ┌──────┐  ┌────────┐  │
│  │Users │  │Workspaces │  │Projects│  │Tasks │  │Comments│  │
│  │      │  │           │  │        │  │      │  │        │  │
│  └──────┘  └───────────┘  └────────┘  └──────┘  └────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### Architecture Layers

#### **1. Frontend Layer (React + Vite)**
- **UI Components**: Reusable React components for buttons, cards, dialogs, forms
- **Pages**: Route-based pages for different features (Auth, Dashboard, Projects, Tasks)
- **State Management**: Redux for workspace/theme state, Context API for user data
- **API Communication**: Axios instance with interceptors for JWT tokens
- **Custom Hooks**: Reusable logic like `useUserAuth` for authentication

#### **2. Backend Layer (Node.js + Express)**
- **Routes**: API endpoints organized by feature (auth, projects, tasks, workspaces)
- **Controllers**: Business logic handlers for each route
- **Middleware**: Authentication and authorization checks
- **Models**: MongoDB schemas with validation rules

#### **3. Database Layer (MongoDB)**
- **Data Persistence**: MongoDB collections for all entities
- **Relationships**: Document references between collections
- **Queries**: Optimized queries for efficient data retrieval

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI framework | 18+ |
| **Vite** | Build tool & dev server | Latest |
| **Redux Toolkit** | State management | Latest |
| **Axios** | HTTP client | Latest |
| **Tailwind CSS** | Styling framework | Latest |
| **Lucide React** | Icon library | Latest |
| **React Router** | Client-side routing | v6+ |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime environment | 14+ |
| **Express.js** | Web framework | 4+ |
| **MongoDB** | Database | Latest |
| **JWT** | Authentication | Standard |
| **bcrypt** | Password hashing | Latest |
| **CORS** | Cross-origin requests | Latest |

---

## ✨ Features

### 1. **Authentication & User Management**
- User registration and login with JWT tokens
- Password hashing with bcrypt
- Session management
- Logout functionality

### 2. **Workspace Management**
- Create multiple workspaces
- Add and manage team members
- Role-based access control (ADMIN, MEMBER)
- Workspace invitations with email verification
- Switch between workspaces seamlessly

### 3. **Project Management**
- Create projects with descriptions
- Set project status (PLANNING, IN_PROGRESS, COMPLETED)
- Assign team members to projects
- Track project progress with performance metrics
- Project settings and configurations

### 4. **Task Management**
- Create tasks within projects
- Assign tasks to team members
- Set priorities (HIGH, MEDIUM, LOW) and due dates
- Track task status (TODO, IN_PROGRESS, COMPLETED)
- Task commenting and discussions
- My Tasks view with personal task dashboard

### 5. **Analytics & Dashboard**
- Dashboard with key metrics (total projects, completed projects, my tasks)
- Project overview with status breakdown
- Recent activity feed
- Analytics with progress visualization
- Task summary statistics

### 6. **Subscription Management**
- FREE plan with basic limits (3 projects, 10 tasks)
- PRO plan with extended features (unlimited projects, 50 tasks)
- Subscription status display
- Upgrade option for admins

### 7. **Collaboration Features**
- Comments on tasks
- Activity tracking and recent activity feed
- Team member invitations
- Project member management
- Workspace member roles

### 8. **UI/UX Features**
- Dark/Light theme toggle
- Responsive design (mobile, tablet, desktop)
- Search functionality (projects & tasks)
- Sidebar navigation with collapsible menus
- Real-time updates

---

## 📁 Project Structure

```
Taskflow-A-Project-Management-System/
│
├── frontend/                          # React Vite Application
│   ├── src/
│   │   ├── components/               # Reusable React components
│   │   │   ├── Navbar.jsx            # Top navigation bar
│   │   │   ├── Sidebar.jsx           # Left sidebar navigation
│   │   │   ├── ProjectCard.jsx       # Project display card
│   │   │   ├── CreateProjectDialog.jsx # Project creation dialog
│   │   │   ├── CreateTaskDialog.jsx  # Task creation dialog
│   │   │   ├── InviteMemberDialog.jsx # Invite team members
│   │   │   ├── ProjectSettings.jsx   # Project configuration
│   │   │   ├── ProjectAnalytics.jsx  # Analytics visualization
│   │   │   ├── StatsGrid.jsx         # Dashboard stats
│   │   │   ├── RecentActivity.jsx    # Activity feed
│   │   │   └── [More components...]
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx         # Login page
│   │   │   │   └── Signup.jsx        # Registration page
│   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   ├── Projects.jsx          # Projects list
│   │   │   ├── ProjectDetails.jsx    # Project details page
│   │   │   ├── TaskDetails.jsx       # Task details page
│   │   │   ├── Team.jsx              # Team management
│   │   │   ├── Subscription.jsx      # Subscription page
│   │   │   ├── AcceptInvite.jsx      # Workspace invite acceptance
│   │   │   └── Layout.jsx            # Main layout wrapper
│   │   │
│   │   ├── features/                 # Redux slices
│   │   │   ├── themeSlice.js         # Theme toggle logic
│   │   │   └── workspaceSlice.js     # Workspace state
│   │   │
│   │   ├── context/                  # React Context
│   │   │   └── UserContext.jsx       # User authentication context
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   └── useUserAuth.jsx       # Authentication hook
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── axiosInstance.js      # Axios configuration
│   │   │   └── apiPaths.js           # API endpoint constants
│   │   │
│   │   ├── app/                      # Redux store configuration
│   │   │   └── store.js              # Redux store setup
│   │   │
│   │   ├── assets/                   # Static assets
│   │   │   └── assets.js
│   │   │
│   │   ├── App.jsx                   # Root component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   │
│   ├── public/                       # Static files
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── eslint.config.js
│   └── .env                          # Environment variables
│
├── backend/                           # Node.js/Express Application
│   ├── routes/                       # API route handlers
│   │   ├── auth.routes.js            # Authentication endpoints
│   │   ├── project.routes.js         # Project endpoints
│   │   ├── task.routes.js            # Task endpoints
│   │   ├── workspace.routes.js       # Workspace endpoints
│   │   ├── subscription.routes.js    # Subscription endpoints
│   │   ├── team.routes.js            # Team management endpoints
│   │   ├── dashboard.routes.js       # Dashboard endpoints
│   │   └── comment.routes.js         # Comments endpoints
│   │
│   ├── controllers/                  # Business logic
│   │   ├── auth.controller.js        # Auth logic (login, signup, logout)
│   │   ├── project.controller.js     # Project CRUD operations
│   │   ├── task.controller.js        # Task CRUD operations
│   │   ├── workspace.controller.js   # Workspace management logic
│   │   ├── subscription.controller.js # Subscription handling
│   │   ├── team.controller.js        # Team management logic
│   │   ├── dashboard.controller.js   # Dashboard data aggregation
│   │   └── comment.controller.js     # Comment operations
│   │
│   ├── models/                       # MongoDB schemas
│   │   ├── user.model.js             # User schema
│   │   ├── workspace.model.js        # Workspace schema
│   │   ├── workspaceMember.model.js  # Workspace member mapping
│   │   ├── workspaceInvite.model.js  # Workspace invite tokens
│   │   ├── project.model.js          # Project schema
│   │   ├── projectMember.model.js    # Project member mapping
│   │   ├── task.model.js             # Task schema
│   │   ├── comment.model.js          # Comment schema
│   │   └── subscriptionPlan.model.js # Subscription plans
│   │
│   ├── middleware/                   # Custom middleware
│   │   ├── auth.middleware.js        # JWT verification
│   │   └── workspace.middleware.js   # Workspace & permission checks
│   │
│   ├── config/                       # Configuration files
│   │   └── db.js                     # MongoDB connection
│   │
│   ├── utils/                        # Utility functions
│   │   ├── emailService.js           # Email sending logic
│   │   ├── inviteTokenUtils.js       # Invite token generation
│   │   ├── subscriptionUtils.js      # Subscription limit checks
│   │   └── seedData.js               # Database seed data
│   │
│   ├── server.js                     # Express server setup
│   ├── package.json
│   └── .env                          # Environment variables
│
└── README.md                          # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

4. **Start the server**
```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start the development server**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

---

## 💾 Database Schema

### ER Diagram
```mermaid
erDiagram
  USER ||--o{ WORKSPACE : owns
  WORKSPACE ||--o{ WORKSPACEMEMBER : has
  USER ||--o{ WORKSPACEMEMBER : belongs_to
  WORKSPACE ||--o{ PROJECT : contains
  PROJECT ||--o{ TASK : contains
  TASK ||--o{ COMMENT : has
  WORKSPACE ||--o{ SUBSCRIPTION : has
  SUBSCRIPTION }o--|| SUBSCRIPTIONPLAN : uses
  WORKSPACE ||--|| WORKSPACEUSAGE : tracks
  PROJECT ||--o{ PROJECTMEMBER : includes
  USER ||--o{ PROJECTMEMBER : assigned
```

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  workspaces: [ObjectId], // References to Workspace
  createdAt: Date,
  updatedAt: Date
}
```

### Workspace Collection
```javascript
{
  _id: ObjectId,
  name: String,
  owner: ObjectId, // Reference to User
  plan: ObjectId, // Reference to SubscriptionPlan
  members: [ObjectId], // References to WorkspaceMember
  projects: [ObjectId], // References to Project
  createdAt: Date,
  updatedAt: Date
}
```

### Project Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  workspaceId: ObjectId, // Reference to Workspace
  status: String, // PLANNING, IN_PROGRESS, COMPLETED
  priority: String, // HIGH, MEDIUM, LOW
  start_date: Date,
  end_date: Date,
  team_lead: String,
  progress: Number, // 0-100
  createdAt: Date,
  updatedAt: Date
}
```

### Task Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  projectId: ObjectId, // Reference to Project
  workspaceId: ObjectId, // Reference to Workspace
  assigneeId: ObjectId, // Reference to User
  status: String, // TODO, IN_PROGRESS, COMPLETED
  priority: String, // HIGH, MEDIUM, LOW
  type: String, // FEATURE, BUG, IMPROVEMENT
  due_date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Comment Collection
```javascript
{
  _id: ObjectId,
  content: String,
  taskId: ObjectId, // Reference to Task
  authorId: ObjectId, // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

### SubscriptionPlan Collection
```javascript
{
  _id: ObjectId,
  name: String, // "Free Plan" or "Pro Plan"
  slug: String, // "FREE" or "PRO"
  features: [String],
  maxProjects: Number,
  maxTasks: Number,
  maxMembers: Number,
  isDefault: Boolean,
  price: Number
}
```

### Subscription Collection
```javascript
{
  _id: ObjectId,
  workspaceId: ObjectId, // Reference to Workspace
  planId: ObjectId, // Reference to SubscriptionPlan
  status: String, // ACTIVE, EXPIRED
  periodStart: Date,
  periodEnd: Date,
  canceledAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### WorkspaceUsage Collection
```javascript
{
  _id: ObjectId,
  workspaceId: ObjectId, // Reference to Workspace
  counts: {
    projects: Number,
    tasks: Number,
    members: Number
  },
  lastSyncedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Documentation

### Base URL
`http://localhost:5000/api`

### Authentication Endpoints

#### Register User
```
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: { message, token, user }
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { message, token, user }
```

### Project Endpoints

#### Get All Projects
```
GET /projects/get/:workspaceId
Authorization: Bearer <token>

Response: [{ project objects }]
```

#### Create Project (Admin only)
```
POST /projects/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Redesign company website",
  "workspaceId": "workspace_id",
  "status": "PLANNING",
  "priority": "HIGH"
}

Response: { project object }
```

#### Update Project
```
PUT /projects/update/:projectId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated name",
  "status": "IN_PROGRESS"
}

Response: { message, updated project }
```

#### Delete Project
```
DELETE /projects/delete/:projectId
Authorization: Bearer <token>

Response: { message }
```

### Task Endpoints

#### Get Tasks by Workspace
```
GET /tasks/get/workspace/:workspaceId
Authorization: Bearer <token>

Response: [{ task objects }]
```

#### Get Tasks by Project
```
GET /tasks/get/project/:projectId
Authorization: Bearer <token>

Response: [{ task objects }]
```

#### Create Task (Admin only)
```
POST /tasks/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Fix login bug",
  "projectId": "project_id",
  "workspaceId": "workspace_id",
  "status": "TODO",
  "priority": "HIGH"
}

Response: { task object }
```

#### Update Task
```
PUT /tasks/update/:taskId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "assigneeId": "user_id"
}

Response: { message, updated task }
```

### Workspace Endpoints

#### Get All Workspaces
```
GET /workspaces/get
Authorization: Bearer <token>

Response: [{ workspace objects }]
```

#### Create Workspace
```
POST /workspaces/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Design Team"
}

Response: { workspace object }
```

#### Invite Member to Workspace
```
POST /workspaces/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "member@example.com",
  "workspaceId": "workspace_id"
}

Response: { message, invitation sent }
```

#### Accept Workspace Invite
```
POST /workspaces/accept-invite/:token
Content-Type: application/json

Response: { message, workspace object }
```

### Subscription Endpoints

#### Get Subscription Plans
```
GET /subscription/plans
Authorization: Bearer <token>

Response: [{ plan objects }]
```

#### Update Workspace Plan
```
PUT /subscription/upgrade/:workspaceId
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "pro_plan_id"
}

Response: { message, updated workspace }
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Registration**
   - User submits email, name, password
   - Backend hashes password with bcrypt
   - Creates user in database
   - Generates JWT token

2. **Login**
   - User submits email, password
   - Backend verifies password against hash
   - Generates JWT token
   - Token stored in frontend localStorage

3. **Token Usage**
   - Axios interceptor adds token to Authorization header
   - Backend verifies token in `auth.middleware`
   - If valid, request proceeds; if invalid, 401 Unauthorized

4. **Logout**
   - Frontend clears localStorage
   - Removes user from Redux state
   - Redirects to login page

### Authorization Levels

#### Workspace Level
- **ADMIN**: Can create projects, invite members, manage team, upgrade plan
- **MEMBER**: Can view projects, create/update own tasks, view team

#### Project Level
- **Project Creator/Admin**: Can update project, add members, delete project
- **Project Member**: Can view project, create/update tasks

#### Task Level
- **Task Assignee**: Can update assigned task, add comments
- **Project Admin**: Can update any task in project
- **Workspace Admin**: Can update any task in workspace

### Permission Checks

```javascript
// Workspace Admin check
checkWorkspaceAdmin (middleware)
  → Verifies user role in workspace === 'ADMIN'
  → Used for: Project creation, plan upgrades

// Project Permission check
checkProjectPermission (middleware)
  → Verifies user is in project members or workspace admin
  → Used for: Project updates, member management

// Task Permission check
checkTaskUpdatePermission (middleware)
  → Verifies user is assignee or admin
  → Used for: Task updates, status changes
```

---

## 📤 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the project**
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel**
```bash
npm install -g vercel
vercel
```

3. **Set environment variables** in Vercel dashboard
```env
VITE_API_URL=https://your-backend-url.com/api
```

### Backend Deployment (Heroku/Railway/Render)

1. **Create Procfile**
```
web: node backend/server.js
```

2. **Set environment variables**
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=https://your-frontend-url.com
PORT=5000
```

3. **Deploy**
```bash
git push heroku main
```

### Database (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Create cluster
3. Get connection string
4. Add IP whitelist
5. Set MONGODB_URI in backend .env

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Project Development Timeline

### Commit History Structure
```
1. feat(auth): created authentication with login and signup pages
2. feat(invite,workspace): created invite system and workspace management
3. feat: added projects, tasks, dashboard, subscriptions and configuration
```

### Implemented Features (By Commit)
- **Auth Commit**: User registration, login, authentication context
- **Workspace/Invite Commit**: Multi-workspace support, team invitations, member management
- **Main Commit**: All UI components, state management, API integration, database models

---

## 📊 Key Metrics

- **Total Models**: 9 MongoDB collections
- **API Routes**: 8 feature modules
- **Frontend Components**: 15+ reusable components
- **Pages**: 10+ route-based pages
- **Authentication**: JWT-based with role hierarchies
- **Subscription Tiers**: 2 (FREE, PRO)

---

## 🐛 Troubleshooting

### Backend won't connect to MongoDB
- Check MONGODB_URI in .env
- Verify IP whitelist in MongoDB Atlas
- Test connection string in MongoDB Compass

### Frontend can't reach backend
- Check VITE_API_URL matches backend URL
- Verify backend is running
- Check CORS settings in backend

### JWT token not persisting
- Check if localStorage is enabled
- Verify Axios interceptor is configured
- Check token expiration

### Permission denied errors
- Verify user role in workspace
- Check if user is project member
- Ensure workspace admin for sensitive operations

---

## 📄 License

This project is open source and licensed under the MIT License.

---

## 👥 Support & Feedback

For support, feature requests, or bug reports, please open an issue in the repository.

---

## 🎉 Acknowledgments

Built with ❤️ using React, Node.js, Express, and MongoDB.

Last Updated: February 22, 2026
