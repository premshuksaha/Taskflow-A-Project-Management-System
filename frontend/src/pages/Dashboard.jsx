import { Plus, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import StatsGrid from '../components/StatsGrid'
import ProjectOverview from '../components/ProjectOverview'
import RecentActivity from '../components/RecentActivity'
import TasksSummary from '../components/TasksSummary'
import CreateProjectDialog from '../components/CreateProjectDialog'
import { setAuthData } from '../features/workspaceSlice'
import { API_PATHS } from '../utils/apiPaths'
import axiosInstance from '../utils/axiosInstance'

const Dashboard = () => {
    const { currentUser, currentWorkspace, loading: authLoading } = useSelector(state => state.workspace);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const dispatch = useDispatch();
    const isAdmin = currentWorkspace?.role === 'ADMIN';

    useEffect(() => {
        if (!currentWorkspace?._id) return;

        const fetchWorkspaceData = async () => {
            setIsFetching(true);
            try {
                // Re-fetch profile to get latest projects/tasks in sync
                const profileResponse = await axiosInstance.get(API_PATHS.AUTH.PROFILE);
                dispatch(setAuthData(profileResponse.data));
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setIsFetching(false);
            }
        };

        fetchWorkspaceData();
    }, [currentWorkspace?._id]);

    if (authLoading || (isFetching && !currentWorkspace?.projects?.length)) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-500" />
            </div>
        );
    }

    if (!currentWorkspace) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Workspace Found</h2>
                <p className="text-gray-500 dark:text-zinc-400 mb-6">Create or select a workspace to get started.</p>
                
            </div>
        );
    }

    return (
        <div className='max-w-6xl mx-auto'>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 ">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1"> 
                        Welcome back, {currentUser?.name || 'User'} 
                    </h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm"> Here's what's happening in {currentWorkspace?.name} today </p>
                </div>

                {isAdmin && (
                    <button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 px-5 py-2 text-sm rounded bg-linear-to-br from-blue-500 to-blue-600 text-white space-x-2 hover:opacity-90 transition" >
                        <Plus size={16} /> New Project
                    </button>
                )}

                <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            <StatsGrid />

            <div className="grid lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 space-y-8">
                    <ProjectOverview />
                    <RecentActivity />
                </div>
                <div>
                    <TasksSummary />
                </div>
            </div>
        </div>
    )
}

export default Dashboard;
