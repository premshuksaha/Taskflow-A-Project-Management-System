const Project = require('../models/project.model');
const { decrementUsage } = require('../utils/usageUtils');

//Get all projects in a workspace for the logged in user
exports.getProjects = async (req, res) => {
    const { workspaceId } = req.params;

    try {
        const projects = await Project.find({ workspaceId });
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

//Create a new project in a workspace by checking subscription limits
exports.createProject = async (req, res) => {
    const { name, description, priority, status, start_date, end_date, team_lead, workspaceId, progress, team_members } = req.body;
    const User = require('../models/user.model');
    const ProjectMember = require('../models/projectMember.model');

    //validate name and start_date
    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Project name is required' });
    }
    if (!start_date) {
        return res.status(400).json({ message: 'Start date is required' });
    }

    try {
        const newProject = new Project({
            name,
            description,
            priority,
            status,
            start_date,
            end_date,
            team_lead,
            workspaceId,
            progress: progress || 0
        });

        const savedProject = await newProject.save();

        // Add selected team members to the project
        if (team_members && team_members.length > 0) {
            for (const email of team_members) {
                const user = await User.findOne({ email });
                if (user) {
                    const existingMember = await ProjectMember.findOne({ userId: user._id, projectId: savedProject._id });
                    if (!existingMember) {
                        const newMember = new ProjectMember({ userId: user._id, projectId: savedProject._id });
                        await newMember.save();
                    }
                }
            }
        }

        res.status(201).json(savedProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

//Edit  the existing project details
exports.updateProject = async (req, res) => {
    const { projectId } = req.params;
    const { name, description, priority, status, start_date, end_date, team_lead, progress } = req.body;

    try {
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { name, description, priority, status, start_date, end_date, team_lead, progress },
            { returnDocument: 'after' }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

//Delete a project from the workspace
exports.deleteProject = async (req, res) => {
    const { projectId } = req.params;

    try {
        const deletedProject = await Project.findByIdAndDelete(projectId);

        if (!deletedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await decrementUsage(deletedProject.workspaceId, 'projects');
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Add member to project
exports.addProjectMember = async (req, res) => {
    const { projectId, email } = req.body;
    const User = require('../models/user.model');
    const ProjectMember = require('../models/projectMember.model');

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const existingMember = await ProjectMember.findOne({ userId: user._id, projectId });
        if (existingMember) return res.status(400).json({ message: 'Member already in project' });

        const newMember = new ProjectMember({ userId: user._id, projectId });
        await newMember.save();

        res.status(201).json({ message: 'Member added to project successfully' });
    } catch (error) {
        console.error('Error adding project member:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


