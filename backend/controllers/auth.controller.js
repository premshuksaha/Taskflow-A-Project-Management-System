const User = require('../models/user.model');
const Workspace = require('../models/workspace.model');
const WorkspaceMember = require('../models/workspaceMember.model');
const SubscriptionPlan = require('../models/subscriptionPlan.model');
const Subscription = require('../models/subscription.model');
const { syncUsageCounts } = require('../utils/usageUtils');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
};

const signup = async (req, res) => {
    try {
        const { name, email, password, workspaceName } = req.body;

        // Validate all required fields first
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Name is required' });
        }

        if (!email || email.trim() === '') {
            return res.status(400).json({ message: 'Email is required' });
        }

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        if (!workspaceName || workspaceName.trim() === '') {
            return res.status(400).json({ message: 'Workspace name is required' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Handle the hashing through pre-save hook
        const user = new User({ name, email, password });
        await user.save();
        
        // Generate a random slug for the workspace from its name
        const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 10000);
        
        // Find default plan (FREE)
        const defaultPlan = await SubscriptionPlan.findOne({ isDefault: true }) || await SubscriptionPlan.findOne({ slug: 'FREE' });

        const workspace = new Workspace({
            name: workspaceName,
            slug: slug,
            ownerId: user._id,
            plan: defaultPlan ? defaultPlan._id : null
        });
        await workspace.save();

        // Automatically add the workspace owner as an ADMIN member
        const adminMember = new WorkspaceMember({
            userId: user._id,
            workspaceId: workspace._id,
            role: 'ADMIN'
        });
        await adminMember.save();

        if (defaultPlan) {
            const newSubscription = await Subscription.create({
                workspaceId: workspace._id,
                planId: defaultPlan._id,
                status: 'ACTIVE',
                periodStart: new Date(),
                periodEnd: null
            });

            workspace.subscription = {
                status: newSubscription.status,
                periodEnd: newSubscription.periodEnd,
                planName: defaultPlan.name
            };
        }

        await syncUsageCounts(workspace._id);

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: { _id: user._id, name: user.name, email: user.email },
            workspace
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const workspace = await Workspace.findOne({ ownerId: user._id }).populate('plan').lean();
        
        // Get subscription info
        const Subscription = require('../models/subscription.model');
        const subscription = workspace ? await Subscription.findOne({
            workspaceId: workspace._id,
            status: 'ACTIVE'
        }).populate('planId').lean() : null;

        if (workspace && subscription) {
            workspace.subscription = {
                status: subscription.status,
                periodEnd: subscription.periodEnd,
                planName: subscription.planId?.name
            };
        }

        const token = generateToken(user._id);

        res.json({
            token,
            user: { _id: user._id, name: user.name, email: user.email },
            workspace
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        const workspaces = await Workspace.find({ ownerId: user._id });
        
        // Ensure all workspace owners have a WorkspaceMember record with ADMIN role
        for (let workspace of workspaces) {
            const existingMember = await WorkspaceMember.findOne({
                userId: user._id,
                workspaceId: workspace._id
            });
            
            if (!existingMember) {
                console.log(`[getProfile] Creating missing WorkspaceMember for workspace ${workspace._id}`);
                await WorkspaceMember.create({
                    userId: user._id,
                    workspaceId: workspace._id,
                    role: 'ADMIN'
                });
            }
        }
        
        // Find if user is a member of any other workspaces too
        const memberships = await WorkspaceMember.find({ userId: user._id });
        const memberWorkspaceIds = memberships.map(m => m.workspaceId);
        
        // Combine all unique workspaces
        const allWorkspaceIds = [...new Set([...workspaces.map(w => w._id), ...memberWorkspaceIds])];
        const allWorkspaces = await Workspace.find({ _id: { $in: allWorkspaceIds } }).populate('plan').lean();
        
        // Get subscription info for each workspace
        const Subscription = require('../models/subscription.model');
        const subscriptionMap = new Map();
        for (const wsId of allWorkspaceIds) {
            const subscription = await Subscription.findOne({
                workspaceId: wsId,
                status: 'ACTIVE'
            }).populate('planId').lean();
            subscriptionMap.set(wsId, subscription);
        }

        // Add role and subscription information to each workspace
        const workspacesWithRoles = allWorkspaces.map(ws => {
            const membership = memberships.find(m => m.workspaceId === ws._id);
            const isOwner = ws.ownerId === user._id;
            const subscription = subscriptionMap.get(ws._id);
            return {
                ...ws,
                role: isOwner ? 'ADMIN' : (membership?.role || 'MEMBER'),
                subscription: subscription ? {
                    status: subscription.status,
                    periodEnd: subscription.periodEnd,
                    planName: subscription.planId?.name
                } : null
            };
        });

        // Add member count to all workspaces
        for (let ws of workspacesWithRoles) {
            const memberCount = await WorkspaceMember.countDocuments({ workspaceId: ws._id });
            ws.membersCount = memberCount;
        }

        // Let's pick the first one as default and populate it
        let currentWorkspace = null;
        if (workspacesWithRoles.length > 0) {
            const Project = require('../models/project.model');
            const Task = require('../models/task.model');
            const WorkspaceMember = require('../models/workspaceMember.model');

            currentWorkspace = workspacesWithRoles[0];
            const userRole = currentWorkspace.role;
            
            // Re-fetch with population
            const WorkspaceFull = await Workspace.findById(currentWorkspace._id).populate('plan').lean();
            if (WorkspaceFull) {
                const subscriptionData = subscriptionMap.get(currentWorkspace._id);
                currentWorkspace = { 
                    ...WorkspaceFull, 
                    role: userRole,
                    subscription: subscriptionData ? {
                        status: subscriptionData.status,
                        periodEnd: subscriptionData.periodEnd,
                        planName: subscriptionData.planId?.name
                    } : null
                };
            }
            
            // Get projects and tasks based on role
            const ProjectMember = require('../models/projectMember.model');
            let projects = [];
            
            if (userRole === 'ADMIN') {
                // Admins see all projects
                projects = await Project.find({ workspaceId: currentWorkspace._id }).lean();
            } else {
                // Members only see projects where they have assigned tasks
                const userTasks = await Task.find({ 
                    assigneeId: user._id 
                }).select('projectId').lean();
                const projectIds = [...new Set(userTasks.map(t => t.projectId))];
                projects = await Project.find({ 
                    _id: { $in: projectIds },
                    workspaceId: currentWorkspace._id 
                }).lean();
            }
            
            for (let project of projects) {
                if (userRole === 'ADMIN') {
                    // Admins see all tasks in the project
                    project.tasks = await Task.find({ projectId: project._id }).populate('assigneeId', 'name email').lean();
                } else {
                    // Members only see their assigned tasks
                    project.tasks = await Task.find({ 
                        projectId: project._id,
                        assigneeId: user._id 
                    }).populate('assigneeId', 'name email').lean();
                }
                
                // Fetch and format project members
                const projectMembers = await ProjectMember.find({ projectId: project._id })
                    .populate('userId', 'name email image')
                    .lean();
                
                project.members = projectMembers
                    .filter(m => m.userId)
                    .map(m => ({
                        _id: m._id,
                        user: m.userId
                    }));
            }
            currentWorkspace.projects = projects;

            // Get members
            const members = await WorkspaceMember.find({ workspaceId: currentWorkspace._id })
                .populate('userId', 'name email image')
                .lean();
            
            // Format members to include user details directly for convenience
            currentWorkspace.members = members
                .filter(m => m.userId) // Ensure user exists
                .map(m => ({
                    _id: m._id,
                    role: m.role,
                    user: m.userId
                }));
            
            // Also include the owner as a member if not already there
            if (!currentWorkspace.members.find(m => m.user?._id === currentWorkspace.ownerId)) {
                const owner = await User.findById(currentWorkspace.ownerId).select('name email image').lean();
                currentWorkspace.members.unshift({
                    _id: 'owner-' + currentWorkspace.ownerId,
                    role: 'ADMIN',
                    user: owner
                });
            }
        }
        
        res.json({
            user,
            workspaces: workspacesWithRoles,
            currentWorkspace
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { signup, login, getProfile };
