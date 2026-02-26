const Project = require('../models/project.model');
const Task = require('../models/task.model');
const Workspace = require('../models/workspace.model');
const WorkspaceMember = require('../models/workspaceMember.model');
const ProjectMember = require('../models/projectMember.model');

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
            // Non-admin sees projects they are added to
            const userProjectMemberships = await ProjectMember.find({
                userId
            }).select('projectId').lean();
            const projectIds = [...new Set(userProjectMemberships.map(m => m.projectId))];

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

        const activeTasksCount = isAdmin
            ? await Task.countDocuments({ workspaceId, status: { $ne: 'DONE' } })
            : await Task.countDocuments({ workspaceId, assigneeId: userId, status: { $ne: 'DONE' } });

        const completedTasksCount = isAdmin
            ? await Task.countDocuments({ workspaceId, status: 'DONE' })
            : await Task.countDocuments({ workspaceId, assigneeId: userId, status: 'DONE' });

        const myTasksCount = await Task.countDocuments({
            workspaceId,
            assigneeId: userId,
            status: { $ne: 'DONE' }
        });

        // Calculate overdue tasks (due_date < today and status !== 'DONE')
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const overdueTasksCount = isAdmin
            ? await Task.countDocuments({ 
                workspaceId, 
                status: { $ne: 'DONE' },
                due_date: { $lt: today }
              })
            : await Task.countDocuments({ 
                workspaceId, 
                assigneeId: userId,
                status: { $ne: 'DONE' },
                due_date: { $lt: today }
              });

        // Basic stats for the dashboard
        res.json({
            projectCount,
            completedProjectsCount,
            activeTasksCount,
            completedTasksCount,
            myTasksCount,
            overdueTasksCount
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
