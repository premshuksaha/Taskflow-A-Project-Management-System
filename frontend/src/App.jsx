import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import Subscription from "./pages/Subscription";
import AcceptInvite from "./pages/AcceptInvite";
import UserProvider from "./context/UserContext";
import { loadTheme } from "./features/themeSlice";

const App = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadTheme());
    }, [dispatch]);
    return (
        <UserProvider>
            <Toaster 
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    style: {
                        padding: '16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                    },
                    success: {
                        style: {
                            background: '#10b981',
                            color: 'white',
                        },
                    },
                    error: {
                        style: {
                            background: '#ef4444',
                            color: 'white',
                        },
                    },
                    loading: {
                        style: {
                            background: '#3b82f6',
                            color: 'white',
                        },
                    },
                }}
            />
                <div>
                <Routes>
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Signup />} />
                    <Route path="accept-invite/:token" element={<AcceptInvite />} />
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="team" element={<Team />} />
                        <Route path="projects" element={<Projects />} />
                        <Route path="projectsDetail" element={<ProjectDetails />} />
                        <Route path="taskDetails" element={<TaskDetails />} />
                        <Route path="subscription" element={<Subscription />} />
                    </Route>
                </Routes>
                </div>
        </UserProvider>
    );
};

export default App;
