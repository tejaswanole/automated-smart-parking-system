import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getProfile, login as loginService, register as registerService, logout as logoutService } from "../services/authService";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin" | "owner" | "staff";
  wallet: {
    coins: number;
    transactions: Array<{
      type: "credit" | "debit";
      amount: number;
      description: string;
      timestamp: string;
    }>;
  };
  ownedParkings: string[];
  staffParking?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await getProfile();
          if (userData?.user) {
            setUser(userData.user);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginService({ email, password });
      const { user: userData, token } = response;
      
      localStorage.setItem('token', token);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      const response = await registerService(userData);
      const { user: newUser, token } = response;
      
      localStorage.setItem('token', token);
      setUser(newUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}