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
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <span className="brand-name">BuildingZ</span>
        </Link>
      </div>
      <div className="navbar-menu">
        <Link to="/" className={`navbar-item ${isActive("/")}`}>
          الرئيسية
        </Link>
        <Link to="/services" className={`navbar-item ${isActive("/services")}`}>
          حاسبة التكاليف
        </Link>
        <Link to="/providers" className={`navbar-item ${isActive("/providers")}`}>
          مقدمي الخدمات
        </Link>
        <Link to="/quotes" className={`navbar-item ${isActive("/quotes")}`}>
          عروض الأسعار
        </Link>
      </div>
      <div className="navbar-auth">
        <Link to="/login" className="login-btn">
          تسجيل الدخول
        </Link>
        <Link to="/signup" className="register-btn">
          إنشاء حساب
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
