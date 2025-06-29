import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="auth-buttons">
            <Link to="/signup" className="signup-btn">إنشاء حساب</Link>
            <Link to="/login" className="login-btn">تسجيل الدخول</Link>
          </div>
          
          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActive("/")}`}>الرئيسية</Link>
            <Link to="/services" className={`nav-link ${isActive("/services")}`}>الخدمات</Link>
            <Link to="/products" className={`nav-link ${isActive("/products")}`}>المتجر</Link>
            <Link to="/providers" className={`nav-link ${isActive("/providers")}`}>مقدمي الخدمات</Link>
            <Link to="/quotes" className={`nav-link ${isActive("/quotes")}`}>عروض الأسعار</Link>
            <Link to="/admin" className={`nav-link ${isActive("/admin")}`}>لوحة التحكم</Link>
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
