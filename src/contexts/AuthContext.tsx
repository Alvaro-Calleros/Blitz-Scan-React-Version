
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfileImage: (imageUrl: string) => void;
  updateUserInfo: (name: string, email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user on app load
    const storedUser = localStorage.getItem('blitz_scan_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in real app, this would be an API call
    if (email && password) {
      const mockUser = {
        id: Math.random().toString(36),
        email,
        name: email.split('@')[0],
        profileImage: localStorage.getItem('blitz_scan_profile_image') || undefined
      };
      
      setUser(mockUser);
      localStorage.setItem('blitz_scan_user', JSON.stringify(mockUser));
      return true;
    }
    
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock registration
    if (email && password && name) {
      const mockUser = {
        id: Math.random().toString(36),
        email,
        name,
        profileImage: localStorage.getItem('blitz_scan_profile_image') || undefined
      };
      
      setUser(mockUser);
      localStorage.setItem('blitz_scan_user', JSON.stringify(mockUser));
      return true;
    }
    
    return false;
  };

  const updateProfileImage = (imageUrl: string) => {
    if (user) {
      const updatedUser = { ...user, profileImage: imageUrl };
      setUser(updatedUser);
      localStorage.setItem('blitz_scan_user', JSON.stringify(updatedUser));
      localStorage.setItem('blitz_scan_profile_image', imageUrl);
    }
  };

  const updateUserInfo = (name: string, email: string) => {
    if (user) {
      const updatedUser = { ...user, name, email };
      setUser(updatedUser);
      localStorage.setItem('blitz_scan_user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('blitz_scan_user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    updateProfileImage,
    updateUserInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
