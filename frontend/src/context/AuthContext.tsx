import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser, loginUser, logoutUser, verifyTwoFactor } from '../services/auth';

interface AuthContextType {
    user: any;
    loading: boolean;
    login: (credentials: any) => Promise<any>;
    verify2FA: (data: any) => Promise<any>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const refreshUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const login = async (credentials: any) => {
        const res = await loginUser(credentials);
        if (res && !res['2fa_required']) {
            setUser(res);
        }
        return res;
    };

    const verify2FA = async (data: any) => {
        const loggedInUser = await verifyTwoFactor(data);
        setUser(loggedInUser);
        return loggedInUser;
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, verify2FA, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
