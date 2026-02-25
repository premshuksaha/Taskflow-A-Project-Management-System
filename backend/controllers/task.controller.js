const Task = require('../models/task.model');
const ProjectMember = require('../models/projectMember.model');
const { decrementUsage } = require('../utils/usageUtils');

// Create a task
const createTask = async (req, res) => {
    try {
        const { title, projectId, workspaceId, assigneeId, due_date, status, type, priority, description } = req.body;

        if (!title || !projectId || !workspaceId) {
            return res.status(400).json({ message: 'Title, Project ID, and Workspace ID are required' });
        }

        // Validate assignee is a project member
        if (assigneeId) {
            const isProjectMember = await ProjectMember.findOne({
                projectId,
                userId: assigneeId
            });

            if (!isProjectMember) {
                return res.status(400).json({ 
                    message: 'Assignee must be a member of the project.' 
                });
            }
        }

        const taskData = {
            title,
            projectId,
            workspaceId,
            status,
            type,
            priority,
            description,
            // Only add these if they have values to avoid Mongoose validation/casting issues with empty strings
            ...(assigneeId && { assigneeId }),
            ...(due_date && { due_date: new Date(due_date) })
        };

        const newTask = new Task(taskData);
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ 
            message: 'Error creating task', 
            error: error.message 
        });
    }
};

// Get tasks for a project
const getTasksByProject = async (req, res) => {
    const { projectId } = req.params;
    try {
        const tasks = await Task.find({ projectId }).populate('assigneeId', 'name email');
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get tasks for a workspace
const getTasksByWorkspace = async (req, res) => {
    const { workspaceId } = req.params;
    try {
        const tasks = await Task.find({ workspaceId }).populate('assigneeId', 'name email');
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching workspace tasks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a task
const updateTask = async (req, res) => {
    const { taskId } = req.params;
    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // If assigneeId is being updated, validate it's a project member
        if (req.body.assigneeId && req.body.assigneeId !== task.assigneeId?.toString()) {
            const isProjectMember = await ProjectMember.findOne({
                projectId: task.projectId,
                userId: req.body.assigneeId
            });

            if (!isProjectMember) {
                return res.status(400).json({ 
                    message: 'Assignee must be a member of the project.' 
                });
            }
        }

        const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, { returnDocument: 'after' });
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a task
const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    try {
        const deletedTask = await Task.findByIdAndDelete(taskId);
        if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
        await decrementUsage(deletedTask.workspaceId, 'tasks');
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createTask,
    getTasksByProject,
    updateTask,
    deleteTask,
    getTasksByWorkspace
};
