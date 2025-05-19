
import React, { createContext, useContext, useState } from 'react';

interface User {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    displayName: 'Demo User',
    email: 'demo@example.com',
    photoURL: null,
    uid: '123456',
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = async (email: string, password: string) => {
    // Mock login functionality
    setUser({
      displayName: 'Demo User',
      email: email,
      photoURL: null,
      uid: '123456',
    });
    setIsAuthenticated(true);
  };

  const logout = async () => {
    // Mock logout functionality
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
