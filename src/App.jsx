import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import HomePage from './pages/Home/HomePage';
import AboutPage from './pages/About/AboutPage';
import ServicesPage2 from './pages/Services2/ServicesPage2';
import CategoryPage from './pages/Services2/CategoryPage';
import CategoryDetailPage from './pages/Services2/CategoryDetailPage';
import ServiceDetailPage from './pages/Services2/ServiceDetailPage';
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
import ContactPage from './pages/Contact/ContactPage';
import HelpPage from './pages/Help/HelpPage';
import TermsPage from './pages/Terms/TermsPage';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import SearchPage from './pages/Search/SearchPage';
import PaymentSuccessPage from './pages/Payment/PaymentSuccessPage';
import PaymentFailurePage from './pages/Payment/PaymentFailurePage';
import NotificationsPage from './pages/Notifications/NotificationsPage';

// Components
import Navbar from './components/Navbar';
import LocationSelector from './components/LocationSelector';
import SearchModal from './components/SearchModal';
import CartProvider from './context/CartContext';
import FloatingCart from './components/FloatingCart';

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="app">
          <Navbar />
          <LocationSelector />
          <SearchModal />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage2 />} />
            <Route path="/services2" element={<ServicesPage2 />} />
            <Route path="/services2/categories" element={<CategoryPage />} />
            <Route path="/services2/categories/:id" element={<CategoryDetailPage />} />
            <Route path="/services2/:id" element={<ServiceDetailPage />} />
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
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/failure" element={<PaymentFailurePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
          <FloatingCart />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
