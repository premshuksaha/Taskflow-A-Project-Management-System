import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    currentUser: null,
    loading: true,
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setAuthData: (state, action) => {
            state.currentUser = action.payload.user;
            state.workspaces = action.payload.workspaces || [];
            if (action.payload.currentWorkspace) {
                state.currentWorkspace = action.payload.currentWorkspace;
            } else if (state.workspaces.length > 0 && !state.currentWorkspace) {
                state.currentWorkspace = state.workspaces[0];
            }
            state.loading = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        clearAuthData: (state) => {
            state.currentUser = null;
            state.workspaces = [];
            state.currentWorkspace = null;
            state.loading = false;
            localStorage.removeItem('token');
        },
        setPlan: (state, action) => {
            if (state.currentWorkspace) {
                state.currentWorkspace.plan = action.payload;
                state.workspaces = state.workspaces.map((w) =>
                    w._id === state.currentWorkspace._id ? { ...w, plan: action.payload } : w
                );
            }
        },
        setWorkspaces: (state, action) => {
            state.workspaces = action.payload;
        },
        setCurrentWorkspace: (state, action) => {
            state.currentWorkspace = state.workspaces.find((w) => w._id === action.payload);
        },
        addWorkspace: (state, action) => {
            state.workspaces.push(action.payload);
            if (!state.currentWorkspace) {
                state.currentWorkspace = action.payload;
            }
        },
        updateWorkspace: (state, action) => {
            state.workspaces = state.workspaces.map((w) =>
                w._id === action.payload._id ? action.payload : w
            );
            if (state.currentWorkspace?._id === action.payload._id) {
                state.currentWorkspace = action.payload;
            }
        },
        deleteWorkspace: (state, action) => {
            state.workspaces = state.workspaces.filter((w) => w._id !== action.payload);
            if (state.currentWorkspace?._id === action.payload) {
                state.currentWorkspace = state.workspaces[0] || null;
            }
        },
        addProject: (state, action) => {
            if (state.currentWorkspace) {
                if (!state.currentWorkspace.projects) state.currentWorkspace.projects = [];
                state.currentWorkspace.projects.push(action.payload);
            }
            state.workspaces = state.workspaces.map((w) =>
                w._id === state.currentWorkspace?._id ? { ...w, projects: (w.projects || []).concat(action.payload) } : w
            );
        },
        addTask: (state, action) => {
            if (state.currentWorkspace && state.currentWorkspace.projects) {
                state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                    if (p._id === action.payload.projectId) {
                        return { ...p, tasks: [...(p.tasks || []), action.payload] };
                    }
                    return p;
                });
            }
            state.workspaces = state.workspaces.map((w) =>
                w._id === state.currentWorkspace?._id ? {
                    ...w, projects: (w.projects || []).map((p) =>
                        p._id === action.payload.projectId ? { ...p, tasks: [...(p.tasks || []), action.payload] } : p
                    )
                } : w
            );
        },
        updateTask: (state, action) => {
            if (state.currentWorkspace && state.currentWorkspace.projects) {
                state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                    if (p._id === action.payload.projectId) {
                        return { ...p, tasks: (p.tasks || []).map(t => t._id === action.payload._id ? action.payload : t) };
                    }
                    return p;
                });
            }
            state.workspaces = state.workspaces.map((w) =>
                w._id === state.currentWorkspace?._id ? {
                    ...w, projects: (w.projects || []).map((p) =>
                        p._id === action.payload.projectId ? { ...p, tasks: (p.tasks || []).map(t => t._id === action.payload._id ? action.payload : t) } : p
                    )
                } : w
            );
        },
        deleteTask: (state, action) => {
            const { taskId, projectId } = action.payload;
            if (state.currentWorkspace && state.currentWorkspace.projects) {
                state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                    if (p._id === projectId) {
                        return { ...p, tasks: (p.tasks || []).filter(t => t._id !== taskId) };
                    }
                    return p;
                });
            }
            state.workspaces = state.workspaces.map((w) =>
                w._id === state.currentWorkspace?._id ? {
                    ...w, projects: (w.projects || []).map((p) =>
                        p._id === projectId ? { ...p, tasks: (p.tasks || []).filter(t => t._id !== taskId) } : p
                    )
                } : w
            );
        },
    },
});

export const {
    setAuthData,
    setLoading,
    clearAuthData,
    setPlan,
    setWorkspaces,
    setCurrentWorkspace,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addProject,
    addTask,
    updateTask,
    deleteTask,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
