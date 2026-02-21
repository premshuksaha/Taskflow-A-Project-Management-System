const Project = require('../models/project.model');
const Task = require('../models/task.model');

exports.getDashboardStats = async (req, res) => {
    const { workspaceId } = req.params;

    try {
        const projectCount = await Project.countDocuments({ workspaceId });
        const activeTasksCount = await Task.countDocuments({ workspaceId, status: { $ne: 'DONE' } });
        const completedTasksCount = await Task.countDocuments({ workspaceId, status: 'DONE' });

        // Basic stats for the dashboard
        res.json({
            projectCount,
            activeTasksCount,
            completedTasksCount
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
