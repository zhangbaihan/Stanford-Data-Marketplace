// This is a global state where any component can access auth info

import {createContext, useState, useEffect, useContext} from 'react';
import api from '../api/axios';

// Components can "subscribe" to this context and get its values
const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    // prevents flash of wrong content while checking auth status
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Call backend to check if user is logged in
                const response = await api.get('/auth/me');

                if (response.data.isAuthenticated) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuthStatus();
    }, []);

    const login = () => {
        // This navigates the browser to our backend, who then redirects to Google.
        // Hardcoded, need to change
        window.location.href = 'http://localhost:5001/auth/google';
    };

    const logout = async () => {
        try {
            await api.get('/auth/logout');
            setUser(null);
            window.location.href = '/'
        } catch (error) {
            console.error('Error loggin out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{user, loading, login, logout, setUser}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};