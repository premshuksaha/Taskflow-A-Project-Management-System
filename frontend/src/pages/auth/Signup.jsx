import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setAuthData } from '../../features/workspaceSlice';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import AuthNavbar from '../../components/AuthNavbar';
import { FaInfoCircle } from 'react-icons/fa';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    workspaceName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, formData);
      const data = response.data;

      localStorage.setItem('token', data.token);

      // Now fetch the full profile to ensure all associations are loaded
      const profileResponse = await axiosInstance.get(API_PATHS.AUTH.PROFILE);
      dispatch(setAuthData(profileResponse.data));

      toast.success('Workspace account created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Sign up failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthNavbar />
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-medium tracking-tight text-gray-900 dark:text-white">
            Create a new workspace
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/login" className="font-sans text-blue-600 hover:text-blue-500">
              log in to existing workspace
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSignup}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="mt-1 block w-full pr-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaRegEyeSlash className="h-4 w-4" /> : <FaRegEye className="h-4 w-4" />}
              </button>
            </div>
            <div>
              <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Workspace Name
              </label>
              <input
                id="workspaceName"
                name="workspaceName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                placeholder="Your Workspace name"
                value={formData.workspaceName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>

      {/* Informational Message for Joining Organizations */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-blue-50 dark:bg-blue-900/30 border-t-2 border-blue-200 dark:border-blue-800 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3">
            <FaInfoCircle className="text-blue-600 dark:text-blue-400 text-lg shrink-0" />
            <div className="text-center">
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-300 mr-2">
                Joining an Existing Workspace?
              </span>
              <span className="text-sm text-blue-700 dark:text-blue-400">
                To join as a member/admin of an workspace, please use the invite link sent by your workspace admin and then{' '}
                <Link to="/login" className="font-semibold underline text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100">
                  log in
                </Link>.
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;