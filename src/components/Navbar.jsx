import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faBars, 
  faLocationDot, 
  faBell, 
  faShoppingBag, 
  faUser,
  faTimes,
  faHome,
  faStore,
  faTools,
  faQuestionCircle,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import LocationModal from './LocationModal';
import SearchModal from './SearchModal';
import { getDefaultAddress } from '../utils/addressUtils';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount] = useState(3);
  const [cartCount] = useState(2);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("دبي");

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Load default address
  useEffect(() => {
    const defaultAddress = getDefaultAddress();
    if (defaultAddress) {
      setCurrentLocation(defaultAddress.displayAddress || defaultAddress.formatted_address || "دبي");
    }
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleSearch = () => {
    setSearchModalOpen(true);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const openLocationModal = () => {
    setLocationModalOpen(true);
  };

  const handleLocationSelect = (selectedLocation) => {
    setCurrentLocation(selectedLocation);
  };

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} dir="rtl">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo">
            <Link to="/" className="logo-link">
              <div className="logo-icon">
                <span className="logo-letter">ب</span>
              </div>
              <span className="logo-text">بيلدينغ زد</span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="navbar-nav">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              <span className="nav-text">الرئيسية</span>
            </Link>
            <Link to="/services" className={`nav-link ${location.pathname.includes('/services') ? 'active' : ''}`}>
              <span className="nav-text">الخدمات</span>
            </Link>
            <Link to="/products" className={`nav-link ${location.pathname.includes('/products') ? 'active' : ''}`}>
              <span className="nav-text">المتجر</span>
            </Link>
            <Link to="/about" className={`nav-link ${location.pathname.includes('/about') ? 'active' : ''}`}>
              <span className="nav-text">من نحن</span>
            </Link>
          </nav>

          {/* Right Section - Actions */}
          <div className="navbar-actions">
            {/* Search */}
            <div className={`search-wrapper ${searchActive ? 'active' : ''}`}>
              <button className="action-button search-toggle" onClick={toggleSearch}>
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>

            {/* Location */}
            <button className="action-button location-button" onClick={openLocationModal}>
              <FontAwesomeIcon icon={faLocationDot} />
              <span className="action-label">{currentLocation}</span>
            </button>

            {/* Notifications */}
            <div className="notification-wrapper">
              <button className="action-button">
                <FontAwesomeIcon icon={faBell} />
                {notificationCount > 0 && (
                  <span className="notification-badge">{notificationCount}</span>
                )}
              </button>
            </div>

            {/* Cart */}
            <div className="cart-wrapper">
              <Link to="/cart" className="action-button">
                <FontAwesomeIcon icon={faShoppingBag} />
                {cartCount > 0 && (
                  <span className="notification-badge">{cartCount}</span>
                )}
              </Link>
            </div>

            {/* User Profile */}
            <div className="profile-wrapper">
              <Link to="/profile" className="action-button profile-button">
                <FontAwesomeIcon icon={faUser} />
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-container">
            {/* Mobile Search */}
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

            {/* Mobile Navigation Links */}
            <nav className="mobile-nav">
              <Link to="/" className="mobile-nav-link">
                <FontAwesomeIcon icon={faHome} />
                <span>الرئيسية</span>
              </Link>
              <Link to="/services" className="mobile-nav-link">
                <FontAwesomeIcon icon={faTools} />
                <span>الخدمات</span>
              </Link>
              <Link to="/products" className="mobile-nav-link">
                <FontAwesomeIcon icon={faStore} />
                <span>المتجر</span>
              </Link>
              <Link to="/favorites" className="mobile-nav-link">
                <FontAwesomeIcon icon={faHeart} />
                <span>المفضلة</span>
              </Link>
              <Link to="/help" className="mobile-nav-link">
                <FontAwesomeIcon icon={faQuestionCircle} />
                <span>المساعدة</span>
              </Link>
            </nav>

            {/* Mobile User Actions */}
            <div className="mobile-user-actions">
              <Link to="/profile" className="mobile-user-button">
                <FontAwesomeIcon icon={faUser} />
                <span>حسابي</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Location Modal */}
      <LocationModal 
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelectLocation={handleLocationSelect}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
