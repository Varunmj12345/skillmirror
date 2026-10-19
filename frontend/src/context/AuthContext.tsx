import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser, loginUser, logoutUser, verifyTwoFactor } from '../services/auth';
import { AuthUser, LoginCredentials, TwoFactorPayload } from '../types';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<AuthUser | null>;
    verify2FA: (data: TwoFactorPayload) => Promise<AuthUser | null>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const refreshUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser as AuthUser | null);
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

    const login = async (credentials: LoginCredentials) => {
        const res = await loginUser(credentials);
        if (res && !res['2fa_required']) {
            setUser(res as AuthUser);
        }
        return res as AuthUser;
    };

    const verify2FA = async (data: TwoFactorPayload) => {
        const loggedInUser = await verifyTwoFactor(data);
        setUser(loggedInUser as AuthUser);
        return loggedInUser as AuthUser;
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
