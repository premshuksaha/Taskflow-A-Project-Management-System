import { SearchIcon, PanelLeft, ZapIcon, LogOutIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/themeSlice'
import { clearAuthData } from '../features/workspaceSlice'
import { MoonIcon, SunIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = ({ setIsSidebarOpen }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme } = useSelector(state => state.theme);
    const { currentWorkspace, currentUser } = useSelector(state => state.workspace);
    const isPro = currentWorkspace?.plan?.slug === "PRO";
    const isAdmin = currentWorkspace?.role === 'ADMIN';

    // Format expiration date
    const formatExpirationDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Expired';
        if (diffDays === 0) return 'Expires today';
        if (diffDays === 1) return 'Expires tomorrow';
        return `Expires in ${diffDays}d`;
    };

    const expirationText = formatExpirationDate(currentWorkspace?.subscription?.periodEnd);

    // Generate user initials
    const getUserInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        return parts.length > 1 
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : parts[0][0].toUpperCase();
    };

    const handleLogout = () => {
        dispatch(clearAuthData());
        navigate('/login');
    };

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 xl:px-16 py-3 shrink-0">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
                {/* Left section */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Sidebar Trigger */}
                    <button onClick={() => setIsSidebarOpen((prev) => !prev)} className="sm:hidden p-2 rounded-lg transition-colors text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800" >
                        <PanelLeft size={20} />
                    </button>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-3">

                    {/* Theme Toggle */}
                    <button onClick={() => dispatch(toggleTheme())} className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg transition hover:scale-105 active:scale-95">
                        {
                            theme === "light"
                                ? (<MoonIcon className="size-4 text-gray-800 dark:text-gray-200" />)
                                : (<SunIcon className="size-4 text-yellow-400" />)
                        }
                    </button>

                    {isAdmin && (
                        <Link 
                            to="/subscription" 
                            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                isPro 
                                ? "bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30" 
                                : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700"
                            }`}
                        >
                            {isPro ? (
                                <>
                                    <ZapIcon size={12} className="fill-current" />
                                    <div className="flex flex-col gap-0.5">
                                        <span>PRO</span>
                                        {expirationText && <span className="text-[10px] opacity-80">{expirationText}</span>}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span>FREE PLAN</span>
                                    {expirationText && <span className="text-[10px] opacity-80">{expirationText}</span>}
                                </>
                            )}
                        </Link>
                    )}

                    {/* User Button */}
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white text-xs font-bold shadow">
                        {getUserInitials(currentUser?.name)}
                    </div>
                    
                    {/* Logout Button */}
                    <button 
                        onClick={handleLogout}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Logout"
                    >
                        <LogOutIcon size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Navbar
