import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faTimes, 
  faStore, 
  faTools, 
  faHistory,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import '../styles/SearchModal.css';
import { Link } from 'react-router-dom';

const PLACEHOLDER_ICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwcHgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iIzk5OTk5OSI+SWNvbjwvdGV4dD48L3N2Zz4=';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'products', 'services'
  
  const modalRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const savedSearches = localStorage.getItem('recentSearches');
        if (savedSearches) {
          setRecentSearches(JSON.parse(savedSearches).slice(0, 5));
        }
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
      
      // Focus search input when modal opens
      if (searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current.focus();
        }, 100);
      }
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    // Save to recent searches
    saveRecentSearch(searchQuery);
    
    // Simulate search API call
    setIsLoading(true);
    setTimeout(() => {
      // Mock results based on the active tab
      let results = [];
      
      if (activeTab === 'all' || activeTab === 'products') {
        results = [
          ...results,
          {
            id: 'p1',
            type: 'product',
            name: 'أدوات كهربائية',
            image: PLACEHOLDER_ICON,
            price: '١٥٠ درهم',
            category: 'أدوات'
          },
          {
            id: 'p2',
            type: 'product',
            name: 'معدات بناء',
            image: PLACEHOLDER_ICON,
            price: '٣٠٠ درهم',
            category: 'معدات'
          }
        ];
      }
      
      if (activeTab === 'all' || activeTab === 'services') {
        results = [
          ...results,
          {
            id: 's1',
            type: 'service',
            name: 'خدمات صيانة',
            image: PLACEHOLDER_ICON,
            rating: 4.5,
            category: 'صيانة'
          },
          {
            id: 's2',
            type: 'service',
            name: 'خدمات تنظيف',
            image: PLACEHOLDER_ICON,
            rating: 4.2,
            category: 'تنظيف'
          }
        ];
      }
      
      setSearchResults(results);
      setIsLoading(false);
    }, 500);
  };

  // Save search query to recent searches
  const saveRecentSearch = (query) => {
    try {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;
      
      // Get existing searches or initialize empty array
      const existingSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      
      // Remove this query if it exists already (to avoid duplicates)
      const filteredSearches = existingSearches.filter(
        search => search.toLowerCase() !== trimmedQuery.toLowerCase()
      );
      
      // Add new search to the beginning
      const updatedSearches = [trimmedQuery, ...filteredSearches].slice(0, 10);
      
      // Save back to localStorage
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      
      // Update state
      setRecentSearches(updatedSearches.slice(0, 5));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  // Clear a specific recent search
  const clearRecentSearch = (index) => {
    try {
      const updatedSearches = [...recentSearches];
      updatedSearches.splice(index, 1);
      
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error('Error clearing recent search:', error);
    }
  };

  // Clear all recent searches
  const clearAllRecentSearches = () => {
    try {
      localStorage.setItem('recentSearches', JSON.stringify([]));
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing all recent searches:', error);
    }
  };

  // Use a recent search (renamed from useRecentSearch)
  const handleRecentSearch = (query) => {
    setSearchQuery(query);
    // Move this search to the top
    saveRecentSearch(query);
    
    // Trigger search
    setIsLoading(true);
    setTimeout(() => {
      // Similar mock results as handleSearch
      setSearchResults([
        {
          id: 'p1',
          type: 'product',
          name: 'أدوات كهربائية',
          image: PLACEHOLDER_ICON,
          price: '١٥٠ درهم',
          category: 'أدوات'
        },
        {
          id: 's1',
          type: 'service',
          name: 'خدمات صيانة',
          image: PLACEHOLDER_ICON,
          rating: 4.5,
          category: 'صيانة'
        }
      ]);
      setIsLoading(false);
    }, 500);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    if (searchQuery.trim()) {
      // Re-run search with new tab filter
      setIsLoading(true);
      setTimeout(() => {
        // Filter results based on the selected tab
        let results = [];
        
        if (tab === 'all' || tab === 'products') {
          results = [
            ...results,
            {
              id: 'p1',
              type: 'product',
              name: 'أدوات كهربائية',
              image: PLACEHOLDER_ICON,
              price: '١٥٠ درهم',
              category: 'أدوات'
            },
            {
              id: 'p2',
              type: 'product',
              name: 'معدات بناء',
              image: PLACEHOLDER_ICON,
              price: '٣٠٠ درهم',
              category: 'معدات'
            }
          ];
        }
        
        if (tab === 'all' || tab === 'services') {
          results = [
            ...results,
            {
              id: 's1',
              type: 'service',
              name: 'خدمات صيانة',
              image: PLACEHOLDER_ICON,
              rating: 4.5,
              category: 'صيانة'
            },
            {
              id: 's2',
              type: 'service',
              name: 'خدمات تنظيف',
              image: PLACEHOLDER_ICON,
              rating: 4.2,
              category: 'تنظيف'
            }
          ];
        }
        
        setSearchResults(tab === 'all' ? results : results.filter(item => 
          (tab === 'products' && item.type === 'product') || 
          (tab === 'services' && item.type === 'service')
        ));
        setIsLoading(false);
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay">
      <div className="search-modal" ref={modalRef}>
        <div className="search-modal-header">
          <div className="search-modal-back" onClick={onClose}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
          <form className="search-modal-form" onSubmit={handleSearch}>
            <FontAwesomeIcon icon={faSearch} className="search-modal-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="search-modal-input"
              placeholder="ابحث عن منتجات، خدمات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button 
                type="button"
                className="search-modal-clear"
                onClick={() => setSearchQuery('')}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
            <button type="submit" className="search-modal-submit">
              بحث
            </button>
          </form>
        </div>
        
        <div className="search-modal-tabs">
          <button 
            className={`search-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            الكل
          </button>
          <button 
            className={`search-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => handleTabChange('products')}
          >
            <FontAwesomeIcon icon={faStore} />
            <span>المنتجات</span>
          </button>
          <button 
            className={`search-tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => handleTabChange('services')}
          >
            <FontAwesomeIcon icon={faTools} />
            <span>الخدمات</span>
          </button>
        </div>
        
        <div className="search-modal-content">
          {isLoading ? (
            <div className="search-loading">
              <div className="search-loading-spinner"></div>
              <p>جاري البحث...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="search-results">
              {searchResults.map((result) => (
                <Link 
                  to={result.type === 'product' ? `/products/${result.id}` : `/services/${result.id}`}
                  className="search-result-item"
                  key={`${result.type}-${result.id}`}
                  onClick={onClose}
                >
                  <div className="search-result-image">
                    <img src={result.image} alt={result.name} />
                  </div>
                  <div className="search-result-info">
                    <h4>{result.name}</h4>
                    <span className="search-result-category">{result.category}</span>
                    {result.type === 'product' ? (
                      <span className="search-result-price">{result.price}</span>
                    ) : (
                      <div className="search-result-rating">
                        <span className="rating-value">{result.rating}</span>
                        <span className="rating-stars">★★★★★</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              
              <Link to={`/search?q=${encodeURIComponent(searchQuery)}`} className="view-all-results" onClick={onClose}>
                عرض جميع النتائج
              </Link>
            </div>
          ) : searchQuery.trim() ? (
            <div className="no-results">
              <p>لا توجد نتائج لـ "{searchQuery}"</p>
              <span>يرجى التحقق من الإملاء أو استخدام كلمات مفتاحية أخرى</span>
            </div>
          ) : recentSearches.length > 0 ? (
            <div className="recent-searches">
              <div className="recent-searches-header">
                <h3>
                  <FontAwesomeIcon icon={faHistory} />
                  <span>عمليات البحث الأخيرة</span>
                </h3>
                <button 
                  className="clear-all-searches"
                  onClick={clearAllRecentSearches}
                >
                  مسح الكل
                </button>
              </div>
              <ul className="recent-searches-list">
                {recentSearches.map((search, index) => (
                  <li key={index} className="recent-search-item">
                    <button 
                      className="recent-search-text"
                      onClick={() => handleRecentSearch(search)}
                    >
                      <FontAwesomeIcon icon={faHistory} />
                      <span>{search}</span>
                    </button>
                    <button 
                      className="clear-search"
                      onClick={() => clearRecentSearch(index)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="empty-search">
              <p>ابدأ البحث عن المنتجات والخدمات</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal; 