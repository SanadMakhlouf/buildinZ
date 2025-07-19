import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faTimes, 
  faStore, 
  faTools, 
  faHistory,
  faArrowLeft,
  faFire,
  faChevronRight
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
  const [trendingSearches] = useState([
    'تنظيف المنزل',
    'صيانة مكيفات',
    'سباكة',
    'كهرباء',
    'دهان'
  ]);
  
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
  const clearRecentSearch = (index, e) => {
    e.stopPropagation(); // Prevent triggering the parent click
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

  // Use a recent search
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

  // Handle trending search
  const handleTrendingSearch = (query) => {
    setSearchQuery(query);
    saveRecentSearch(query);
    
    // Trigger search
    setIsLoading(true);
    setTimeout(() => {
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
        
        setSearchResults(results);
        setIsLoading(false);
      }, 500);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay">
      <div className="search-modal" ref={modalRef}>
        {/* Search Modal Header */}
        <div className="search-modal-header">
          <button className="search-modal-back" onClick={onClose}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          
          <form className="search-modal-form" onSubmit={handleSearch}>
            <FontAwesomeIcon icon={faSearch} className="search-modal-icon" />
            <input
              type="text"
              className="search-modal-input"
              placeholder="ابحث عن منتج أو خدمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              ref={searchInputRef}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-modal-clear"
                onClick={clearSearch}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </form>
        </div>

        {/* Search Tabs */}
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

        {/* Search Content */}
        <div className="search-modal-content">
          {/* Loading State */}
          {isLoading && (
            <div className="search-loading">
              <div className="search-loading-spinner"></div>
              <p>جاري البحث...</p>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && searchResults.length > 0 && (
            <div className="search-results">
              <h3 className="results-title">نتائج البحث</h3>
              
              {searchResults.map((result) => (
                <Link
                  to={`/${result.type === 'product' ? 'products' : 'services'}?id=${result.id}`}
                  className="search-result-item"
                  key={`${result.type}-${result.id}`}
                >
                  <div className="search-result-image">
                    <img src={result.image} alt={result.name} />
                  </div>
                  <div className="search-result-info">
                    <h4>{result.name}</h4>
                    <div className="search-result-category">{result.category}</div>
                    {result.type === 'product' && (
                      <div className="search-result-price">{result.price}</div>
                    )}
                    {result.type === 'service' && (
                      <div className="search-result-rating">
                        <span className="rating-value">{result.rating}</span>
                        <div className="rating-stars">
                          {'★'.repeat(Math.floor(result.rating))}
                          {'☆'.repeat(5 - Math.floor(result.rating))}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              
              <Link to={`/search?q=${encodeURIComponent(searchQuery)}`} className="view-all-results">
                عرض جميع النتائج
                <FontAwesomeIcon icon={faChevronRight} />
              </Link>
            </div>
          )}

          {/* No Results */}
          {!isLoading && searchQuery && searchResults.length === 0 && (
            <div className="no-results">
              <p>لم يتم العثور على نتائج لـ <span>"{searchQuery}"</span></p>
              <p>حاول استخدام كلمات مختلفة أو تحقق من الإملاء</p>
            </div>
          )}

          {/* Empty Search - Show Recent & Trending */}
          {!isLoading && !searchQuery && (
            <div className="empty-search">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="recent-searches">
                  <div className="recent-searches-header">
                    <h3>
                      <FontAwesomeIcon icon={faHistory} />
                      عمليات البحث الأخيرة
                    </h3>
                    <button className="clear-all-searches" onClick={clearAllRecentSearches}>
                      مسح الكل
                    </button>
                  </div>
                  
                  <div className="recent-searches-list">
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="recent-search-item"
                        onClick={() => handleRecentSearch(search)}
                      >
                        <div className="recent-search-text">
                          <FontAwesomeIcon icon={faHistory} />
                          <span>{search}</span>
                        </div>
                        <button
                          className="clear-search"
                          onClick={(e) => clearRecentSearch(index, e)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div className="trending-searches">
                <div className="trending-searches-header">
                  <h3>
                    <FontAwesomeIcon icon={faFire} />
                    الأكثر بحثاً
                  </h3>
                </div>
                
                <div className="trending-searches-list">
                  {trendingSearches.map((search, index) => (
                    <div
                      key={index}
                      className="trending-search-item"
                      onClick={() => handleTrendingSearch(search)}
                    >
                      <div className="trending-search-text">
                        <span className="trending-number">{index + 1}</span>
                        <span>{search}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal; 