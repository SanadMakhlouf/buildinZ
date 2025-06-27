import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import "./App.css";
import Navbar from "./components/Navbar";
import HomePage from './pages/Home/HomePage';
import ServicesPage from './pages/Services/ServicesPage';
import AdminPage from './pages/Admin/AdminPage';
import LoginPage from './pages/Auth/Login/LoginPage';
import SignupPage from './pages/Auth/Signup/SignupPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
        
        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-links">
            <Link to="/" className="footer-link">الرئيسية</Link>
            <Link to="/services" className="footer-link">الخدمات</Link>
            <Link to="/admin" className="footer-link">لوحة التحكم</Link>
            <Link to="/login" className="footer-link">تسجيل الدخول</Link>
            <Link to="/signup" className="footer-link">إنشاء حساب</Link>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} BuildingZ - جميع الحقوق محفوظة
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
