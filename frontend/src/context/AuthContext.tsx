import React, { createContext, useContext, useState } from 'react';

export interface UserSession {
  email: string;
  role: 'PARENT' | 'MENTOR' | 'ADMIN';
  name?: string;
}

interface AuthContextType {
  user: UserSession | null;
  login: (email: string, role: 'PARENT' | 'MENTOR' | 'ADMIN', name?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem('trialflow_user');
      if (stored) return JSON.parse(stored);
      // Default demo logged-in user so user can see and test Logout immediately!
      return {
        email: 'sarah.jenkins@example.com',
        role: 'PARENT',
        name: 'Sarah Jenkins',
      };
    } catch {
      return null;
    }
  });

  const login = (email: string, role: 'PARENT' | 'MENTOR' | 'ADMIN', name?: string) => {
    const session: UserSession = {
      email,
      role,
      name: name || email.split('@')[0],
    };
    setUser(session);
    localStorage.setItem('trialflow_user', JSON.stringify(session));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('trialflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
