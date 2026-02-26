const Project = require('../models/project.model');
const Task = require('../models/task.model');
const Workspace = require('../models/workspace.model');
const WorkspaceMember = require('../models/workspaceMember.model');

exports.getDashboardStats = async (req, res) => {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    try {
        // Check if user is workspace admin (owner or ADMIN role)
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            ownerId: userId
        });

        const isOwner = !!workspace;
        
        let isAdmin = isOwner;
        if (!isOwner) {
            const membership = await WorkspaceMember.findOne({
                workspaceId,
                userId,
                role: 'ADMIN'
            });
            isAdmin = !!membership;
        }

        let projectCount, completedProjectsCount;

        if (isAdmin) {
            // Admin sees all workspace projects
            projectCount = await Project.countDocuments({ workspaceId });
            completedProjectsCount = await Project.countDocuments({ workspaceId, status: 'COMPLETED' });
        } else {
            // Non-admin sees only projects where they have assigned tasks
            const userTasks = await Task.find({ 
                workspaceId,
                assigneeId: userId 
            }).select('projectId').lean();
            const projectIds = [...new Set(userTasks.map(t => t.projectId))];

            projectCount = await Project.countDocuments({ 
                workspaceId,
                _id: { $in: projectIds }
            });
            completedProjectsCount = await Project.countDocuments({ 
                workspaceId,
                _id: { $in: projectIds },
                status: 'COMPLETED' 
            });
        }

        const activeTasksCount = await Task.countDocuments({ workspaceId, assigneeId: userId, status: { $ne: 'DONE' } });
        const completedTasksCount = await Task.countDocuments({ workspaceId, assigneeId: userId, status: 'DONE' });

        // Basic stats for the dashboard
        res.json({
            projectCount,
            completedProjectsCount,
            activeTasksCount,
            completedTasksCount
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
