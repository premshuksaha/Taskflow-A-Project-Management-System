import { FolderOpen, CheckCircle, Users, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { API_PATHS } from "../utils/apiPaths";
import axiosInstance from "../utils/axiosInstance";

export default function StatsGrid() {
    const { currentWorkspace, currentUser } = useSelector(
        (state) => state.workspace
    );

    const [stats, setStats] = useState({
        totalProjects: 0,
        activeTasks: 0,
        completedProjects: 0,
        myTasks: 0,
        overdueIssues: 0,
    });

    // Check if user is admin
    const isAdmin = currentWorkspace?.role === 'ADMIN' || currentWorkspace?.ownerId === currentUser?._id;

    useEffect(() => {
        const fetchDashboardStats = async () => {
            if (!currentWorkspace?._id) return;

            try {
                const response = await axiosInstance.get(API_PATHS.DASHBOARD.STATS(currentWorkspace._id));
                const data = response.data;
                
                setStats({
                    totalProjects: data.projectCount || 0,
                    activeTasks: data.activeTasksCount || 0,
                    completedProjects: data.completedProjectsCount || 0,
                    myTasks: data.myTasksCount ?? 0,
                    overdueIssues: data.overdueTasksCount || 0,
                });
            } catch (error) {
                console.error("Dashboard stats error:", error);
            }
        };

        fetchDashboardStats();
    }, [currentWorkspace?._id, currentWorkspace?.projects]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-9">
            {[
                {
                    icon: FolderOpen,
                    title: "Total Projects",
                    value: stats.totalProjects,
                    subtitle: isAdmin ? `projects in ${currentWorkspace?.name}` : `projects you're assigned to`,
                    bgColor: "bg-blue-500/10",
                    textColor: "text-blue-500",
                },
                {
                    icon: CheckCircle,
                    title: "Completed Projects",
                    value: stats.completedProjects,
                    subtitle: isAdmin ? `of ${stats.totalProjects} total` : `of ${stats.totalProjects} assigned`,
                    bgColor: "bg-emerald-500/10",
                    textColor: "text-emerald-500",
                },
                {
                    icon: Users,
                    title: "Active Tasks",
                    value: stats.myTasks,
                    subtitle: "pending tasks",
                    bgColor: "bg-purple-500/10",
                    textColor: "text-purple-500",
                },
                {
                    icon: AlertTriangle,
                    title: "Overdue",
                    value: stats.overdueIssues,
                    subtitle: "need attention",
                    bgColor: "bg-amber-500/10",
                    textColor: "text-amber-500",
                },
            ].map(
                ({ icon: Icon, title, value, subtitle, bgColor, textColor }, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-950 dark:bg-linear-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200 rounded-md" >
                        <div className="p-6 py-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                                        {title}
                                    </p>
                                    <p className="text-3xl font-bold text-zinc-800 dark:text-white">
                                        {value}
                                    </p>
                                    {subtitle && (
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                                <div className={`p-3 rounded-xl ${bgColor} bg-opacity-20`}>
                                    <Icon size={20} className={textColor} />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
