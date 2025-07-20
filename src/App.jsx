import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import HomePage from './pages/Home/HomePage';
import AboutPage from './pages/About/AboutPage';
import ServicesPage from './pages/Services/ServicesPage';
import ServicesPage2 from './pages/Services2/ServicesPage2';
import ProductsPage from './pages/Products/ProductsPage';
import ProductDetailPage from './pages/Products/ProductDetailPage';
import ProfilePage from './pages/Profile/ProfilePage';
import LoginPage from './pages/Auth/Login/LoginPage';
import SignupPage from './pages/Auth/Signup/SignupPage';
import ForgotPassword from './pages/Auth/Login/ForgotPassword';
import ResetPassword from './pages/Auth/Login/ResetPassword';
import AdminPage from './pages/Admin/AdminPage';
import FAQPage from './pages/FAQ/FAQPage';
import PrivacyPage from './pages/Privacy/PrivacyPage';
import CartPage from './pages/Cart/CartPage';
import SearchPage from './pages/Search/SearchPage';

// Components
import Navbar from './components/Navbar';
import LocationSelector from './components/LocationSelector';
import SearchModal from './components/SearchModal';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <LocationSelector />
        <SearchModal />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services2" element={<ServicesPage2 />} />
          <Route path="/services2/:categoryId" element={<ServicesPage2 />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
