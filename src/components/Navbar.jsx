import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import authService from "../services/authService";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication status on component mount
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="auth-buttons">
            {user ? (
              <div className="user-profile-section">
                <Link to="/profile" className="user-profile-link">
                  <i className="fas fa-user"></i>
                  {user.name}
                </Link>
                <button 
                  className="logout-btn" 
                  onClick={handleLogout}
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <>
                <Link to="/signup" className="signup-btn">إنشاء حساب</Link>
                <Link to="/login" className="login-btn">تسجيل الدخول</Link>
              </>
            )}
          </div>
          
          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActive("/")}`}>الرئيسية</Link>
            <Link to="/services" className={`nav-link ${isActive("/services")}`}>الخدمات</Link>
            <Link to="/products" className={`nav-link ${isActive("/products")}`}>المتجر</Link>
            <Link to="/providers" className={`nav-link ${isActive("/providers")}`}>مقدمي الخدمات</Link>
            <Link to="/quotes" className={`nav-link ${isActive("/quotes")}`}>عروض الأسعار</Link>
            {user && user.role === 'admin' && (
              <Link to="/admin" className={`nav-link ${isActive("/admin")}`}>لوحة التحكم</Link>
            )}
          </div>
          
          <div className="brand">
            <Link to="/" className="brand-link">BuildingZ</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
