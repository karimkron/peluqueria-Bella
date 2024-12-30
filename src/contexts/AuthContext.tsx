import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-hot-toast';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading] = useState(false);

  const login = async (email: string, password: string) => {
    if (email === import.meta.env.VITE_ADMIN_EMAIL && 
      password === import.meta.env.VITE_ADMIN_PASSWORD) {
    setUser({ email });
    toast.success('Inicio de sesión exitoso');
  } else {
    toast.error('Credenciales incorrectas');
    throw new Error('Invalid credentials');
  }
  };

  const logout = async () => {
    setUser(null);
    toast.success('Sesión cerrada');
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}