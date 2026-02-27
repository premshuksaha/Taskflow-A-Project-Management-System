## 🔌 API Documentation

## Table of Contents

1. [Base URL](#base-url)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Workspace Endpoints](#workspace-endpoints)
4. [Project Endpoints](#project-endpoints)
5. [Task Endpoints](#task-endpoints)
6. [Comment Endpoints](#comment-endpoints)
7. [Dashboard Endpoints](#dashboard-endpoints)
8. [Team Endpoints](#team-endpoints)
9. [Subscription Endpoints](#subscription-endpoints)

### Base URL
`http://localhost:8000/api`

### Authentication Endpoints

#### **Register/Signup**
```
POST /auth/signup
Content-Type: application/json

Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "workspaceName": "My Workspace"
}

Response: 
{
  "token": "jwt_token",
  "user": { "_id", "name", "email" },
  "workspace": { workspace details with subscription info }
}
```

#### **Login**
```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt_token",
  "user": { "_id", "name", "email" },
  "workspace": { workspace details with subscription info }
}
```

#### **Get Profile**
```
GET /auth/profile
Authorization: Bearer <token>

Response: { "_id", "name", "email" }
```

---

### Workspace Endpoints

#### **Get Workspaces for User**
```
GET /workspaces/user/:userId
Authorization: Bearer <token>

Response: [{ workspace objects }]
```

#### **Update Workspace**
```
PUT /workspaces/update/:id
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "name": "Updated Workspace Name",
  "description": "Updated description"
}

Response: { updated workspace }
```

#### **Delete Workspace**
```
DELETE /workspaces/delete/:id
Authorization: Bearer <token>

Response: { message }
```

#### **Send Workspace Invite**
```
POST /workspaces/invite/send
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "workspaceId": "workspace_id",
  "email": "member@example.com",
  "role": "MEMBER"  // or "ADMIN"
}

Response: 
{
  "message": "Invitation sent successfully",
  "invite": { "_id", "email", "role", "status" }
}
```

#### **Get Invite Details (before accepting)**
```
GET /workspaces/invite/:token
Authorization: Not required

Response: { invite details with workspace info }
```

#### **Accept Workspace Invite**
```
POST /workspaces/invite/accept
Content-Type: application/json

Request (for new user):
{
  "token": "invite_token",
  "email": "member@example.com",
  "password": "newpassword123",
  "name": "Member Name"
}

Request (for existing user):
{
  "token": "invite_token",
  "email": "existing@example.com"
}

Response: { token, user, workspace }
```

---

### Project Endpoints

#### **Get Projects in Workspace**
```
GET /projects/get/:workspaceId
Authorization: Bearer <token>

Response: [{ project objects }]
```

#### **Create Project**
```
POST /projects/add
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "name": "Website Redesign",
  "description": "Redesign company website",
  "workspaceId": "workspace_id",
  "priority": "HIGH",
  "status": "PLANNING",
  "start_date": "2024-01-01",
  "end_date": "2024-03-01",
  "team_lead": "user_id",
  "progress": 0,
  "team_members": ["email1@example.com", "email2@example.com"]
}

Response: { project object }
```

#### **Update Project**
```
PUT /projects/update/:projectId
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "name": "Updated name",
  "status": "IN_PROGRESS",
  "progress": 50
}

Response: { updated project }
```

#### **Delete Project**
```
DELETE /projects/delete/:projectId
Authorization: Bearer <token>

Response: { message }
```

#### **Add Member to Project**
```
POST /projects/add-member
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "projectId": "project_id",
  "email": "member@example.com"
}

Response: { message, newMember }
```

---

### Task Endpoints

#### **Get Tasks by Project**
```
GET /tasks/get/project/:projectId
Authorization: Bearer <token>

Response: [{ task objects with assignee populated }]
```

#### **Get Tasks by Workspace**
```
GET /tasks/get/workspace/:workspaceId
Authorization: Bearer <token>

Response: [{ task objects with assignee populated }]
```

#### **Create Task**
```
POST /tasks/add
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "title": "Fix login bug",
  "projectId": "project_id",
  "workspaceId": "workspace_id",
  "description": "Users cannot login with OAuth",
  "status": "TODO",
  "type": "BUG",
  "priority": "HIGH",
  "assigneeId": "user_id",
  "due_date": "2024-02-15"
}

Response: { task object }
```

#### **Update Task**
```
PUT /tasks/update/:taskId
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "status": "IN_PROGRESS",
  "assigneeId": "new_user_id",
  "progress": 50
}

Response: { updated task }
```

#### **Delete Task**
```
DELETE /tasks/delete/:taskId
Authorization: Bearer <token>

Response: { message }
```

---

### Comment Endpoints

#### **Get Comments for Task**
```
GET /comments/task/:taskId
Authorization: Bearer <token>

Response: [{ comment objects with user populated }]
```

#### **Create Comment**
```
POST /comments/add
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "taskId": "task_id",
  "content": "This is a comment"
}

Response: { comment object with user populated }
```

#### **Update Comment**
```
PUT /comments/update/:commentId
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "content": "Updated comment text"
}

Response: { updated comment }
```

#### **Delete Comment**
```
DELETE /comments/delete/:commentId
Authorization: Bearer <token>

Response: { message }
```

---

### Dashboard Endpoints

#### **Get Dashboard Stats**
```
GET /dashboard/stats/:workspaceId
Authorization: Bearer <token>

Response:
{
  "projectCount": 5,
  "completedProjectsCount": 2,
  "activeTasksCount": 12,
  "completedTasksCount": 8,
  "myTasksCount": 3,
  "overdueTasksCount": 1
}
```

---

### Team Endpoints

#### **Get Workspace Team Members**
```
GET /team/:workspaceId
Authorization: Bearer <token>

Response: [{ 
  "_id": "member_id",
  "userId": { "name", "email" },
  "workspaceId": "workspace_id",
  "role": "ADMIN|MEMBER"
}]
```

---

### Subscription Endpoints

#### **Get Available Plans**
```
GET /subscription/plans
Authorization: Bearer <token>

Response: [{ 
  "_id",
  "name": "FREE|PRO",
  "slug": "FREE|PRO",
  "features": [ "FEATURE1", "FEATURE2", ... ],
  "maxProjects": Number (0 = unlimited),
  "maxTasks": Number (0 = unlimited),
  "maxMembers": Number (0 = unlimited),
  "isDefault": Boolean,
  "price": Number
}]
```

#### **Upgrade Workspace Plan**
```
POST /subscription/upgrade
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "workspaceId": "workspace_id",
  "planSlug": "PRO"
}

Response:
{
  "message": "Workspace plan successfully updated to PRO",
  "workspace": { workspace with updated plan }
}
```

---
