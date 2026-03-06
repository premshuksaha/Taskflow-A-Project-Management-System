const Workspace = require('../models/workspace.model');
const WorkspaceMember = require('../models/workspaceMember.model');
const Task = require('../models/task.model');
const Project = require('../models/project.model');

/**
 * Middleware to check if user is a workspace admin
 * Prevents non-admins from inviting members or changing workspace settings
 */
const checkWorkspaceAdmin = async (req, res, next) => {
    try {
        const { workspaceId } = req.body;
        const userId = req.user._id;

        if (!workspaceId) {
            return res.status(400).json({ message: 'Workspace ID is required' });
        }

        // Check if user is workspace owner or admin
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            ownerId: userId
        });

        if (workspace) {
            return next();
        }

        // Check if user is a member with admin role
        const membership = await WorkspaceMember.findOne({
            workspaceId,
            userId,
            role: 'ADMIN'
        });

        if (membership) {
            return next();
        }
        return res.status(403).json({ message: 'Only workspace admins can perform this action' });
    } catch (error) {
        console.error('Error checking workspace admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Middleware to check if user is a member of workspace
 * Used for accessing workspace data
 */
const checkWorkspaceMember = async (req, res, next) => {
    try {
        const { workspaceId } = req.params || req.body;
        const userId = req.user._id;

        if (!workspaceId) {
            return res.status(400).json({ message: 'Workspace ID is required' });
        }

        // Check if user is workspace owner
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            ownerId: userId
        });

        if (workspace) {
            return next();
        }

        // Check if user is a workspace member
        const membership = await WorkspaceMember.findOne({
            workspaceId,
            userId
        });

        if (!membership) {
            return res.status(403).json({ message: 'You are not a member of this workspace' });
        }

        next();
    } catch (error) {
        console.error('Error checking workspace membership:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Middleware to check if user can update a task
 * Admins can update any task, members can only update tasks assigned to them
 */
const checkTaskUpdatePermission = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id;

        if (!taskId) {
            return res.status(400).json({ message: 'Task ID is required' });
        }

        // Get the task to find its workspace
        const task = await Task.findById(taskId).populate('projectId');
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const workspaceId = task.projectId.workspaceId;

        // Check if user is workspace owner
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            ownerId: userId
        });

        if (workspace) {
            return next();
        }

        // Check if user is a workspace admin
        const adminMembership = await WorkspaceMember.findOne({
            workspaceId,
            userId,
            role: 'ADMIN'
        });

        if (adminMembership) {
            return next();
        }

        // Check if user is the assignee of the task
        if (task.assigneeId && task.assigneeId.toString() === userId.toString()) {
            return next();
        }

        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    } catch (error) {
        console.error('Error checking task update permission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Middleware to check if user is workspace admin for project operations
 * Extracts workspaceId from the project
 */
const checkProjectPermission = async (req, res, next) => {
    try {
        const projectId = req.params.projectId || req.body.projectId;
        const userId = req.user._id;

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        // Get the project to find its workspace
        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const workspaceId = project.workspaceId;

        // Check if user is workspace owner
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            ownerId: userId
        });

        if (workspace) {
            return next();
        }

        // Check if user is a workspace admin
        const membership = await WorkspaceMember.findOne({
            workspaceId,
            userId,
            role: 'ADMIN'
        });

        if (membership) {
            return next();
        }
        return res.status(403).json({ message: 'Only workspace admins can perform this action' });
    } catch (error) {
        console.error('Error checking project permission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Middleware to check if user is a member of a workspace via project access
 */
const checkProjectMember = async (req, res, next) => {
    try {
        const projectId = req.params.projectId || req.body.projectId;
        const userId = req.user._id;

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const workspaceId = project.workspaceId;

        const workspace = await Workspace.findOne({
            _id: workspaceId,
            ownerId: userId
        });

        if (workspace) {
            return next();
        }

        const membership = await WorkspaceMember.findOne({
            workspaceId,
            userId
        });

        if (!membership) {
            return res.status(403).json({ message: 'You are not a member of this workspace' });
        }

        next();
    } catch (error) {
        console.error('Error checking project membership:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Middleware to check if user is a member of a workspace via task access
 */
const checkTaskMember = async (req, res, next) => {
    try {
        const taskId = req.body?.taskId || req.params?.taskId;
        const userId = req.user._id;

        if (!taskId) return res.status(400).json({ message: 'Task ID is required' });

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const workspaceId = task.workspaceId;

        const isOwner = await Workspace.findOne({ _id: workspaceId, ownerId: userId });
        if (isOwner) return next();

        const adminMembership = await WorkspaceMember.findOne({
            workspaceId,
            userId,
            role: 'ADMIN'
        });
        if (adminMembership) return next();

        if (task.assigneeId && task.assigneeId.toString() === userId.toString()) {
            return next();
        }

        return res.status(403).json({ message: 'Only admins or assigned members can comment' });
    } catch (error) {
        console.error('Error checking comment permission:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Middleware to check if user is workspace admin for task deletion
 * Extracts workspaceId from the task's project
 */
const checkTaskDeletePermission = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id;

        if (!taskId) {
            return res.status(400).json({ message: 'Task ID is required' });
        }

        // Get the task to find its workspace
        const task = await Task.findById(taskId).populate('projectId');
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const workspaceId = task.projectId.workspaceId;

        // Check if user is workspace owner
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            ownerId: userId
        });

        if (workspace) {
            return next();
        }

        // Check if user is a workspace admin
        const membership = await WorkspaceMember.findOne({
            workspaceId,
            userId,
            role: 'ADMIN'
        });

        if (membership) {
            return next();
        }
        return res.status(403).json({ message: 'Only workspace admins can delete tasks' });
    } catch (error) {
        console.error('Error checking task delete permission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { 
    checkWorkspaceAdmin, 
    checkWorkspaceMember, 
    checkTaskUpdatePermission,
    checkProjectPermission,
    checkTaskDeletePermission,
    checkProjectMember,
    checkTaskMember
};
