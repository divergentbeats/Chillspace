import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Check localStorage for saved user data
    const saved = localStorage.getItem('chillspace-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Save user data to localStorage
    if (user) {
      localStorage.setItem('chillspace-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('chillspace-user');
    }
  }, [user]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simple validation - in real app, this would be an API call
      if (email && password) {
        const userData = {
          id: Date.now().toString(),
          email,
          name: email.split('@')[0],
          createdAt: new Date().toISOString()
        };
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email, password, confirmPassword) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validation
      if (!email || !password || !confirmPassword) {
        return { success: false, error: 'All fields are required' };
      }

      if (password !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Check if user already exists (in real app, this would be server-side)
      const existingUsers = JSON.parse(localStorage.getItem('chillspace-users') || '[]');
      if (existingUsers.some(u => u.email === email)) {
        return { success: false, error: 'User already exists' };
      }

      const userData = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
      };

      // Save to "database" (localStorage)
      existingUsers.push({ ...userData, password }); // In real app, never store plain password
      localStorage.setItem('chillspace-users', JSON.stringify(existingUsers));

      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
