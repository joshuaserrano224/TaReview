import { router } from 'expo-router';
import { createContext, useContext, useState } from 'react';

// --- Create the Context object ---
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// --- Auth Provider Component ---
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false); 

    // Used on successful login (called from LoginScreen)
    const login = (userObject) => {
        // Here you might also store the user data/token in secure storage.
        setCurrentUser(userObject);
    };

    // Used for logging out (called from ProfileScreen)
    const logout = () => {
        setIsLoading(true);
        setCurrentUser(null);
        // Navigate back to login screen
        router.replace('/Authentication/Login');
        setIsLoading(false);
    };

    const value = {
        currentUser,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};