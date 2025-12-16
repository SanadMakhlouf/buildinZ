import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faBars, 
  faShoppingBag, 
  faUser,
  faTimes,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import SearchModal from './SearchModal';
import authService from '../services/authService';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const location = useLocation();
  const { cartTotal } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleSearch = () => setSearchModalOpen(true);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} dir="rtl">
        <div className="navbar-container">
          <div className="navbar-logo">
            <Link to="/" className="logo-link">
              <img src="/logo.png" alt="BuildingZ Logo" className="logo-image" />
            </Link>
          </div>

          <nav className="navbar-nav">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>الرئيسية</Link>
            <Link to="/services" className={`nav-link ${location.pathname === '/services' || location.pathname.includes('/services2') ? 'active' : ''}`}>الخدمات</Link>
            <Link to="/products" className={`nav-link ${location.pathname.includes('/products') ? 'active' : ''}`}>المتجر</Link>
            <Link to="/track-order" className={`nav-link ${location.pathname.includes('/track-order') ? 'active' : ''}`}>تتبع الطلب</Link>
            <Link to="/about" className={`nav-link ${location.pathname.includes('/about') ? 'active' : ''}`}>من نحن</Link>
          </nav>

          <div className="navbar-actions">
            <button className="action-button search-toggle" onClick={toggleSearch}>
              <FontAwesomeIcon icon={faSearch} />
            </button>
            <Link to="/favorites" className="action-button">
              <FontAwesomeIcon icon={faHeart} />
            </Link>
            <Link to="/cart" className="action-button cart-button">
              <FontAwesomeIcon icon={faShoppingBag} />
              {cartTotal.items > 0 && (
                <span className="cart-badge">{cartTotal.items}</span>
              )}
            </Link>
            <Link 
              to={authService.isAuthenticated() ? "/profile" : "/login"} 
              className="action-button profile-button"
            >
              <FontAwesomeIcon icon={faUser} />
            </Link>
            <button 
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>

        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-container">
            <div className="mobile-search">
              <input 
                type="text" 
                placeholder="ابحث..." 
                className="mobile-search-input"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
                readOnly
              />
              <button 
                className="mobile-search-button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
              >
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>

            <nav className="mobile-nav">
              <Link to="/" className="mobile-nav-link">الرئيسية</Link>
              <Link to="/services" className="mobile-nav-link">الخدمات</Link>
              <Link to="/products" className="mobile-nav-link">المتجر</Link>
              <Link to="/track-order" className="mobile-nav-link">تتبع الطلب</Link>
              <Link to="/about" className="mobile-nav-link">من نحن</Link>
              <Link to="/favorites" className="mobile-nav-link">المفضلة</Link>
            </nav>
          </div>
        </div>
      </header>

      <SearchModal 
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
