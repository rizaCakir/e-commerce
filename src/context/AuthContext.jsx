import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 AuthProvider: Initializing auth...');
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        console.log('🔍 AuthProvider: Token exists:', !!token);
        console.log('🔍 AuthProvider: UserData exists:', !!userData);
        
        if (token && userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            console.log('🔍 AuthProvider: Setting user data:', parsedUserData);
            setUser(parsedUserData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } catch (parseError) {
            console.error('❌ AuthProvider: Error parsing user data:', parseError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
          }
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } catch (error) {
        console.error('❌ AuthProvider: Initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        console.log('🔍 AuthProvider: Setting loading to false');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    console.log('🔍 AuthProvider: Attempting login...');
    try {
      const response = await axios.post('http://localhost:5260/api/User/login', {
        email,
        password
      });

      const { token, ...userData } = response.data;
      
      // Clean up user data by removing any special characters from keys
      const cleanUserData = Object.entries(userData).reduce((acc, [key, value]) => {
        const cleanKey = key.replace('$', '');
        acc[cleanKey] = value;
        return acc;
      }, {});

      console.log('🔍 AuthProvider: Login successful, cleaned user data:', cleanUserData);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(cleanUserData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(cleanUserData);
      return { success: true };
    } catch (error) {
      console.error('❌ AuthProvider: Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Giriş yapılırken bir hata oluştu' 
      };
    }
  };

  const register = async (userData) => {
    console.log('🔍 AuthProvider: Attempting registration...');
    try {
      const response = await axios.post('http://localhost:5260/api/User', {
        name: userData.name,
        email: userData.email,
        studentId: userData.studentId,
        password: userData.password
      });
      
      console.log('🔍 AuthProvider: Registration successful');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ AuthProvider: Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Kayıt olurken bir hata oluştu' 
      };
    }
  };

  const logout = () => {
    console.log('🔍 AuthProvider: Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  console.log('🔍 AuthProvider: Current state:', { user, loading, isAuthenticated: !!user });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    console.error('❌ useAuth: Context is null - AuthProvider might be missing');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 