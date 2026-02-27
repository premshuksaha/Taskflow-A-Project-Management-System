# Taskflow - Design Rationale & Database Schema Documentation

This document covers the comprehensive design decisions, database schema, and architectural rationale for the Taskflow Project Management System.

---

## Table of Contents

1. [Database Design & ER Diagram](#-database-design--er-diagram)
   - [Entity-Relationship Diagram (ER Model)](#entity-relationship-diagram-er-model)
   - [Plan-Feature Mapping Structure](#plan-feature-mapping-structure)
   - [Subscription History & Status Modeling](#subscription-history--status-modeling)
   - [Usage Tracking Schema](#usage-tracking-schema)
   - [Indexing Strategy](#indexing-strategy)

2. [Design Rationale](#-design-rationale)
   - [1. Why This Schema Design?](#1-why-this-schema-design)
   - [2. How Your System Scales to Large Numbers of Tenants](#2-how-your-system-scales-to-large-numbers-of-tenants)
   - [3. How to Prevent Race Conditions in Usage Updates](#3-how-to-prevent-race-conditions-in-usage-updates)
   - [4. How to Support Plan Upgrades/Downgrades (Conceptually)](#4-how-to-support-plan-upgradesdowngrades-conceptually)
   - [5. How to Extend the System for New Features](#5-how-to-extend-the-system-for-new-features)

3. [Scaling Considerations](#-scaling-considerations)
   - [Database Optimization](#database-optimization)
   - [API Optimization](#api-optimization)
   - [Frontend Optimization](#frontend-optimization)

4. [Summary](#summary)

---

## 📊 Database Design & ER Diagram

### Entity-Relationship Diagram (ER Model)

![er_diagram](docs/er_diagram.png)

---

### Plan-Feature Mapping Structure

```
SubscriptionPlan Document Example:

FREE Plan:
{
  _id: ObjectId("..."),
  name: "Free",
  slug: "free",
  description: "For small teams",
  features: [
    "basic_projects",
    "basic_tasks",
    "team_collaboration",
    "task_comments"
  ],
  maxProjects: 0,        // 0 = unlimited
  maxTasks: 0,           // 0 = unlimited
  maxMembers: 5,         // Limited to 5
  isDefault: true,       // Auto-assigned on signup
  price: 0,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}

PRO Plan:
{
  _id: ObjectId("..."),
  name: "Pro",
  slug: "pro",
  description: "For growing teams",
  features: [
    "advanced_analytics",      // Premium feature
    "custom_workflows",        // Premium feature
    "bulk_operations",         // Premium feature
    "advanced_reporting",      // Premium feature
    ... (includes all FREE features)
  ],
  maxProjects: 0,             // Unlimited
  maxTasks: 0,                // Unlimited
  maxMembers: 50,             // Generous limit
  isDefault: false,
  price: 99,                  // 30-day demo = free, then $99/month
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}

Feature Gating Logic:
- Check plan.features array for feature name
- Middleware (requireFeature) blocks access if not in array
- Example: GET /api/dashboard/advanced-report checks if 'advanced_reporting' in plan.features
```

---

### Subscription History & Status Modeling

```
Subscription Document Lifecycle:

1. SIGNUP (User creates account)
   ├─ Create Subscription (FREE plan)
   ├─ status: ACTIVE
   ├─ periodStart: now()
   ├─ periodEnd: null (FREE never expires)
   └─ auto_assigned: true

2. UPGRADE (User upgrades to PRO)
   ├─ NEW Subscription created with planId: PRO
   ├─ status: ACTIVE
   ├─ periodStart: now()
   ├─ periodEnd: now() + 30 days (demo period)
   └─ OLD Subscription marked status: EXPIRED

3. AUTO-DOWNGRADE (30 days pass)
   ├─ On any API request, middleware checks expiration
   ├─ If now() > periodEnd:
   │  ├─ Mark old Sub status: EXPIRED
   │  ├─ Create NEW Subscription (FREE plan)
   │  ├─ status: ACTIVE
   │  └─ periodEnd: null
   └─ Returns to FREE plan, user notified

4. MANUAL DOWNGRADE (User cancels PRO)
   ├─ Update Subscription.status: CANCELLED
   ├─ Create new FREE Subscription immediately
   ├─ Old SUB preserved for history/billing
   └─ Workspace reverts to FREE limits

Query to get active subscription:
db.subscriptions.findOne({
  workspaceId: workspaceId,
  status: { $in: [ACTIVE, PENDING] }
})

Query for subscription history:
db.subscriptions.find({
  workspaceId: workspaceId
}).sort({ createdAt: -1 })
```

---

### Usage Tracking Schema

```
WorkspaceUsage Document:

{
  _id: ObjectId("..."),
  workspaceId: UUID,
  counts: {
    projects: 3,        // Current count
    tasks: 27,          // Current count
    members: 5          // Current count
  },
  lastSyncedAt: ISODate("2026-02-27T10:00:00Z"),
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}

Atomic Usage Increment Pattern:
db.workspaceusages.updateOne(
  {
    workspaceId: wsId,
    'counts.members': { $lt: planMaxMembers }  // Conditional check
  },
  {
    $inc: { 'counts.members': 1 }             // Atomic increment
  }
)

Result Analysis:
- If modifiedCount === 1: ✅ Limit NOT exceeded, usage incremented
- If modifiedCount === 0: ❌ Limit already reached, reject with 403

Atomic Usage Decrement Pattern:
db.workspaceusages.updateOne(
  {
    workspaceId: wsId,
    'counts.members': { $gt: 0 }              // Don't go below 0
  },
  {
    $inc: { 'counts.members': -1 }            // Atomic decrement
  }
)

This prevents:
 Race conditions (two updates happening simultaneously)
 Overshooting limits (member count > limit)
 Negative counts (member count < 0)
 Duplicate counting (same member counted twice)
```

---

### Indexing Strategy

```
Recommended MongoDB Indexes:

UNIQUE INDEXES (Prevent duplicates):
  db.users.createIndex({ email: 1 }, { unique: true })
  db.workspaces.createIndex({ slug: 1 }, { unique: true })
  db.workspaceinvites.createIndex({ token: 1 }, { unique: true })
  db.subscriptionplans.createIndex({ slug: 1 }, { unique: true })

WORKSPACE QUERY INDEXES (Fast filtering):
  db.projects.createIndex({ workspaceId: 1 })
  db.tasks.createIndex({ workspaceId: 1 })
  db.tasks.createIndex({ projectId: 1 })
  db.comments.createIndex({ taskId: 1 })
  db.workspacemembers.createIndex({ workspaceId: 1 })
  db.projectmembers.createIndex({ projectId: 1 })

SUBSCRIPTION INDEXES (Critical for performance):
  db.subscriptions.createIndex(
    { workspaceId: 1, status: 1 },
    { name: "GetActiveSubscription" }
  )
  db.subscriptions.createIndex(
    { periodEnd: 1 },
    { sparse: true, name: "ExpiredSubscriptions" }
  )

USER ASSIGNMENT INDEXES:
  db.workspacemembers.createIndex({ userId: 1 })
  db.projectmembers.createIndex({ userId: 1 })
  db.tasks.createIndex({ assigneeId: 1 })

DATE-BASED INDEXES:
  db.tasks.createIndex({ due_date: 1 })
  db.tasks.createIndex({ createdAt: -1 })

COMPOSITE INDEXES (Multi-field queries):
  db.workspacemembers.createIndex({ userId: 1, workspaceId: 1 })
  db.projectmembers.createIndex({ userId: 1, projectId: 1 })
```

---

## 🎯 Design Rationale

### 1. Why This Schema Design?

#### Multi-Tenant Architecture (Workspace Isolation)
**Decision**: Store `workspaceId` in every workspace-scoped collection

**Rationale**:
- **Isolation**: Every query includes `{ workspaceId: "..." }` filter
- **Prevention**: Prevents accidental cross-tenant data leaks
- **Scaling**: Allows sharding by workspaceId for large scale
- **Simplicity**: No complex joins needed; each document is self-contained

```javascript
// Every workspace-scoped query includes workspaceId filter:
Task.find({ workspaceId, projectId })
Project.find({ workspaceId })
Comment.find({ taskId, /* implicit check via task */ })
```

#### Separate Collections Instead of Nested Documents
**Decision**: Use `WorkspaceMembers`, `ProjectMembers` as separate collections (not nested)

**Rationale**:
- **Query Flexibility**: Can query members independently
- **Index Optimization**: Create indexes on userId for fast "get user's workspaces" queries
- **Update Safety**: Change a member's role without modifying entire workspace
- **Scalability**: WorkspaceMember count grows independently; don't bloat workspace document

**Alternative Considered**: Embedding members array in Workspace
```javascript
// ❌ Not ideal (bloat, hard to query, index issues):
Workspace: {
  _id, name,
  members: [{ userId, role }, ...]  // Hard to index, bloats document
}

// ✅ Better (normalization):
WorkspaceMember: { userId, workspaceId, role }
// Separate collection allows: db.workspacemembers.find({ userId })
```

#### Separate Usage Tracking Collection
**Decision**: Create `WorkspaceUsage` instead of storing counts in `Workspace`

**Rationale**:
- **Atomic Operations**: Safely increment/decrement without race conditions
- **Update Frequency**: Usage counts are updated frequently; don't want to lock entire workspace doc
- **Audit Trail**: Can have multiple versions of usage for billing reconciliation
- **Performance**: Smaller document = faster writes, can use TTL indexes

```javascript
// ✅ Atomic increment (safe for concurrent updates):
db.workspaceusages.updateOne(
  { workspaceId, 'counts.members': { $lt: limit } },
  { $inc: { 'counts.members': 1 } }
)

// ❌ Document-level locking (not atomic, slower):
db.workspaces.updateOne(
  { _id: workspaceId },
  { $inc: { 'counts.members': 1 } }  // Could fail if workspace doc is locked
)
```

---

### 2. How Your System Scales to Large Numbers of Tenants

#### Horizontal Scaling Strategy

**1. MongoDB Sharding**
```
Shard Key: workspaceId

Benefits:
✅ Each shard holds subset of workspaces
✅ Queries filtered by workspaceId naturally distributed
✅ Adding new shards increases throughput linearly
✅ WorkspaceUsage, Projects, Tasks all shard on workspaceId
```

**2. Connection Pooling**
```
Node.js Backend:
- Mongoose connection pool (default 10 connections)
- Can increase maxPoolSize for high concurrency
- In production: use MongoDB Atlas connection pooling

env file:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskflow?maxPoolSize=50&maxIdleTimeMS=30000
```

**3. Read Replicas**
```
Distribute read-heavy queries (dashboards, analytics)
to read-only secondaries while writes go to primary

Example: Dashboard queries against replica set:
mongoose.connect(uri, {
  readPreference: 'secondaryPreferred'  // Read from replica if available
})
```

**4. Caching Layer**
```
Add Redis for:
✅ Subscription cache (check plan permissions < 1ms)
✅ WorkspaceUsage cache (avoid DB hit on every create)
✅ User session cache (fast profile lookups)

Example:
const cachedSub = await redis.get(`subscription:${wsId}`)
if (!cachedSub) {
  const sub = await Subscription.findOne({ workspaceId: wsId })
  await redis.set(`subscription:${wsId}`, JSON.stringify(sub), 'EX', 300)
}
```

**5. Database Partitioning**
```
Separate databases by region:
- US East: prod-us-east
- EU West: prod-eu-west
- Route requests by geography using load balancer

Benefits:
✅ Lower latency (users query nearest DB)
✅ Regulatory compliance (GDPR: EU data stays in EU)
✅ Disaster recovery (if one region down, others online)
```

**6. Async Job Processing**
```
Long-running operations offloaded to job queue:

Instead of:
POST /api/workspaces/:id/export
  → Export 100K tasks synchronously → slow

Better:
POST /api/workspaces/:id/export
  → Queue job to Bull/RabbitMQ
  → Return job_id immediately
  → Job runs async, sends email when done
  → User checks status via GET /jobs/:job_id
```

---

### 3. How to Prevent Race Conditions in Usage Updates

#### Problem: Race Condition

```
Scenario: Two requests try to add members simultaneously
INCORRECT approach (non-atomic):

Request 1:                        Request 2:
1. GET count (= 4)
2. Check 4 < 5? YES
3. [Context switch]               1. GET count (= 4)
4. [add member]                   2. Check 4 < 5? YES
5. SET count = 5                  3. [add member]
                                  4. SET count = 5
                                  
Result: Both added but count = 5 instead of 6!
This violates the limit (should be 5 max)
```

#### Solution: Atomic MongoDB Operations

**Method 1: Atomic Update with Conditional**
```javascript
// ✅ SAFE - Atomic
const result = await WorkspaceUsage.updateOne(
  {
    workspaceId: wsId,
    'counts.members': { $lt: planMaxMembers }  // Conditional check in query
  },
  {
    $inc: { 'counts.members': 1 }              // Atomic increment
  }
)

if (result.modifiedCount === 1) {
  // ✅ Count was incremented AND limit wasn't exceeded
  // Safe to proceed with creating member
  await WorkspaceMember.create({ userId, workspaceId, role })
} else {
  // ❌ Limit already reached
  return res.status(403).json({ error: 'Member limit reached' })
}
```

**Why this works:**
- MongoDB executes query + update atomically
- No context switching between check and increment
- If 5 requests come simultaneously, max one succeeds
- MongoDB blocks all increments once count reaches limit

**Method 2: Transactions (for multi-document updates)**
```javascript
// For operations spanning multiple collections
const session = await mongoose.startSession()
session.startTransaction()

try {
  // Both operations succeed together or both fail
  await WorkspaceUsage.updateOne(
    { workspaceId, 'counts.members': { $lt: limit } },
    { $inc: { 'counts.members': 1 } },
    { session }
  )
  
  await WorkspaceMember.create([{ userId, workspaceId }], { session })
  
  await session.commitTransaction()
} catch (error) {
  await session.abortTransaction()
  throw error
}
```

**Method 3: Optimistic Locking (Version field)**
```javascript
// If you need to avoid locks:
const schema = {
  workspaceId,
  counts: { members, projects, tasks },
  version: 1  // Increment on each update
}

// Update only if version hasn't changed
const result = await WorkspaceUsage.updateOne(
  { workspaceId, version: currentVersion },
  { 
    $inc: { 'counts.members': 1, version: 1 }
  }
)

if (result.matchedCount === 0) {
  // Version mismatch - another update happened
  throw new ConcurrentUpdateError('Retry update')
}
```

---

### 4. How to Support Plan Upgrades/Downgrades (Conceptually)

#### Upgrade Flow: FREE → PRO

```
User clicks "Upgrade to PRO"
  ↓
1. Check current subscription
   current_sub = find(workspaceId, status=ACTIVE)
   If current: mark as EXPIRED
  ↓
2. Create NEW subscription
   new_sub = {
     workspaceId,
     planId: PRO,
     status: ACTIVE,
     periodStart: now(),
     periodEnd: now() + 30 days,
     paidAt: null (demo)
   }
  ↓
3. Update workspace plan reference
   workspace.plan = PRO._id
  ↓
4. Usage limits effectively change
   (No migration needed - next CREATE checks new limits)
  ↓
5. Return to user: "Upgraded! 30-day demo starts now"
```

**Code Implementation:**
```javascript
async function upgradeWorkspacePlan(workspaceId, planSlug) {
  // 1. Mark old subscription expired
  await Subscription.updateOne(
    { workspaceId, status: 'ACTIVE' },
    { status: 'EXPIRED', expiredAt: new Date() }
  )
  
  // 2. Create new subscription
  const newPlan = await SubscriptionPlan.findOne({ slug: planSlug })
  const newSub = await Subscription.create({
    workspaceId,
    planId: newPlan._id,
    status: 'ACTIVE',
    periodStart: new Date(),
    periodEnd: addDays(new Date(), 30)  // 30-day trial
  })
  
  // 3. Update workspace
  await Workspace.updateOne(
    { _id: workspaceId },
    { plan: newPlan._id }
  )
  
  // 4. Log for audit trail
  await SubscriptionHistory.create({
    workspaceId,
    action: 'UPGRADE',
    from: 'FREE',
    to: planSlug,
    timestamp: new Date()
  })
  
  return newSub
}
```

#### Downgrade Flow: PRO → FREE

**Option A: Immediate Downgrade**
```
User cancels PRO
  ↓
1. Mark PRO subscription as CANCELLED
  ↓
2. Create immediate FREE subscription
  ↓
3. Check if usage exceeds FREE limits
   - If members > 5: prevent (error: "Remove members before downgrading")
   - If all OK: proceed
  ↓
4. Update workspace.plan = FREE
  ↓
5. Notify: "Downgraded to FREE. Your 5-member limit is now active"
```

**Option B: Graceful Downgrade**
```
User cancels PRO (expires in 7 days)
  ↓
1. Set subscription.canceledAt = now()
2. Keep status = ACTIVE until periodEnd
  ↓
3. Display warning: "Plan expires in 7 days"
  ↓
4. Day 7: Auto-downgrade (same as Option A)
```

**Code:**
```javascript
async function downgradeWorkspacePlan(workspaceId) {
  // Get current subscription
  const currentSub = await Subscription.findOne({
    workspaceId,
    status: 'ACTIVE'
  })
  
  // Check if usage is compatible with FREE plan
  const usage = await WorkspaceUsage.findOne({ workspaceId })
  const freePlan = await SubscriptionPlan.findOne({ slug: 'free' })
  
  if (usage.counts.members > freePlan.maxMembers) {
    throw new Error(
      `Cannot downgrade. You have ${usage.counts.members} members. ` +
      `FREE plan allows ${freePlan.maxMembers}. Remove ${usage.counts.members - freePlan.maxMembers} members first.`
    )
  }
  
  // Mark old subscription as cancelled
  await Subscription.updateOne(
    { _id: currentSub._id },
    { 
      status: 'CANCELLED',
      canceledAt: new Date()
    }
  )
  
  // Create FREE subscription
  const freeSub = await Subscription.create({
    workspaceId,
    planId: freePlan._id,
    status: 'ACTIVE',
    periodStart: new Date(),
    periodEnd: null  // FREE never expires
  })
  
  // Update workspace
  await Workspace.updateOne(
    { _id: workspaceId },
    { plan: freePlan._id }
  )
  
  return freeSub
}
```

#### Auto-Downgrade on Expiration

```javascript
// Middleware runs on every request
async function requireActiveSubscription(req, res, next) {
  const workspaceId = req.body.workspaceId
  
  const sub = await Subscription.findOne({
    workspaceId,
    status: { $in: ['ACTIVE', 'PENDING'] }
  })
  
  if (!sub) {
    return res.status(402).json({ error: 'No active subscription' })
  }
  
  // Check expiration
  if (sub.periodEnd && new Date() > sub.periodEnd) {
    // ✅ Auto-downgrade
    console.log('Subscription expired, auto-downgrading to FREE')
    
    // Mark old as expired
    await Subscription.updateOne(
      { _id: sub._id },
      { status: 'EXPIRED' }
    )
    
    // Create FREE subscription
    const freePlan = await SubscriptionPlan.findOne({ slug: 'free' })
    await Subscription.create({
      workspaceId,
      planId: freePlan._id,
      status: 'ACTIVE',
      periodEnd: null
    })
    
    // Update workspace
    await Workspace.updateOne(
      { _id: workspaceId },
      { plan: freePlan._id }
    )
    
    // Notify user
    // sendEmail(workspace.ownerEmail, 'Trial expired, reverted to FREE plan')
  }
  
  next()
}
```

---

### 5. How to Extend the System for New Features

#### Adding a New Tier (ENTERPRISE Plan)

**Step 1: Add to Database**
```javascript
// Create in MongoDB:
db.subscriptionplans.insertOne({
  _id: ObjectId(),
  name: "Enterprise",
  slug: "enterprise",
  description: "For large organizations",
  features: [
    "basic_projects",
    "basic_tasks",
    "advanced_analytics",
    "custom_workflows",
    "sso_saml",           // NEW: Single sign-on
    "audit_logs",         // NEW: Complete audit trail
    "api_access",         // NEW: REST API for integrations
    "dedicated_support"   // NEW: Priority support
  ],
  maxProjects: 0,         // Unlimited
  maxTasks: 0,            // Unlimited
  maxMembers: 0,          // Unlimited
  maxApiCalls: 100000,    // NEW: 100K API calls/month
  isDefault: false,
  price: 499,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Step 2: Add Feature Gate Middleware**
```javascript
// backend/middleware/subscription.middleware.js
async function requireFeature(requiredFeature) {
  return async (req, res, next) => {
    const workspace = await Workspace.findById(req.body.workspaceId)
    const sub = await Subscription.findOne({
      workspaceId: workspace._id,
      status: 'ACTIVE'
    })
    const plan = await SubscriptionPlan.findById(sub.planId)
    
    if (!plan.features.includes(requiredFeature)) {
      return res.status(403).json({
        error: 'Feature not available on your plan',
        feature: requiredFeature,
        availablePlans: ['enterprise']
      })
    }
    
    next()
  }
}

// Usage in a route:
router.get(
  '/audit-logs',
  protect,
  requireFeature('audit_logs'),
  getAuditLogs
)
```

**Step 3: Add to Schema/Model (if new data needed)**
```javascript
// If ENTERPRISE needs audit logs:
const auditLogSchema = new Schema({
  workspaceId: UUID,
  userId: UUID,
  action: String,            // 'PROJECT_CREATED', 'USER_ADDED', etc.
  resourceType: String,      // 'project', 'task', 'user'
  resourceId: String,
  changes: Object,           // What changed
  timestamp: Date,
  ipAddress: String,
  userAgent: String
})
```

**Step 4: Implement Feature Logic**
```javascript
// controllers/auditLog.controller.js
async function getAuditLogs(req, res) {
  const { workspaceId } = req.body
  const logs = await AuditLog.find({ workspaceId })
    .sort({ timestamp: -1 })
    .limit(1000)
  
  res.json(logs)
}

// Add logging hook before operations
async function createProject(req, res) {
  const project = await Project.create(req.body)
  
  // Log if workspace has audit_logs feature
  const sub = await Subscription.findOne({ workspaceId })
  const plan = await SubscriptionPlan.findById(sub.planId)
  
  if (plan.features.includes('audit_logs')) {
    await AuditLog.create({
      workspaceId,
      userId: req.user._id,
      action: 'PROJECT_CREATED',
      resourceId: project._id,
      timestamp: new Date()
    })
  }
  
  res.status(201).json(project)
}
```

**Step 5: Update Frontend**
```javascript
// frontend/pages/Subscription.jsx
async function selectPlan(planSlug) {
  if (planSlug === 'enterprise') {
    // Show request form instead of auto-upgrade
    return showEnterpriseRequestForm()
  }
  
  // Auto-upgrade for other plans
  const response = await axios.post(
    '/api/subscription/upgrade',
    { workspaceId, planSlug }
  )
}
```

#### Adding a New Collection (Task Dependencies)

**Step 1: Create Schema**
```javascript
// models/taskDependency.model.js
const taskDependencySchema = new Schema({
  _id: UUID,
  workspaceId: UUID,      // For multi-tenant filtering
  taskId: UUID,           // Task that depends on something
  dependsOnTaskId: UUID,  // Task that must complete first
  type: String,           // 'blocks', 'blocked_by', 'relates_to'
  createdAt: Date,
  updatedAt: Date
})

taskDependencySchema.index({ workspaceId: 1 })
taskDependencySchema.index({ taskId: 1 })
taskDependencySchema.index({ dependsOnTaskId: 1 })
```

**Step 2: Add to Routes & Controllers**
```javascript
// routes/task.routes.js
router.post('/add-dependency', protect, checkWorkspaceAdmin, createDependency)
router.get('/:taskId/dependencies', protect, getDependencies)
router.delete('/dependency/:dependencyId', protect, deleteDependency)

// controllers/task.controller.js
async function createDependency(req, res) {
  const { taskId, dependsOnTaskId, type } = req.body
  
  // Validate both tasks exist and are in same workspace
  const task1 = await Task.findById(taskId)
  const task2 = await Task.findById(dependsOnTaskId)
  
  if (task1.workspaceId !== task2.workspaceId) {
    return res.status(400).json({
      error: 'Tasks must be in same workspace'
    })
  }
  
  // Prevent circular dependencies
  const wouldCreateCycle = await checkCycleDependency(taskId, dependsOnTaskId)
  if (wouldCreateCycle) {
    return res.status(400).json({ error: 'Would create circular dependency' })
  }
  
  const dependency = await TaskDependency.create({
    workspaceId: task1.workspaceId,
    taskId,
    dependsOnTaskId,
    type
  })
  
  res.status(201).json(dependency)
}
```

**Step 3: Integrate with Business Logic**
```javascript
// When marking task as DONE, check dependents
async function updateTask(req, res) {
  const { taskId } = req.params
  const { status } = req.body
  
  const task = await Task.findByIdAndUpdate(taskId, { status })
  
  if (status === 'DONE') {
    // Notify dependent tasks that this blocker is complete
    const dependents = await TaskDependency.find({
      dependsOnTaskId: taskId,
      type: 'blocks'
    })
    
    for (const dep of dependents) {
      // Update dependent task with "ready_to_start" flag
      await Task.updateOne(
        { _id: dep.taskId },
        { $set: { readyToStart: true } }
      )
      // Notify assignee
      // sendNotification(dep.taskId, 'This task is now ready to start')
    }
  }
  
  res.json(task)
}
```

**Step 4: Add Feature Gate (if premium)**
```javascript
// Make task dependencies a PRO feature
router.post(
  '/add-dependency',
  protect,
  checkWorkspaceAdmin,
  requireFeature('task_dependencies'),  // NEW
  createDependency
)
```

**Step 5: Update Tests**
```javascript
// tests/taskDependency.test.js
describe('Task Dependencies', () => {
  test('should create dependency', async () => { ... })
  test('should prevent circular dependencies', async () => { ... })
  test('should notify dependents when blocker completes', async () => { ... })
  test('should require PRO plan', async () => { ... })
})
```

---

## 🔄 Scaling Considerations

### Database Optimization
1. **Indexes**: Create indexes on frequently filtered fields
2. **Lean queries**: Use `.lean()` for read-only data
3. **Pagination**: Always limit results (avoid fetching all)
4. **Projection**: Select only needed fields

### API Optimization
1. **Caching**: Cache subscription plans (rarely change)
2. **Batch operations**: Allow bulk create/update
3. **Compression**: Enable gzip for responses
4. **Rate limiting**: Prevent abuse (e.g., 100 req/min per IP)

### Frontend Optimization
1. **Lazy loading**: Load components/data as needed
2. **Virtual scrolling**: For large lists (1000+ items)
3. **Service workers**: Cache API responses offline
4. **Code splitting**: Load only needed bundles

---

## Summary

This design provides:
-  Strong multi-tenancy isolation
-  Safe concurrent operations (atomic updates)
-  Efficient scaling (sharding, caching, replicas)
-  Flexible subscriptions (plans, features, auto-downgrade)
-  Extensibility (new plans, features, collections)
