import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loginUser, logoutUser, getCurrentUser } from '../services/auth';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = async (credentials: { email: string; password: string }) => {
        const loggedInUser = await loginUser(credentials);
        setUser(loggedInUser);
        router.push('/dashboard');
        return loggedInUser;
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
        router.push('/');
    };

    return { user, loading, login, logout };
};

export default useAuth;