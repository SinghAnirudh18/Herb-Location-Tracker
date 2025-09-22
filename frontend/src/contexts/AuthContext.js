import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, handleAPIError, handleAPISuccess } from '../services/api';
import websocketService from '../services/websocket';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const userData = await authAPI.getProfile();
          setUser(userData);
          
          // Connect to WebSocket for real-time updates
          websocketService.connect(token);
          
          // Subscribe to user-specific updates
          websocketService.subscribeToUserUpdates((notification) => {
            // Handle real-time notifications
            console.log('Real-time notification:', notification);
          });
          
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
    
    // Cleanup WebSocket on unmount
    return () => {
      websocketService.disconnect();
    };
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token: newToken, user: userData } = response;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      // Connect to WebSocket
      websocketService.connect(newToken);
      
      toast.success(`Welcome back, ${userData.name}! 🌿`);
      return { success: true };
    } catch (error) {
      return handleAPIError(error, 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token: newToken, user: newUser } = response;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      // Connect to WebSocket
      websocketService.connect(newToken);
      
      toast.success(`Welcome to HerbTrace, ${newUser.name}! 🎉`);
      return { success: true };
    } catch (error) {
      return handleAPIError(error, 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    
    // Disconnect WebSocket
    websocketService.disconnect();
    
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authAPI.updateProfile(profileData);
      setUser(updatedUser);
      return handleAPISuccess(updatedUser, 'Profile updated successfully! ✨');
    } catch (error) {
      return handleAPIError(error, 'Profile update failed');
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      return handleAPISuccess(null, 'Password changed successfully! 🔒');
    } catch (error) {
      return handleAPIError(error, 'Password change failed');
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isRole: (role) => user?.role === role,
    hasPermission: (permission) => {
      // Define role-based permissions
      const permissions = {
        farmer: ['create_collection', 'view_own_batches'],
        processor: ['create_processing', 'view_processing', 'update_processing'],
        lab: ['create_quality_test', 'view_quality_tests', 'update_quality_test'],
        manufacturer: ['create_product', 'view_products'],
        consumer: ['view_public_data', 'scan_qr'],
        regulator: ['verify_batch', 'view_all_data', 'manage_compliance'],
      };
      
      return permissions[user?.role]?.includes(permission) || false;
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
