export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const API_PATHS = {
    AUTH: {
        REGISTER: '/auth/signup',
        LOGIN: '/auth/login',
        PROFILE: '/auth/profile',
    },
    WORKSPACE: {
        CREATE: '/auth/register', // Included in register for now
        UPDATE: (id) => `/workspaces/update/${id}`,
        DELETE: (id) => `/workspaces/delete/${id}`,
        GET_BY_USER: (userId) => `/workspaces/user/${userId}`,
        ADD_MEMBER: '/workspaces/add-member',
        INVITE: {
            SEND: '/workspaces/invite/send',
            ACCEPT: '/workspaces/invite/accept',
            GET_DETAILS: (token) => `/workspaces/invite/${token}`,
        }
    },
    PROJECT: {
        CREATE: '/projects/add',
        UPDATE: (projectId) => `/projects/update/${projectId}`,
        DELETE: (projectId) => `/projects/delete/${projectId}`,
        GET_BY_WORKSPACE: (workspaceId) => `/projects/get/${workspaceId}`,
        ADD_MEMBER: '/projects/add-member',
    },
    TASK: {
        CREATE: '/tasks/add',
        UPDATE: (taskId) => `/tasks/update/${taskId}`,
        DELETE: (taskId) => `/tasks/delete/${taskId}`,
        GET_BY_PROJECT: (projectId) => `/tasks/get/project/${projectId}`,
        GET_BY_WORKSPACE: (workspaceId) => `/tasks/get/workspace/${workspaceId}`,
    },
    SUBSCRIPTION: {
        PLANS: '/subscription/plans',
        UPGRADE: '/subscription/upgrade',
    },
    DASHBOARD: {
        STATS: (workspaceId) => `/dashboard/stats/${workspaceId}`,
    },
    TEAM: {
        GET_MEMBERS: (workspaceId) => `/team/${workspaceId}`,
    },
    COMMENT: {
        GET_BY_TASK: (taskId) => `/comments/task/${taskId}`,
        CREATE: '/comments/add',
        UPDATE: (commentId) => `/comments/update/${commentId}`,
        DELETE: (commentId) => `/comments/delete/${commentId}`,
    }
};