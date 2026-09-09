import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../services/authApi';
import type { PasswordChange, User, UserLogin } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  sessionExpired: boolean;
  login: (credentials: UserLogin) => Promise<User>;
  logout: () => void;
  changePassword: (passwords: PasswordChange) => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const logout = () => {
    sessionStorage.removeItem('upserve.accessToken');
    setUser(null);
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      setSessionExpired(Boolean(sessionStorage.getItem('upserve.accessToken')));
      logout();
    };
    window.addEventListener('upserve:unauthorized', handleUnauthorized);

    const token = sessionStorage.getItem('upserve.accessToken');
    if (!token) {
      setLoading(false);
      return () => window.removeEventListener('upserve:unauthorized', handleUnauthorized);
    }

    authApi.me()
      .then(setUser)
      .catch(logout)
      .finally(() => setLoading(false));

    return () => window.removeEventListener('upserve:unauthorized', handleUnauthorized);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    sessionExpired,
    logout,
    login: async (credentials) => {
      const response = await authApi.login(credentials);
      sessionStorage.setItem('upserve.accessToken', response.access_token);
      setSessionExpired(false);
      setUser(response.user);
      return response.user;
    },
    changePassword: async (passwords) => {
      await authApi.changePassword(passwords);
      sessionStorage.removeItem('upserve.accessToken');
      setUser(null);
    },
    updateUser: (updatedUser) => setUser(updatedUser),
  }), [loading, sessionExpired, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
