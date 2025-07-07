import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "./App.css";
import Navbar from "./components/Navbar";
import HomePage from './pages/Home/HomePage';
import ServicesPage from './pages/Services/ServicesPage';
import ProductsPage from './pages/Products/ProductsPage';
import SearchPage from './pages/Search/SearchPage';
import AdminPage from './pages/Admin/AdminPage';
import LoginPage from './pages/Auth/Login/LoginPage';
import SignupPage from './pages/Auth/Signup/SignupPage';
import ProfilePage from './pages/Profile/ProfilePage';
import authService from './services/authService';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && (!user || user.role !== 'admin')) {
    // Redirect to home if not an admin
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:productId" element={<ProductsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
