import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./App.css";
import Navbar from "./components/Navbar";
import HomePage from './pages/Home/HomePage';
import ServicesPage from './pages/Services/ServicesPage';
import ProductsPage from './pages/Products/ProductsPage';
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
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;
