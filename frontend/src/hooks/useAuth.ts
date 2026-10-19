import { useAuth as useAuthContext } from '../context/AuthContext';

/**
 * Standardized useAuth hook bridging directly to the global AuthProvider context.
 * Ensures consistent reactive user state across all components and navigation bars.
 */
const useAuth = () => {
    return useAuthContext();
};

export default useAuth;
export { useAuth };