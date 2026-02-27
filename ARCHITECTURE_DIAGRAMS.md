# Taskflow - Architecture & Flow Diagrams

---

## Table of Contents

1. [High-Level Architecture Diagram](#1-high-level-architecture-diagram)
2. [Entitlement Decision Flow Diagram](#2-entitlement-decision-flow-diagram)
3. [Permission Matrix](#3-permission-matrix)
4. [Data Access Flow (Admin vs Member)](#4-data-access-flow-admin-vs-member)
5. [Subscription & Usage Lifecycle](#5-subscription--usage-lifecycle)
6. [Email Invite & Acceptance Flow](#6-email-invite--acceptance-flow)
7. [Request-Response Cycle Example (Create Task)](#7-request-response-cycle-example-create-task)
8. [Key Architectural Principles](#8-key-architectural-principles)

## 1. High-Level Architecture Diagram

```mermaid
flowchart TB
    subgraph Client["Frontend (React)"]
        Routing["Routing/Layout<br/>Layout.jsx + nested routes"]
        AuthUI["Auth UI<br/>Login, Signup"]
        WorkspaceUI["Workspace UI<br/>Dashboard, Workspace dropdown"]
        ProjectUI["Project UI<br/>Projects, ProjectDetails,
        ProjectAnalytics, Calendar"]
        TaskUI["Task UI<br/>Tasks, TaskDetails, Task dialogs"]
        TeamUI["Team UI<br/>Team, InviteMember dialog"]
        SubUI["Subscription UI<br/>Plans, Upgrade flow"]
        Components["Shared Components<br/>Navbar, Sidebar, Cards, Dialogs"]
        State["State Layer<br/>Redux store (theme, workspace)
        + UserContext + useUserAuth"]
        ApiClient["API Client<br/>axiosInstance + apiPaths
        JWT interceptor + error handling"]
        Storage["Local Storage<br/>JWT token + workspace"]

        Routing --> AuthUI
        Routing --> WorkspaceUI
        Routing --> ProjectUI
        Routing --> TaskUI
        Routing --> TeamUI
        Routing --> SubUI
        AuthUI --> Components
        WorkspaceUI --> Components
        ProjectUI --> Components
        TaskUI --> Components
        TeamUI --> Components
        SubUI --> Components
        Components --> State
        State --> ApiClient
        Storage --> ApiClient
    end

    subgraph API["Backend(Express + Node.js)"]
        App["server.js<br/>Express app + config"]
        Routes["Route Modules<br/>/auth, /workspaces, /projects,
        /tasks, /comments, /dashboard,
        /team, /subscription"]
        Middleware["Middleware Chain
        protect (JWT)
        requireActiveSubscription
        checkWorkspaceAdmin/Member
        requireFeature
        enforceUsageLimit"]
        Controllers["Controllers
        auth, workspace, project, task,
        comment, dashboard, team, subscription"]
        Services["Services/Utils
        emailService, inviteTokenUtils,
        subscriptionUtils, usageUtils"]
        Models["Mongoose Models
        user, workspace, workspaceMember,
        workspaceInvite, workspaceUsage,
        project, projectMember, task,
        comment, subscription, subscriptionPlan"]

        App --> Routes --> Middleware --> Controllers
        Controllers --> Models
        Controllers --> Services
    end

    subgraph DB["Database Tier (MongoDB)"]
        Global["Global Collections
        Users, SubscriptionPlans"]
        Workspace["Workspace Collections
        Workspaces, WorkspaceMembers,
        WorkspaceInvites, WorkspaceUsage,
        Subscriptions"]
        Domain["Domain Collections
        Projects, ProjectMembers,
        Tasks, Comments"]
    end

    subgraph External["External Services"]
        Email["Resend Email Service
        invitation + notification emails"]
    end

    Client -->|HTTPS REST| API
    API -->|Mongoose ODM| DB
    Services --> Email
    Email -->|Invite link| Client
```

---

## 2. Entitlement Decision Flow Diagram

```mermaid
flowchart TD
    A[Request hits API route] --> B{JWT provided?}
    B -- No --> B1[401 Not authorized]
    B -- Yes --> C[protect: verify JWT and load user]
    C --> D{User found?}
    D -- No --> D1[401 User not found]
    D -- Yes --> E{Route scope?}

    E -- Public --> H[Skip workspace checks]
    E -- Workspace member --> F[checkWorkspaceMember]
    E -- Admin only --> G[checkWorkspaceAdmin]

    F --> F1{Is member?}
    F1 -- No --> F2[403 Not a workspace member]
    F1 -- Yes --> H

    G --> G1{Is owner/admin?}
    G1 -- No --> G2[403 Admin only]
    G1 -- Yes --> H

    H --> I{Subscription required?}
    I -- No --> L
    I -- Yes --> J[requireActiveSubscription]
    J --> J1{Active?}
    J1 -- No --> J2[403 Subscription expired]
    J1 -- Yes --> K{Feature gate required?}

    K -- No --> L
    K -- Yes --> K1[requireFeature]
    K1 --> K2{Feature allowed?}
    K2 -- No --> K3[403 Feature not available]
    K2 -- Yes --> L

    L --> M{Usage limit check required?}
    M -- No --> N[Execute controller]
    M -- Yes --> O[enforceUsageLimit]
    O --> O1{Under limit?}
    O1 -- No --> O2[403 Usage limit reached]
    O1 -- Yes --> N

    N --> P{Validation ok?}
    P -- No --> P1[400 Bad request]
    P -- Yes --> P2[200/201 Success]
```

---

## 3. Permission Matrix

### Workspace-Level Permissions

| Capability | Owner/Admin | Member |
| --- | --- | --- |
| View workspace | ✅ | ✅ |
| Invite members | ✅ | ❌ |
| Remove members | ✅ | ❌ |
| Update workspace settings | ✅ | ❌ |
| Delete workspace | ✅ | ❌ |
| Upgrade/downgrade plan | ✅ | ❌ |

### Project-Level Permissions

| Capability | Workspace Admin/Project Lead | Project Member |
| --- | --- | --- |
| View project | ✅ | ✅ |
| Create project | ✅ | ❌ |
| Edit project details | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Delete project | ✅ | ❌ |
| View project tasks | ✅ | ✅ |

### Task-Level Permissions

| Capability | Workspace Admin | Task Assignee |
| --- | --- | --- |
| View task | ✅ | ✅ |
| Create task | ✅ | ❌ |
| Edit task | ✅ | ⚠️ own tasks only |
| Assign/reassign task | ✅ | ❌ |
| Delete task | ✅ | ❌ |
| Add comments | ✅ | ⚠️ if workspace member |
| Edit/delete own comments | ✅ | ✅ |

### Subscription-Level Permissions

| Capability | Workspace Admin | Member |
| --- | --- | --- |
| View available plans | ✅ | ✅ |
| Upgrade workspace plan | ✅ | ❌ |
| Access premium features | ⚠️ if plan allows | ⚠️ if plan allows |
| View subscription history | ✅ | ❌ |

---

## 4. Data Access Flow (Admin vs Member)

```mermaid
flowchart LR
  A[GET projects for workspace] --> B{JWT valid?}
  B -- No --> B1[401 Unauthorized]
  B -- Yes --> C{Role}
  C -- Workspace Admin --> D[Query all projects]
  C -- Member --> E[Lookup membership]
  E --> F[Filter projects by membership]
  D --> G[Return full project list]
  F --> H[Return assigned projects only]
```

**Data safety controls**
- Workspace scope enforced on every query (`workspaceId` filter)
- Membership-based filtering for non-admins
- Role checks performed before any data access

---

## 5. Subscription & Usage Lifecycle

### Flow 1: User Signup (Bootstrap Workspace)

```mermaid
flowchart TD
  A[POST /api/auth/signup] --> B[Validate input]
  B --> C[Create user + workspace]
  C --> D[Create workspace member ADMIN]
  D --> E[Create subscription FREE ACTIVE]
  E --> F[Create workspace usage counts]
  F --> G[Issue JWT + return payload]
```

### Flow 2: Create Project (Usage Limit Gate)

```mermaid
flowchart TD
  A[POST /api/projects/add] --> B[protect]
  B --> C[requireActiveSubscription]
  C --> D[checkWorkspaceAdmin]
  D --> E[enforceUsageLimit projects]
  E --> F{Under limit?}
  F -- No --> F1[403 Usage limit reached]
  F -- Yes --> G[Create project + increment usage]
  G --> H[201 Created]
```

### Flow 3: Upgrade Plan (FREE -> PRO)

```mermaid
flowchart TD
  A[POST /api/subscription/upgrade] --> B[protect + checkWorkspaceAdmin]
  B --> C[Find PRO plan + active subscription]
  C --> D[Expire current subscription]
  D --> E[Create PRO subscription trial]
  E --> F[Update workspace plan]
  F --> G[200 OK + updated workspace]
```

### Flow 4: Auto-Downgrade on Expiration

```mermaid
flowchart TD
  A[Protected request] --> B[requireActiveSubscription]
  B --> C{periodEnd passed?}
  C -- No --> D[Continue with current plan]
  C -- Yes --> E[Expire subscription]
  E --> F[Create FREE subscription]
  F --> G[Update workspace.plan]
  G --> H[Continue request as FREE]
```

### Flow 5: Member Limit Enforcement

```mermaid
flowchart TD
  A[POST /api/workspaces/invite/send] --> B[enforceUsageLimit members]
  B --> C{Under member limit?}
  C -- No --> D[403 Member limit reached]
  C -- Yes --> E[Proceed with invite]
```

---

## 6. Email Invite & Acceptance Flow

```mermaid
sequenceDiagram
  participant Admin
  participant FE as Frontend
  participant API
  participant DB
  participant Email
  participant User

  Admin->>FE: Fill invite form
  FE->>API: POST /workspaces/invite/send
  API->>DB: Create WorkspaceInvite (PENDING, expiresAt)
  API->>Email: Send invite email with token link
  Email-->>User: Invite email
  User->>FE: Open /accept-invite/:token
  FE->>API: GET /workspaces/invite/:token
  API->>DB: Validate token + status + expiry
  API-->>FE: Invite details

  User->>FE: Accept invite
  FE->>API: POST /workspaces/invite/accept
  API->>DB: Re-validate token
  alt New user
    API->>DB: Create User + WorkspaceMember
  else Existing user
    API->>DB: Create WorkspaceMember
  else Expired
    API-->>FE: 410 Invitation expired
  end
  API->>DB: Update invite status + increment usage
  API-->>FE: JWT + workspace payload
```

**Operational notes**
- Tokens are time-bound to prevent stale invites
- Usage limits are incremented only after acceptance

---

## 7. Request-Response Cycle Example (Create Task)

```mermaid
sequenceDiagram
    participant User
    participant FE as Frontend
    participant API
    participant Auth as protect
    participant Sub as requireActiveSubscription
    participant Role as checkWorkspaceAdmin
    participant Limit as enforceUsageLimit
    participant Ctrl as createTask
    participant DB

    User->>FE: Submit task form
    FE->>FE: Validate inputs
    FE->>API: POST /api/tasks/add (JWT)
    API->>Auth: Verify token
    Auth-->>API: OK or 401
    API->>Sub: Check subscription
    Sub-->>API: OK or 403
    API->>Role: Check workspace admin
    Role-->>API: OK or 403
    API->>Limit: Check usage limit
    Limit-->>API: OK or 403
    API->>Ctrl: Create task
    Ctrl->>DB: Validate project/user + insert task
    DB-->>Ctrl: Task created
    Ctrl-->>API: 201 + task payload
    API-->>FE: Response
    FE-->>User: Update UI + toast
```

**Failure modes handled**
- 400 for validation issues
- 401 for missing/invalid token
- 403 for role, subscription, or usage limits

---

## 8. Key Architectural Principles

### 🔐 Security (Multiple Layers)
```
Request → JWT Verify → Role Check → Subscription Check → Feature Gate → Usage Limit
```
Each request passes through 4-6 security checks before reaching controller logic.

### 👥 Multi-Tenancy
- **Workspace-scoped data**: Projects, Tasks, Comments, Members isolated per workspace
- **Global shared data**: Users, Subscription Plans shared across system
- **Filtering**: All queries include workspaceId filter to prevent cross-tenant data access

### 💳 Subscription Model
- **FREE Plan**: 10 members max, unlimited projects/tasks
- **PRO Plan**:  Unlimited members, unlimited projects/tasks, 30-day demo period
- **Auto-manage**: Expired subscriptions automatically downgrade to FREE
- **Usage tracking**: Atomic increments prevent race conditions and double-counting

### 🎯 Role-Based Access Control
- **Workspace Level**: OWNER/ADMIN can manage settings, invite members, upgrade plan
- **Project Level**: ADMIN/LEAD can manage project, add members, create tasks
- **Task Level**: Creator/assignee can self-edit, admins can do anything
- **Feature Level**: Premium features locked unless plan allows

### 📧 User Onboarding
- **Email-first**: Users invited via email link (no direct signup required)
- **Token-based**: 7-day expiration prevents invite spam/abuse
- **Flexible**: Works for both new and existing users
- **Atomic**: Single POST prevents duplicate members

### 📊 Data Safety
- **Atomic operations**: Usage limits use MongoDB atomic $inc
- **Transactional**: User creation, workspace creation, subscription assignment in sequence
- **Validation**: Input validated at both frontend and backend
- **Idempotency**: Repeated requests don't create duplicates (token uniqueness)
