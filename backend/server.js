require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const subscriptionRoutes = require('./routes/subscription.routes');
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const teamRoutes = require('./routes/team.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const taskRoutes = require('./routes/task.routes');
const workspaceRoutes = require('./routes/workspace.routes');
const commentRoutes = require('./routes/comment.routes');
const seedPlans = require('./utils/seedData');

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
})
);

app.use(express.json());

connectDB().then(() => {
    seedPlans();
});

// Routes
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/comments', commentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});