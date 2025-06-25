import React from "react";
import "../styles/Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-name">Buildingz</span>
        <span className="brand-marketplace">Marketplace</span>
      </div>
      <div className="navbar-menu">
        <a href="#" className="navbar-item">
          الرئيسية
        </a>
        <a href="#" className="navbar-item">
          الخدمات
        </a>
        <a href="#" className="navbar-item">
          مقدمي الخدمات
        </a>
        <a href="#" className="navbar-item">
          عروض الأسعار
        </a>
        <a href="#" className="navbar-item">
          لوحة التحكم
        </a>
      </div>
      <div className="navbar-auth">
        <a href="#" className="login-btn">
          تسجيل الدخول
        </a>
        <a href="#" className="register-btn">
          إنشاء حساب
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
