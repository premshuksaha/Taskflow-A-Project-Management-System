import React, { createContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthData, clearAuthData } from '../features/workspaceSlice';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.workspace.currentUser);

    // Function to update user information
    const updateUser = (userData) => {
        dispatch(setAuthData(userData));
    };

    // Function to clear user information (e.g., on logout)
    const clearUser = () => {
        dispatch(clearAuthData());
    };

    return (
        <UserContext.Provider value={{ user, updateUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
