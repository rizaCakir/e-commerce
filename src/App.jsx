import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AuctionDetail from './pages/AuctionDetail';
import Profile from './pages/Profile';
import ItemList from './pages/ItemList';
import Navbar from './components/Navbar';
import SellItem from './pages/SellItem';
import YourItems from './pages/YourItems';
import BoughtItems from './pages/BoughtItems';
import ItemDetail from './pages/ItemDetail';
import SearchPage from './pages/SearchPage';
import UserProfile from './pages/UserProfile';
import YourItemDetail from './pages/YourItemDetail';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  console.log('🔍 ProtectedRoute: Current state:', { user, loading });

  if (loading) {
    console.log('🔍 ProtectedRoute: Loading state, showing spinner');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    console.log('🔍 ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  console.log('🔍 ProtectedRoute: User authenticated, rendering children');
  return children;
};

// Public Route component - only for non-authenticated users
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// AppRoutes component
const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items"
            element={
              <ProtectedRoute>
                <ItemList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auction/:id"
            element={
              <ProtectedRoute>
                <AuctionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/item/:id"
            element={
              <ProtectedRoute>
                <ItemDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sell"
            element={
              <ProtectedRoute>
                <SellItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/your-items"
            element={
              <ProtectedRoute>
                <YourItems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bought-items"
            element={
              <ProtectedRoute>
                <BoughtItems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/your-item/:id"
            element={
              <ProtectedRoute>
                <YourItemDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ApiProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </ApiProvider>
      </AuthProvider>
    </Router>
  );
};

export default App; 