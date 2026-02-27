# Taskflow - A Project Management System

Taskflow is a comprehensive project management and team collaboration platform built with modern web technologies. It enables teams to organize projects, manage tasks, track progress, and collaborate efficiently with subscription-based feature tiers.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Features](#-features)
4. [Project Structure](#-project-structure)
5. [Installation & Setup](#-installation--setup)
6. [Authentication & Authorization](#-authentication--authorization)
7. [Deployment](#-deployment)

---

## 📚 Documentation

- [API Documentation](API_DOCUMENTATION.md)
- [Architecture Diagrams](ARCHITECTURE_DIAGRAMS.md)
- [Database Design Rationale](DATABASE_DESIGN_RATIONALE.md)

## 🎯 Project Overview

Taskflow is a full-stack project management platform that helps teams organize their work through:

- **Workspaces**: Multi-tenant isolation with role-based access (ADMIN, MEMBER)
- **Projects**: Organize work with status (ACTIVE, PLANNING, COMPLETED, ON_HOLD, CANCELLED), priority, and team leads
- **Tasks**: Create, assign, and track work items with priorities (LOW, MEDIUM, HIGH), types (TASK, BUG, FEATURE), and due dates
- **Collaboration**: Comments on tasks, team member management, activity tracking
- **Subscriptions**: Flexible plan system (FREE, PRO) with usage limits and feature gates
- **Analytics**: Dashboard with stats (project counts, task counts, overdue items)
- **Invitations**: Email-based workspace member invites with token expiration

### Core Architecture
- **Frontend**: React 19 + Redux + Tailwind CSS, running on Vite
- **Backend**: Node.js/Express REST API with MongoDB
- **Database**: MongoDB with 11 collections for users, workspaces, projects, tasks, subscriptions, and more
- **Auth**: JWT-based authentication with bcryptjs password hashing
- **Middleware**: Multi-layer permission checks (workspace, project, task levels)

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI framework | 19.1.1 |
| **Vite** | Build tool & dev server | 7.1.2 |
| **Redux Toolkit** | State management | 2.8.2 |
| **Axios** | HTTP client | 1.13.5 |
| **Tailwind CSS** | Styling framework | 4.1.12 (@tailwindcss/vite) |
| **Lucide React** | Icon library | 0.540.0 |
| **React Router** | Client-side routing | 7.8.1 |
| **Recharts** | Data visualization | 3.1.2 |
| **React Hot Toast** | Notifications | 2.6.0 |
| **Date-fns** | Date utilities | 4.1.0 |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime environment | 14+ |
| **Express.js** | Web framework | 5.2.1 |
| **MongoDB** | Database | Latest (Mongoose 9.2.1) |
| **JWT** | Authentication | 9.0.3 |
| **bcryptjs** | Password hashing | 3.0.3 |
| **CORS** | Cross-origin requests | 2.8.6 |
| **UUID** | Unique IDs | 13.0.0 |
| **Resend** | Email service | 4.0.0 |
| **Nodemon** | Dev server reload | 3.1.11 |

---

## ✨ Features

### 1. **Authentication & User Management**
- User registration with workspace creation during signup
- Login with JWT token (7-day expiry)
- Password hashing with bcryptjs
- User profiles with name and email
- Token-based authentication

### 2. **Workspace Management**
- Create multiple workspaces with unique slugs
- Workspace ownership and automatic owner setup as ADMIN
- Role-based access control (ADMIN, MEMBER roles)
- Workspace member invitations via email tokens
- Accept/reject workspace invitations with token validation
- Team member management with role assignments
- Workspace usage tracking (projects, tasks, members count)

### 3. **Project Management**
- Create projects with description, priority, status, dates
- Project priorities: LOW, MEDIUM, HIGH
- Project statuses: ACTIVE, PLANNING, COMPLETED, ON_HOLD, CANCELLED
- Project progress tracking (0-100%)
- Assign project team lead
- Add project members with individual member records
- Project CRUD operations with usage limit enforcement
- View projects (filtered by admin or membership status)

### 4. **Task Management**
- Create tasks with title, description, priority, type
- Task types: TASK, BUG, FEATURE, IMPROVEMENT, OTHER
- Task statuses: TODO, IN_PROGRESS, DONE
- Task priorities: LOW, MEDIUM, HIGH
- Assign tasks to project members only
- Set and track due dates
- Query tasks by project or workspace with role-based filtering
- Update task details and assignments
- Delete tasks with usage decrement

### 5. **Dashboard & Analytics**
- Workspace dashboard with key statistics:
  - Total projects count
  - Completed projects count
  - Active tasks count (not DONE)
  - Completed tasks count (DONE status)
  - User's personal tasks count
  - Overdue tasks count (due_date < today, not DONE)
- Admins see all workspace data; members see only their tasks
- Real-time dashboard stats updates

### 6. **Comments & Collaboration**
- Add comments to tasks with content and user info
- View all task comments sorted by creation time
- Edit comments (creator only)
- Delete comments (creator only)
- Comments linked to user names and email avatars
- Member-only access to task comments

### 7. **Subscription Management**
- FREE plan with default limits
- PRO plan (upgradeable) with feature set differences
- Subscription plans with feature lists (e.g., ANALYTICS, CALENDAR)
- Usage limits enforceable per plan:
  - maxProjects (0 = unlimited)
  - maxTasks (0 = unlimited)
  - maxMembers (0 = unlimited)
- Auto-downgrade to FREE on subscription expiration
- Active subscription check before allowed operations
- Subscription periods with start/end dates
- Support for feature-based access control

### 8. **Team & Collaboration Features**
- Invite team members with email-based tokens
- Email invitations with magic links
- Token-based invite acceptance for existing users
- Duplicate duplicate invite prevention
- Token expiration (7 days default)
- Member list with email display
- Workspace member roles: ADMIN, MEMBER

### 9. **UI/UX Features**
- Dark/Light theme toggle (Redux-managed)
- Responsive design with Tailwind CSS 4
- Real-time toast notifications (react-hot-toast)
- Dialog-based project and task creation
- Sidebar navigation with workspace switching
- Icons via Lucide React and React Icons
- Data visualization with Recharts
- Search and filtering capabilities

---

### Database Entities

**Models**
- **User**: name, email, password (hashed)
- **Workspace**: name, slug, description, settings, ownerId, plan reference
- **Project**: name, description, priority, status, dates, team_lead, workspaceId, progress
- **Task**: title, description, status, type, priority, assigneeId, due_date, projectId, workspaceId
- **Comment**: content, userId, taskId, timestamps
- **WorkspaceMember**: userId, workspaceId, role (ADMIN|MEMBER)
- **ProjectMember**: userId, projectId
- **Subscription**: workspaceId, planId, status (ACTIVE|EXPIRED), periodStart, periodEnd
- **SubscriptionPlan**: name, slug, features[], maxProjects, maxTasks, maxMembers, price
- **WorkspaceInvite**: workspaceId, email, token, role, status (PENDING|ACCEPTED|EXPIRED), expiresAt
- **WorkspaceUsage**: workspaceId, counts (projects, tasks, members), lastSyncedAt

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
│   │
│   │   ├── App.jsx                   # Root component with routes
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Global Tailwind styles
│   │
│   ├── public/                       # Static assets
│   ├── package.json
│   ├── vite.config.js               # Vite bundler config
│   ├── eslint.config.js             # ESLint rules
│   ├── index.html                   # HTML template
│   └── .env                         # Frontend env vars (VITE_API_BASE_URL)
│
├── backend/                          # Node.js/Express REST API
│   │
│   ├── server.js                    # Express app, route mounting, CORS setup
│   │
│   ├── config/
│   │   └── db.js                     # MongoDB connection via Mongoose
│   │
│   ├── routes/                       # Express route definitions
│   │   ├── auth.routes.js            # POST /auth/signup, /login, GET /profile
│   │   ├── workspace.routes.js       # Workspace CRUD, invites, members
│   │   ├── project.routes.js         # Project CRUD, member management
│   │   ├── task.routes.js            # Task CRUD, queries by project/workspace
│   │   ├── comment.routes.js         # Comment CRUD on tasks
│   │   ├── dashboard.routes.js       # GET /stats/:workspaceId
│   │   ├── team.routes.js            # GET /:workspaceId (team list)
│   │   └── subscription.routes.js    # GET /plans, POST /upgrade
│   │
│   ├── controllers/                  # Request handlers & business logic
│   │   ├── auth.controller.js        # signup, login, getProfile
│   │   ├── workspace.controller.js   # sendInvite, acceptInvite, getInviteDetails, addMember, etc.
│   │   ├── project.controller.js     # createProject, getProjects, updateProject, deleteProject, addProjectMember
│   │   ├── task.controller.js        # createTask, getTasksByProject, getTasksByWorkspace, updateTask, deleteTask
│   │   ├── comment.controller.js     # getCommentsByTask, createComment, updateComment, deleteComment
│   │   ├── dashboard.controller.js   # getDashboardStats (projects, tasks, overdue counts)
│   │   ├── team.controller.js        # getTeamMembers
│   │   └── subscription.controller.js # upgradeWorkspacePlan, getPlans
│   │
│   ├── middleware/                   # Request processing
│   │   ├── auth.middleware.js        # protect: JWT token verification
│   │   ├── workspace.middleware.js   # checkWorkspaceAdmin, checkWorkspaceMember, checkProjectPermission, etc.
│   │   └── subscription.middleware.js # requireActiveSubscription, enforceUsageLimit, requireFeature
│   │
│   ├── models/                       # Mongoose schemas (11 collections)
│   │   ├── user.model.js             # User: _id, name, email, password
│   │   ├── workspace.model.js        # Workspace: _id, name, slug, ownerId, plan
│   │   ├── workspaceMember.model.js  # WorkspaceMember: userId, workspaceId, role
│   │   ├── workspaceInvite.model.js  # WorkspaceInvite: email, token, role, status, expiresAt
│   │   ├── project.model.js          # Project: name, description, priority, status, dates, workspaceId
│   │   ├── projectMember.model.js    # ProjectMember: userId, projectId
│   │   ├── task.model.js             # Task: title, status, type, priority, assigneeId, projectId
│   │   ├── comment.model.js          # Comment: content, userId, taskId
│   │   ├── subscription.model.js     # Subscription: workspaceId, planId, status, periods
│   │   ├── subscriptionPlan.model.js # SubscriptionPlan: name, slug, features, maxProjects, maxTasks, maxMembers
│   │   └── workspaceUsage.model.js   # WorkspaceUsage: workspaceId, counts (projects, tasks, members)
│   │
│   ├── utils/                        # Helper functions
│   │   ├── emailService.js           # sendInviteEmail() using Resend
│   │   ├── inviteTokenUtils.js       # generateInviteToken(), calculateExpirationDate()
│   │   ├── subscriptionUtils.js      # getWorkspacePlan(), getActiveSubscription(), isSubscriptionActive(), isFeatureAllowed()
│   │   ├── usageUtils.js             # syncUsageCounts(), checkAndIncrementUsage(), decrementUsage(), getUsageDoc()
│   │   └── seedData.js               # seedPlans() - initializes FREE & PRO plans on server start
│   │
│   ├── package.json                  # Dependencies (Express, Mongoose, bcryptjs, JWT, etc.)
│   └── .env                          # Backend env vars (PORT, MONGODB_URI, JWT_SECRET, CLIENT_URL, FRONTEND_URL)
│
└── README.md                          # This documentation file
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
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

3. **Create `.env` file** in backend folder:
```env
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

4. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend API will run on `http://localhost:8000` with routes at `http://localhost:8000/api`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file** in frontend folder:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

4. **Start the development server**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Quick Start (Both)

Open two terminals:

**Terminal 1 - Backend**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` and sign up with a new account (which automatically creates a workspace).

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **User Signup**
   - Validates name, email, password, workspace name
   - Checks for existing user by email
   - Hashes password with bcryptjs (10 salt rounds) via `pre('save')` hook
   - Creates new User document
   - Auto-generates workspace slug (name + random 4-digit suffix)
   - Creates workspace with owner ID
   - Assigns workspace owner as ADMIN role WorkspaceMember
   - Creates default FREE subscription for workspace
   - Syncs workspace usage counts (initially 0,0,0)
   - Returns: JWT token (7-day expiry), user object, workspace object

2. **User Login**
   - Verifies email exists and password matches hash
   - Fetches user's primary workspace and subscription details
   - Returns: JWT token, user object, workspace with subscription info

3. **Token Usage**
   - Frontend stores JWT in localStorage
   - Axios interceptor (axiosInstance.js) adds `Authorization: Bearer <token>` to all requests
   - Backend `protect` middleware in auth.middleware.js verifies and decodes token
   - If valid, req.user is set; if expired/invalid, returns 401 Unauthorized
   - 401 responses redirect to /login (except on /login, /signup pages)

---

### Middleware Authorization

#### **protect (auth.middleware.js)**
- Verifies JWT token is valid
- Extracts user ID and attaches user to request
- Returns 401 if token missing or invalid
- Used on all protected routes

#### **checkWorkspaceAdmin (workspace.middleware.js)**
- Checks if user is workspace owner OR ADMIN role member
- Returns 403 if not admin
- Used for: project creation, member invites, plan upgrades

#### **checkWorkspaceMember (workspace.middleware.js)**
- Checks if user is any member of the workspace
- Returns 403 if not member
- Used for: task access, dashboard stats, team list

#### **checkProjectPermission (workspace.middleware.js)**
- Checks if user is workspace admin  OR  project member
- Returns 403 if insufficient access
- Used for: project updates, project member management

#### **checkTaskUpdatePermission (workspace.middleware.js)**
- Checks if user is task assignee  OR  workspace/project admin
- Returns 403 if not authorized
- Used for: task status/details updates

#### **checkTaskDeletePermission (workspace.middleware.js)**
- Checks if user is workspace admin
- Returns 403 if not admin
- Used for: task deletion

#### **checkTaskMember (workspace.middleware.js)**
- Checks if user is task assignee OR workspace/project admin OR workspace member
- Returns 403 if no access
- Used for: comment operations on tasks

#### **requireActiveSubscription (subscription.middleware.js)**
- Checks if workspace has active (non-expired) subscription
- Auto-downgrades to FREE if subscription expired
- Returns 403 if no subscription
- Used for: dashboard stats, creating projects/tasks

#### **requireFeature (subscription.middleware.js)**
- Checks if workspace plan includes the required feature
- Returns 403 if feature not in plan.features array
- Used for: feature-gated operations (e.g., ANALYTICS, CALENDAR)

#### **enforceUsageLimit (subscription.middleware.js)**
- Checks current usage against plan limits
- If limit is 0, considers unlimited
- Increments usage counter on success
- Returns 403 if limit reached
- Used for: project creation (maxProjects), task creation (maxTasks)

---

### Role-Based Access Control

#### **Workspace Roles**
- **ADMIN**
  - Can create projects, tasks
  - Can invite/remove team members
  - Can upgrade workspace plan
  - Can view all workspace projects/tasks
  - Can manage workspace settings

- **MEMBER**
  - Can view assigned projects/tasks
  - Can see projects they're added to
  - Can view team members
  - Can comment on tasks
  - Cannot create projects or invite members

---

### Subscription & Feature Access

#### **Auto-Downgrade on Expiration**
- Subscription checks in `subscriptionUtils.js` automatically downgrade to FREE plan
- On expiration (periodEnd < now), creates new FREE subscription
- Preserves workspace continuity

#### **Usage Limit Enforcement**
- Tracked in WorkspaceUsage collection
- Counts: projects, tasks, members
- Checked during: project creation, task creation, member invites
- Usage incremented/decremented on create/delete
- 0 limit = unlimited

---

## 📤 Deployment

## � Backend Implementation Details

### Server Configuration (server.js)
- Express v5.2.1 with JSON body parser
- CORS enabled with configurableorigin (default: *)
- Routes mounted at `/api/*`
- Default port: 8000
- MongoDB connection auto-starts subscription plan seeding

### Email Service (utils/emailService.js)
- Uses Resend email service for sending invitations
- Sends invite links with 7-day token expiration
- Includes workspace name and inviter name in email
- Email failures don't block invite creation (logged)

### Invite Token System (utils/inviteTokenUtils.js)
- generateInviteToken(): Creates random alphanumeric tokens
- calculateExpirationDate(days): Sets token TTL (default 7 days)
- Tokens stored in WorkspaceInvite collection
- Status tracking: PENDING → ACCEPTED or EXPIRED

### Subscription System (utils/subscriptionUtils.js)
- getActiveSubscription(): Auto-downgrades to FREE on expiration
- isSubscriptionActive(): Always true (AUTO-DOWNGRADE ensures it)
- getWorkspacePlan(): Returns current active plan
- isFeatureAllowed(): Checks plan.features array for feature names
- All subscriptions have auto-renew on signup

### Usage Tracking (utils/usageUtils.js)
- syncUsageCounts(): Counts actual documents (projects, tasks, members) at runtime
- checkAndIncrementUsage(): Atomic DB increment with limit check
- decrementUsage(): Decreases count on delete
- Limit value 0 = unlimited (always allows)
- Usage synced on workspace creation and periodically

### Permission Model
- Workspace ownership is automatic (creator = owner)
- Role-based: ADMIN (can manage), MEMBER (read-only view)
- Project membership is explicit (ProjectMember records)
- Task assignees can self-update; admins can update any task
- Comments have creator-only edit rights

### Error Handling
- 400: Bad request (missing required fields, invalid format)
- 401: Unauthorized (invalid/missing JWT)
- 403: Forbidden (insufficient permissions, limits exceeded)
- 404: Not found (resource doesn't exist)
- 500: Server error (database/unknown issues)
- All errors logged to console for debugging

### Data Integrity
- UUID for User, Workspace, Project, Task IDs (via uuid or crypto.randomUUID)
- ObjectId for subscription/comment records
- Mongoose pre-hooks for password hashing and defaults
- Index on: Subscription (workspaceId, status), WorkspaceInvite (email, token)
- Validation: Email format, password length (6+ chars), required fields

### Performance Optimizations
- Lean queries (`.lean()`) used where user data not needed
- Populate selectively (only needed fields: `'name email'`)
- Workspace admin check combines owner or ADMIN role (avoid extra queries)
- Usage counts atomic to prevent race conditions
- Sorted outputs (comments by createdAt, subscription by periodEnd)

---

## 🐛 Troubleshooting

### Backend won't connect to MongoDB
- Check MONGODB_URI in .env is correct
- Verify IP whitelist in MongoDB Atlas (or allow 0.0.0.0/0)
- Test connection string in MongoDB Compass
- Ensure MongoDB service is running (if local)

### Frontend can't reach backend
- Check VITE_API_BASE_URL in frontend .env matches backend URL
- Verify backend is running on correct port (default 8000)
- Check CORS settings: backend should allow your frontend domain
- Test API directly: `curl http://localhost:8000/api/auth/profile`

### JWT token not persisting
- Check if browser localStorage is enabled
- Verify Axios interceptor is configured in axiosInstance.js
- Check token expiration (7 days from issue time)
- Clear localStorage and re-login if token corrupted

### Permission denied errors (403)
- Verify user role in workspace (ADMIN vs MEMBER)
- Check if user is added to project (ProjectMember record)
- Ensure workspace admin for project/subscription operations
- Check if user is task assignee for task updates

### Subscription/Usage limit errors
- Verify workspace has active subscription (non-expired)
- Check plan limits: 0 = unlimited, specific number = limit
- Sync usage counts: workspace should auto-sync on creation
- For FREE plan: typically 0 projects/tasks = unlimited unless seeded otherwise

### Email not sending
- Check Resend API key is set in env (if using real email)
- Verify email address format is correct
- Check spam folder for invite emails
- Error logs in server console indicate email service issues

### Task/Project not visible
- If non-admin: verify added to project (ProjectMember record)
- Check workspace membership (WorkspaceMember record)
- Admins see all; members see only their assigned items
- Verify project workspace matches current workspace

---

## ✅ Development Roadmap & Todo List

### Completed Features ✓
- [✓] User Authentication (Login, Signup, JWT)
- [✓] Workspace Management (Create, Invite, Role-based Access)
- [✓] Project Management (CRUD, Member Assignment)
- [✓] Task Management (Create, Assign, Track Status & Priority)
- [✓] Subscription System (FREE/PRO tiers with feature limits)
- [✓] Dashboard & Analytics (Stats, Activity Feed, Charts)
- [✓] Comments & Collaboration Features
- [✓] Dark/Light Theme Support
- [✓] Password Visibility Toggle in Auth Forms
- [✓] Tenant Isolation at API Level
- [✓] Role-based Data Filtering (ADMIN/MEMBER)
- [✓] Project Member Visibility (Show role badges)
- [✓] Active Tasks Count (Renamed from "My Tasks")
- [✓] Overdue Task Display
- [✓] Responsive UI Design

### In Progress / Future Enhancements
- [ ] Real-time Notifications
- [ ] Task Dependencies & Gantt Charts
- [ ] Advanced Reporting & Export (CSV, PDF)
- [ ] Integration with Third-party Services (Slack, Email)
- [ ] Mobile App Version
- [ ] Calendar View Enhancements
- [ ] Team Performance Analytics
- [ ] Add option to edit/delete comments for a task
- [ ] Task Templates
- [ ] Add razorpay/stripe payment gateway

---

## 👥 Support & Feedback

For support, feature requests, or bug reports, please open an issue in the repository.

---

## 🎉 Acknowledgments

Built with ❤️ using React, Node.js, Express, and MongoDB.

Last Updated: February 27, 2026
