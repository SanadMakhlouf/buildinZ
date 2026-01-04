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
import AuthModal from "./AuthModal";
import authService from "../services/authService";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartTotal } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("ar"); // "ar" for Arabic (UAE), "en" for English (USA)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

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

  const toggleSearch = () => setSearchModalOpen(true);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

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

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setLanguageMenuOpen(false);
    // TODO: Implement language switching logic
  };

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageMenuOpen &&
        !event.target.closest(".navbar-language-dropdown")
      ) {
        setLanguageMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [languageMenuOpen]);

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
                <img
                  src="/assets/logo.png"
                  alt="BuildingZ"
                  className="navbar-logo-img"
                />
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

          {/* Left Section: Language Flag, User, Cart & Favorites */}
          <div className="navbar-left">
            {/* Language Flag Selector */}
            <div className="navbar-language-dropdown">
              <button
                className="navbar-language-flag-button"
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                aria-label="اختر اللغة"
              >
                <img
                  src={
                    language === "ar"
                      ? "https://flagcdn.com/w40/ae.png"
                      : "https://flagcdn.com/w40/us.png"
                  }
                  alt={language === "ar" ? "UAE Flag" : "USA Flag"}
                  className="language-flag"
                />
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`language-chevron ${
                    languageMenuOpen ? "open" : ""
                  }`}
                />
              </button>
              {languageMenuOpen && (
                <div className="language-dropdown-menu">
                  <button
                    className={`language-option ${
                      language === "ar" ? "active" : ""
                    }`}
                    onClick={() => handleLanguageSelect("ar")}
                  >
                    <img
                      src="https://flagcdn.com/w40/ae.png"
                      alt="UAE Flag"
                      className="language-flag-small"
                    />
                    <span>العربية</span>
                  </button>
                  <button
                    className={`language-option ${
                      language === "en" ? "active" : ""
                    }`}
                    onClick={() => handleLanguageSelect("en")}
                  >
                    <img
                      src="https://flagcdn.com/w40/us.png"
                      alt="USA Flag"
                      className="language-flag-small"
                    />
                    <span>English</span>
                  </button>
                </div>
              )}
            </div>

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
            <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
              <div className="mobile-search">
                <input
                  type="text"
                  placeholder="ما الذي تبحث عنه؟"
                  className="mobile-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  aria-label="البحث"
                />
                <button
                  type="submit"
                  className="mobile-search-button"
                  aria-label="ابحث"
                  onClick={handleSearchSubmit}
                >
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>
            </form>

            {/* Language Selector in Mobile Menu */}
            <div className="mobile-language-selector">
              <div className="mobile-language-label">اختر اللغة</div>
              <div className="mobile-language-options">
                <button
                  className={`mobile-language-option ${
                    language === "ar" ? "active" : ""
                  }`}
                  onClick={() => {
                    handleLanguageSelect("ar");
                    setMobileMenuOpen(false);
                  }}
                >
                  <img
                    src="https://flagcdn.com/w40/ae.png"
                    alt="UAE Flag"
                    className="mobile-language-flag"
                  />
                  <span>العربية</span>
                </button>
                <button
                  className={`mobile-language-option ${
                    language === "en" ? "active" : ""
                  }`}
                  onClick={() => {
                    handleLanguageSelect("en");
                    setMobileMenuOpen(false);
                  }}
                >
                  <img
                    src="https://flagcdn.com/w40/us.png"
                    alt="USA Flag"
                    className="mobile-language-flag"
                  />
                  <span>English</span>
                </button>
              </div>
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

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};

export default Navbar;
