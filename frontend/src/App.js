/**
 * HabitaPlot - Main App Component
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ListingDetailPage from './pages/ListingDetailPage';
import PaymentPage from './pages/PaymentPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import TransactionReceiptPage from './pages/TransactionReceiptPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Services
import { authService } from './services/authService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        setIsAuthenticated(true);
        const user = authService.getStoredUser();
        setCurrentUser(user);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          user={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onRegister={handleLogin} />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <DashboardPage user={currentUser} />
                </ProtectedRoute>
              } 
            />

            <Route
              path="/payment"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/transactions"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <TransactionHistoryPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/transactions/:id"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <TransactionReceiptPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />

        {/* Toast Notifications */}
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
