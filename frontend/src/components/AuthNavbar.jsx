import { MoonIcon, SunIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../features/themeSlice';

const AuthNavbar = () => {
    const dispatch = useDispatch();
    const { theme } = useSelector(state => state.theme);

    return (
        <nav className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left - Branding */}
                    <div className="flex items-center gap-3">
                        <img src="/favicon.ico" alt="Taskflow" className="w-10 h-10 rounded-lg shadow-lg" />
                        <div className="flex flex-col leading-tight">
                            <h1 className="text-2xl font-black bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
                                Taskflow
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 tracking-wide">
                                Project Management
                            </p>
                        </div>
                    </div>

                    {/* Theme Toggle */}
                    <button onClick={() => dispatch(toggleTheme())} className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg transition hover:scale-105 active:scale-95">
                        {
                            theme === "light"
                                ? (<MoonIcon className="size-4 text-gray-800 dark:text-gray-200" />)
                                : (<SunIcon className="size-4 text-yellow-400" />)
                        }
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default AuthNavbar;
