import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBars,
  faShoppingBag,
  faUser,
  faTimes,
  faHeart,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import SearchModal from "./SearchModal";
import LocationModal from "./LocationModal";
import AuthModal from "./AuthModal";
import authService from "../services/authService";
import { useCart } from "../context/CartContext";
import addressService from "../services/addressService";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartTotal } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [currentLocation, setCurrentLocation] = useState(
    "أبو ظبي, الإمارات العربية المتحدة"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      // Scroll to top when menu opens
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Load default location on mount
  useEffect(() => {
    const loadDefaultLocation = async () => {
      try {
        if (authService.isAuthenticated()) {
          const defaultAddr = await addressService.getOrCreateDefaultAddress();
          if (defaultAddr) {
            const locationText = defaultAddr.city
              ? `${defaultAddr.city}, ${
                  defaultAddr.country || "الإمارات العربية المتحدة"
                }`
              : "أبو ظبي, الإمارات العربية المتحدة";
            setCurrentLocation(locationText);
          }
        }
      } catch (error) {
        console.error("Error loading default location:", error);
      }
    };
    loadDefaultLocation();
  }, []);

  const toggleSearch = () => setSearchModalOpen(true);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleLocationModal = () => setLocationModalOpen(!locationModalOpen);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery("");
      }
    }
  };

  const handleLocationSelect = (selectedLocation) => {
    // Format the location text
    let locationText = selectedLocation;
    if (typeof selectedLocation === "string") {
      // If it's already a formatted string, use it
      locationText = selectedLocation;
    } else if (selectedLocation.city) {
      // If it's an object with city property
      locationText = `${selectedLocation.city}, ${
        selectedLocation.country || "الإمارات العربية المتحدة"
      }`;
    }
    setCurrentLocation(locationText);
    setLocationModalOpen(false);
  };

  const handleLanguageToggle = () => {
    setLanguage(language === "English" ? "العربية" : "English");
    // TODO: Implement language switching logic
  };

  return (
    <>
      <header
        className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}
        dir="rtl"
        role="banner"
      >
        <div className="navbar-container">
          {/* Right Section: Logo */}
          <div className="navbar-right">
            <div className="navbar-logo">
              <Link
                to="/"
                className="logo-link"
                aria-label="BuildingZ - الصفحة الرئيسية"
              >
                <img src="/assets/logo.png" alt="BuildingZ" className="navbar-logo-img" />
              </Link>
            </div>
          </div>

          {/* Links between logo and search */}
          <div className="navbar-center-links">
            <Link to="/services2" className="navbar-center-link">
              خدمات
            </Link>
            <Link to="/products" className="navbar-center-link">
              متجر
            </Link>
          </div>

          {/* Center Section: Search Bar */}
          <div className="navbar-center">
            <form className="navbar-search-form" onSubmit={handleSearchSubmit}>
              <div className="navbar-search-wrapper">
                <div className="search-divider"></div>
                <input
                  type="text"
                  className="navbar-search-input"
                  placeholder="ما الذي تبحث عنه؟"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  aria-label="البحث"
                />
                <button
                  type="submit"
                  className="search-submit-button"
                  aria-label="ابحث"
                  onClick={handleSearchSubmit}
                >
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>
            </form>
          </div>

          {/* Left Section: Location, Language, User, Cart & Favorites */}
          <div className="navbar-left">
            {/* Location Selector */}
            <button
              className="navbar-location-button"
              onClick={toggleLocationModal}
              aria-label="اختر موقع التوصيل"
            >
              <span className="location-label">توصيل إلى</span>
              <div className="location-info">
                <img
                  src="https://flagcdn.com/w40/ae.png"
                  alt="UAE Flag"
                  className="uae-flag"
                />
                <span className="location-text">{currentLocation}</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="location-chevron"
                />
              </div>
            </button>

            <div className="navbar-divider"></div>

            {/* Language Selector */}
            <button
              className="navbar-language-button"
              onClick={handleLanguageToggle}
              aria-label="اختر اللغة"
            >
              {language}
            </button>

            <div className="navbar-divider"></div>

            {/* User Account */}
            {authService.isAuthenticated() ? (
              <Link
                to="/profile"
                className="navbar-user-button"
                aria-label="الملف الشخصي"
              >
                <FontAwesomeIcon icon={faUser} />
                <span className="user-text">الملف الشخصي</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode("login");
                  setAuthModalOpen(true);
                }}
                className="navbar-user-button"
                aria-label="تسجيل الدخول"
              >
                <FontAwesomeIcon icon={faUser} />
                <span className="user-text">تسجيل الدخول</span>
              </button>
            )}

            <div className="navbar-divider"></div>

            {/* Cart & Favorites Icons */}
            <Link
              to="/favorites"
              className="navbar-icon-button"
              aria-label="المفضلة"
            >
              <FontAwesomeIcon icon={faHeart} />
            </Link>
            <Link
              to="/cart"
              className="navbar-icon-button cart-button"
              aria-label="سلة التسوق"
            >
              <FontAwesomeIcon icon={faShoppingBag} />
              {cartTotal.items > 0 && (
                <span className="cart-shopping">{cartTotal.items}</span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className={`mobile-menu-toggle ${mobileMenuOpen ? "active" : ""}`}
              onClick={toggleMobileMenu}
              aria-label="القائمة"
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>

        <div
          className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}
          role="navigation"
          aria-label="القائمة المحمولة"
        >
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
                aria-label="البحث"
              />
              <button
                className="mobile-search-button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
                aria-label="فتح البحث"
              >
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>

            <nav
              className="mobile-nav"
              role="navigation"
              aria-label="القائمة المحمولة"
            >
              <Link to="/" className="mobile-nav-link">
                الرئيسية
              </Link>
              <Link to="/services" className="mobile-nav-link">
                الخدمات
              </Link>
              <Link to="/products" className="mobile-nav-link">
                المتجر
              </Link>
              <Link to="/track-order" className="mobile-nav-link">
                تتبع الطلب
              </Link>
              <Link to="/about" className="mobile-nav-link">
                من نحن
              </Link>
              <Link to="/favorites" className="mobile-nav-link">
                المفضلة
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelectLocation={handleLocationSelect}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};

export default Navbar;
