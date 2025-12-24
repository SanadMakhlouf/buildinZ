import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faArrowLeft,
  faArrowRight,
  faStar,
  faShoppingCart,
  faShoppingBag,
  faHeart,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faTools,
  faHome,
  faWrench,
  faPaintRoller,
  faBolt,
  faWater,
  faCouch,
  faHammer,
  faCog,
  faLeaf,
  faShieldAlt,
  faTruck,
  faHeadset,
  faCheckCircle,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  faApple,
  faGooglePlay,
  faFacebookF,
  faTwitter,
  faInstagram,
  faLinkedinIn,
  faWhatsapp,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import "./HomePage.css";
import serviceBuilderService from "../../services/serviceBuilderService";
import config from "../../config/apiConfig";
import { useCart } from "../../context/CartContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [productImageIndices, setProductImageIndices] = useState({});
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [autoScrollIntervals, setAutoScrollIntervals] = useState({});
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Toggle wishlist function
  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const isInWishlist = prev.some((item) => item.id === product.id);
      let updated;
      if (isInWishlist) {
        updated = prev.filter((item) => item.id !== product.id);
      } else {
        updated = [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            label: product.label,
          },
        ];
      }
      localStorage.setItem("wishlist", JSON.stringify(updated));
      // Dispatch custom event to notify other components (like FavoritesPage)
      window.dispatchEvent(new Event("wishlistUpdated"));
      return updated;
    });
  }, []);

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId) => {
      return wishlist.some((item) => item.id === productId);
    },
    [wishlist]
  );

  // Default banner data - fallback if no ads
  const defaultBanners = [
    {
      id: 1,
      title: "خصم 20% على خدمات التكييف",
      subtitle: "صيانة وتركيب جميع أنواع التكييفات",
      image:
        "https://images.unsplash.com/photo-1631545806609-34facf43f1f0?w=1200",
      link: "/services2/categories",
      bgColor: "#0A3259",
    },
    {
      id: 2,
      title: "خدمات التصميم الداخلي",
      subtitle: "حوّل منزلك إلى تحفة فنية",
      image:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200",
      link: "/services2/categories",
      bgColor: "#1a4d80",
    },
    {
      id: 3,
      title: "خدمات الصيانة الشاملة",
      subtitle: "سباكة - كهرباء - نجارة",
      image:
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200",
      link: "/services2/categories",
      bgColor: "#072441",
    },
  ];

  // Default side banners - fallback if no ads
  const defaultSideBanners = [
    {
      id: 1,
      title: "عروض حصرية",
      subtitle: "خصم حتى 30%",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
      link: "/services2/categories",
    },
    {
      id: 2,
      title: "خدمات جديدة",
      subtitle: "اكتشف المزيد",
      image:
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600",
      link: "/services2/categories",
    },
  ];

  // State
  const [categories, setCategories] = useState([]);
  const [serviceCategoriesNames, setServiceCategoriesNames] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState(defaultBanners); // Ad banners from API
  const [sideBanners, setSideBanners] = useState(defaultSideBanners); // Sidebar ads from API
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [email, setEmail] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [loadingCategoryDetails, setLoadingCategoryDetails] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const [categoryPage, setCategoryPage] = useState(0);
  const categoriesPerPage = 12;

  // Refs
  const categoryScrollRef = useRef(null);
  const bannerIntervalRef = useRef(null);
  const megaMenuRef = useRef(null);

  // Default category icons mapping
  const categoryIcons = {
    تكييف: faCog,
    سباكة: faWater,
    كهرباء: faBolt,
    نجارة: faHammer,
    دهان: faPaintRoller,
    تصميم: faCouch,
    صيانة: faWrench,
    تنظيف: faLeaf,
    default: faTools,
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch home banner advertisements
        try {
          const adsResponse = await fetch(
            `${config.BACKEND_URL}/api/advertisements/position/home_banner`
          );
          if (adsResponse.ok) {
            const adsData = await adsResponse.json();
            console.log("Home banner ads response:", adsData);

            if (adsData.success && adsData.data && adsData.data.length > 0) {
              // Use only images from ads, keep default titles/subtitles
              const adBanners = adsData.data.map((ad, index) => {
                const defaultBanner =
                  defaultBanners[index % defaultBanners.length] ||
                  defaultBanners[0];
                return {
                  id: ad.id,
                  title: defaultBanner.title,
                  subtitle: defaultBanner.subtitle,
                  image: ad.image_url, // Desktop image
                  mobileImage: ad.mobile_image_url || ad.image_url, // Mobile image with fallback
                  link: ad.link || defaultBanner.link,
                  bgColor: defaultBanner.bgColor,
                };
              });
              setBanners(adBanners);
              console.log("Ad banners set (images only from ads):", adBanners);
            } else {
              // Fallback to default banners if no ads
              setBanners(defaultBanners);
            }
          } else {
            setBanners(defaultBanners);
          }
        } catch (error) {
          console.error("Error fetching advertisements:", error);
          setBanners(defaultBanners);
        }

        // Fetch sidebar advertisements
        try {
          const sidebarAdsResponse = await fetch(
            `${config.BACKEND_URL}/api/advertisements/position/sidebar`
          );
          if (sidebarAdsResponse.ok) {
            const sidebarAdsData = await sidebarAdsResponse.json();
            console.log("Sidebar ads response:", sidebarAdsData);

            if (
              sidebarAdsData.success &&
              sidebarAdsData.data &&
              sidebarAdsData.data.length > 0
            ) {
              // Use only images from ads, keep default titles/subtitles
              const adSideBanners = sidebarAdsData.data
                .slice(0, 2)
                .map((ad, index) => {
                  const defaultSideBanner =
                    defaultSideBanners[index] || defaultSideBanners[0];
                  return {
                    id: ad.id,
                    title: defaultSideBanner.title,
                    subtitle: defaultSideBanner.subtitle,
                    image: ad.image_url, // Desktop image
                    mobileImage: ad.mobile_image_url || ad.image_url, // Mobile image with fallback
                    link: ad.link || defaultSideBanner.link,
                  };
                });
              setSideBanners(adSideBanners);
              console.log(
                "Sidebar ad banners set (images only from ads):",
                adSideBanners
              );
            } else {
              // Fallback to default side banners if no ads
              setSideBanners(defaultSideBanners);
            }
          } else {
            setSideBanners(defaultSideBanners);
          }
        } catch (error) {
          console.error("Error fetching sidebar advertisements:", error);
          setSideBanners(defaultSideBanners);
        }

        // Fetch product categories (from products API)
        try {
          const categoriesResponse = await fetch(
            `${config.BACKEND_URL}/api/categories`
          );
          if (categoriesResponse.ok) {
            const responseData = await categoriesResponse.json();
            console.log("Product categories response:", responseData);

            if (responseData.success && responseData.data) {
              // Filter to show only main categories (no parent_id)
              const mainCategories = responseData.data.filter(
                (category) =>
                  category.parent_id === null ||
                  category.parent_id === undefined
              );
              const sortedCategories = [...mainCategories].sort(
                (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
              );
              setCategories(sortedCategories);
              console.log(
                "Product categories set (main categories only):",
                sortedCategories
              );
            } else {
              console.warn("No product categories found in response");
            }
          }
        } catch (error) {
          console.error("Error fetching product categories:", error);
          // Fallback to service categories if product categories fail
          try {
            const categoriesResponse =
              await serviceBuilderService.getAllCategories();
            console.log(
              "Service categories response (fallback):",
              categoriesResponse
            );

            let categoriesData = [];
            if (categoriesResponse?.success && categoriesResponse?.categories) {
              categoriesData = Array.isArray(categoriesResponse.categories)
                ? categoriesResponse.categories
                : [];
            } else if (categoriesResponse?.data) {
              if (Array.isArray(categoriesResponse.data)) {
                categoriesData = categoriesResponse.data;
              } else if (categoriesResponse.data.categories) {
                categoriesData = Array.isArray(
                  categoriesResponse.data.categories
                )
                  ? categoriesResponse.data.categories
                  : [];
              }
            } else if (Array.isArray(categoriesResponse)) {
              categoriesData = categoriesResponse;
            }

            if (categoriesData.length > 0) {
              setCategories(categoriesData);
            }
          } catch (fallbackError) {
            console.error(
              "Error fetching service categories (fallback):",
              fallbackError
            );
          }
        }

        // Fetch services
        const servicesResponse = await serviceBuilderService.getAllServices();
        console.log("Services response:", servicesResponse);

        let servicesData = [];
        // Handle different response structures
        if (servicesResponse?.success && servicesResponse?.services) {
          servicesData = Array.isArray(servicesResponse.services)
            ? servicesResponse.services
            : [];
        } else if (servicesResponse?.data) {
          servicesData = Array.isArray(servicesResponse.data)
            ? servicesResponse.data
            : servicesResponse.data.services ||
              servicesResponse.data.data ||
              [];
        } else if (Array.isArray(servicesResponse)) {
          servicesData = servicesResponse;
        }
        setServices(servicesData);

        // Fetch service-builder categories (names only)
        try {
          const sbCats = await serviceBuilderService.getAllCategories();
          let sbData = [];
          if (sbCats?.success && sbCats?.categories) {
            sbData = sbCats.categories;
          } else if (sbCats?.data) {
            if (Array.isArray(sbCats.data)) {
              sbData = sbCats.data;
            } else if (Array.isArray(sbCats.data.categories)) {
              sbData = sbCats.data.categories;
            } else if (Array.isArray(sbCats.data.data)) {
              sbData = sbCats.data.data;
            }
          } else if (Array.isArray(sbCats)) {
            sbData = sbCats;
          }
          const sbMain = sbData.filter(
            (cat) => cat.parent_id === null || cat.parent_id === undefined
          );
          setServiceCategoriesNames(sbMain);
        } catch (err) {
          console.error("Error fetching service categories names:", err);
        }

        // Fetch products
        try {
          const productsResponse = await fetch(
            `${config.BACKEND_URL}/api/products`
          );
          if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            console.log("Products response:", productsData);

            if (productsData.success && productsData.data?.products) {
              const formattedProducts = productsData.data.products.map(
                (product) => ({
                  id: product.id,
                  name: product.name,
                  type: "product",
                  category: product.category?.name || "",
                  categoryId: product.category?.id || "",
                  price: parseFloat(product.price) || 0,
                  originalPrice: product.original_price
                    ? parseFloat(product.original_price)
                    : null,
                  description: product.description || "",
                  image:
                    product.primary_image_url ||
                    (product.image_urls?.length > 0
                      ? product.image_urls[0]
                      : null),
                  images: product.image_urls || [],
                  rating:
                    product.reviews?.length > 0
                      ? product.reviews.reduce(
                          (sum, r) => sum + (r.rating || 0),
                          0
                        ) / product.reviews.length
                      : 0,
                  reviewCount: product.reviews?.length || 0,
                  stockQuantity: product.stock_quantity || 0,
                  label: product.label || null,
                })
              );
              setProducts(formattedProducts);
            }
          }
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    bannerIntervalRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => {
      if (bannerIntervalRef.current) {
        clearInterval(bannerIntervalRef.current);
      }
    };
  }, [banners.length]);

  // Banner navigation
  const goToBanner = (index) => {
    setCurrentBanner(index);
    // Reset interval
    if (bannerIntervalRef.current) {
      clearInterval(bannerIntervalRef.current);
    }
    bannerIntervalRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
  };

  const nextBanner = () => {
    goToBanner((currentBanner + 1) % banners.length);
  };

  const prevBanner = () => {
    goToBanner((currentBanner - 1 + banners.length) % banners.length);
  };

  // Category scroll
  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      // Calculate scroll amount based on visible items
      const itemWidth = 140 + 16; // category width + gap
      const containerWidth = categoryScrollRef.current.offsetWidth;
      const visibleItems = Math.floor(containerWidth / itemWidth);
      const scrollAmount = visibleItems * itemWidth;
      
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Calculate total pages for categories
  const totalCategoryPages = Math.ceil(categories.length / categoriesPerPage);

  // Handle category page change
  const goToCategoryPage = (pageIndex) => {
    if (categoryScrollRef.current) {
      const itemWidth = 140 + 16; // category width + gap
      const containerWidth = categoryScrollRef.current.offsetWidth;
      const visibleItems = Math.floor(containerWidth / itemWidth);
      const scrollAmount = pageIndex * visibleItems * itemWidth;
      
      categoryScrollRef.current.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
      setCategoryPage(pageIndex);
    }
  };

  // Handle scroll to detect page changes
  useEffect(() => {
    const handleCategoryScroll = () => {
      if (categoryScrollRef.current) {
        const scrollLeft = categoryScrollRef.current.scrollLeft;
        const itemWidth = 140 + 16; // category width + gap
        const containerWidth = categoryScrollRef.current.offsetWidth;
        const visibleItems = Math.floor(containerWidth / itemWidth);
        const pageWidth = visibleItems * itemWidth;
        const currentPage = Math.round(scrollLeft / pageWidth);
        setCategoryPage(currentPage);
      }
    };

    const scrollElement = categoryScrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleCategoryScroll);
      return () => {
        scrollElement.removeEventListener("scroll", handleCategoryScroll);
      };
    }
  }, [categories.length]);

  // Get category icon
  const getCategoryIcon = (categoryName) => {
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (categoryName?.includes(key)) {
        return icon;
      }
    }
    return categoryIcons.default;
  };

  // Format review count (e.g., 30800 -> "30.8K")
  // Generate consistent random rating between 4.6 and 5.0 based on product ID
  const getRandomRating = useCallback((productId) => {
    // Use product ID as seed for consistent random values
    const seed = productId ? productId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.random() * 1000;
    const random = (Math.sin(seed) * 10000) % 1;
    return (random * 0.4 + 4.6).toFixed(1);
  }, []);

  // Generate consistent random review count between 10 and 500 based on product ID
  const getRandomReviewCount = useCallback((productId) => {
    // Use product ID as seed for consistent random values
    const seed = productId ? productId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.random() * 1000;
    const random = (Math.sin(seed * 2) * 10000) % 1;
    return Math.floor(random * 490 + 10);
  }, []);

  const formatReviewCount = (count) => {
    if (!count || count === 0) return "0";
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  // Handle product card hover
  const handleProductHover = useCallback((productId, images) => {
    if (!images || images.length <= 1) return;
    
    setHoveredProductId(productId);
    
    // Initialize image index if not set
    setProductImageIndices(prev => {
      if (prev[productId] === undefined) {
        return { ...prev, [productId]: 0 };
      }
      return prev;
    });
    
    // Start auto-scroll
    const interval = setInterval(() => {
      setProductImageIndices(prev => {
        const currentIndex = prev[productId] || 0;
        const nextIndex = (currentIndex + 1) % images.length;
        return { ...prev, [productId]: nextIndex };
      });
    }, 2000); // Change image every 2 seconds
    
    setAutoScrollIntervals(prev => ({ ...prev, [productId]: interval }));
  }, []);

  // Handle product card leave
  const handleProductLeave = useCallback((productId) => {
    setHoveredProductId(prev => prev === productId ? null : prev);
    
    // Clear auto-scroll interval
    setAutoScrollIntervals(prev => {
      if (prev[productId]) {
        clearInterval(prev[productId]);
        const newIntervals = { ...prev };
        delete newIntervals[productId];
        return newIntervals;
      }
      return prev;
    });
    
    // Reset to first image
    setProductImageIndices(prev => ({ ...prev, [productId]: 0 }));
  }, []);

  // Navigate to next image
  const handleNextImage = useCallback((productId, images, e) => {
    e.stopPropagation();
    if (!images || images.length <= 1) return;
    
    // Stop auto-scroll when manually navigating
    setAutoScrollIntervals(prev => {
      if (prev[productId]) {
        clearInterval(prev[productId]);
        const newIntervals = { ...prev };
        delete newIntervals[productId];
        return newIntervals;
      }
      return prev;
    });
    
    setProductImageIndices(prev => {
      const currentIndex = prev[productId] || 0;
      const nextIndex = (currentIndex + 1) % images.length;
      return { ...prev, [productId]: nextIndex };
    });
  }, []);

  // Navigate to previous image
  const handlePrevImage = useCallback((productId, images, e) => {
    e.stopPropagation();
    if (!images || images.length <= 1) return;
    
    // Stop auto-scroll when manually navigating
    setAutoScrollIntervals(prev => {
      if (prev[productId]) {
        clearInterval(prev[productId]);
        const newIntervals = { ...prev };
        delete newIntervals[productId];
        return newIntervals;
      }
      return prev;
    });
    
    setProductImageIndices(prev => {
      const currentIndex = prev[productId] || 0;
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      return { ...prev, [productId]: prevIndex };
    });
  }, []);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(autoScrollIntervals).forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, [autoScrollIntervals]);

  // Calculate delivery date
  const getDeliveryDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });
  };

  // Get image URL helper
  const getImageUrl = (imagePath, cacheBust = null) => {
    // Return null/undefined if no image path - let component handle fallback
    if (
      !imagePath ||
      imagePath === "" ||
      imagePath === null ||
      imagePath === undefined
    ) {
      return null;
    }
    // If already a full URL, return as-is
    if (imagePath.startsWith("http")) {
      // Add cache busting if provided (use updated_at timestamp)
      if (cacheBust) {
        const separator = imagePath.includes("?") ? "&" : "?";
        return `${imagePath}${separator}v=${cacheBust}`;
      }
      return imagePath;
    }
    // Handle product category images (format: "categories/filename.jpg")
    if (imagePath.startsWith("categories/")) {
      const fullUrl = config.utils.getImageUrl(imagePath);
      // Add cache busting if provided
      if (cacheBust) {
        const separator = fullUrl.includes("?") ? "&" : "?";
        return `${fullUrl}${separator}v=${cacheBust}`;
      }
      return fullUrl;
    }
    // Try product image URL first (from products API)
    if (imagePath.startsWith("/storage/") || imagePath.startsWith("storage/")) {
      const fullUrl = config.utils.getImageUrl(
        imagePath.replace(/^\/?storage\//, "")
      );
      if (cacheBust) {
        const separator = fullUrl.includes("?") ? "&" : "?";
        return `${fullUrl}${separator}v=${cacheBust}`;
      }
      return fullUrl;
    }
    // Fallback to service builder image URL
    const fullUrl = serviceBuilderService.getImageUrl(imagePath);
    if (fullUrl && fullUrl.startsWith("http") && cacheBust) {
      const separator = fullUrl.includes("?") ? "&" : "?";
      return `${fullUrl}${separator}v=${cacheBust}`;
    }
    return fullUrl;
  };

  // Get category image helper - checks multiple possible fields
  const getCategoryImage = (category) => {
    // Check direct image field first (product categories use "image")
    if (category.image) {
      return category.image;
    }
    // Check other possible fields
    return (
      category.image_path ||
      category.preview_image_path ||
      category.preview_image_url ||
      category.image_url ||
      null
    );
  };

  // Get service image helper - checks multiple possible fields
  const getServiceImage = (service) => {
    return (
      service.main_image?.url ||
      service.preview_image_path ||
      service.preview_image_url ||
      service.image_path ||
      service.image ||
      null
    );
  };

  // Newsletter handler
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert("تم الاشتراك بنجاح في النشرة الإخبارية!");
      setEmail("");
    }
  };

  // Features data
  const features = [
    {
      icon: faShieldAlt,
      title: "ضمان الجودة",
      description: "خدمات مضمونة 100%",
    },
    { icon: faTruck, title: "خدمة سريعة", description: "سرعة قصوى للوصول" },
    { icon: faHeadset, title: "دعم 24/7", description: "خدمة عملاء متواصلة" },
    {
      icon: faCheckCircle,
      title: "فنيون محترفون",
      description: "خبرة عالية وموثوقة",
    },
    {
      icon: faCheckCircle,
      title: "فنيون محترفون",
      description: "خبرة عالية وموثوقة",
    },
  ];

  // Handle category hover
  const handleCategoryHover = useCallback(async (category) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set hovered category immediately
    setHoveredCategory(category);

    // Fetch category details
    setLoadingCategoryDetails(true);
    try {
      const details = await serviceBuilderService.getCategoryById(category.id);
      setCategoryDetails(details);
    } catch (error) {
      console.error('Error fetching category details:', error);
      setCategoryDetails(null);
    } finally {
      setLoadingCategoryDetails(false);
    }
  }, []);

  // Handle category leave with delay
  const handleCategoryLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
      setCategoryDetails(null);
    }, 200); // Small delay to allow moving to mega menu
  }, []);

  // Keep menu open when hovering over it
  const handleMegaMenuEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  }, []);

  const handleMegaMenuLeave = useCallback(() => {
    setHoveredCategory(null);
    setCategoryDetails(null);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="noon-homepage" role="document">
      {/* Service Categories Names (no images) */}
      {serviceCategoriesNames.length > 0 && (
        <section className="noon-service-names-strip" aria-label="فئات الخدمات">
          <div className="noon-section-container">
            <div className="noon-service-names-wrapper" dir="rtl">
              {/* Categories List */}
              <div className="noon-service-names-list">
                {serviceCategoriesNames.map((cat) => (
                  <div
                    key={`svc-cat-${cat.id}`}
                    className="service-name-link-wrapper"
                    onMouseEnter={() => handleCategoryHover(cat)}
                    onMouseLeave={handleCategoryLeave}
                  >
                    <Link
                      to={`/services2/categories/${cat.id}`}
                      className={`service-name-link ${hoveredCategory?.id === cat.id ? 'active' : ''}`}
                    >
                      {cat.name}
                    </Link>
                  </div>
                ))}
              </div>
              
              {/* Scroll Arrow */}
              <button className="service-scroll-arrow" aria-label="عرض المزيد">
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              
              {/* All Categories Section */}
              <div className="service-all-section">
                <div className="service-all-content">
                 
                  
                  {/* Text */}
                  <span className="service-all-text">على كل شي</span>
                  
                  {/* Right Arrow Button */}
                  <button className="service-nav-arrow service-nav-arrow-left" aria-label="التالي">
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                  
                  {/* Left Arrow Button */}
                  <button className="service-nav-arrow service-nav-arrow-right" aria-label="السابق">
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mega Menu Card */}
          {hoveredCategory && (
            <div
              className="service-mega-menu"
              ref={megaMenuRef}
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMegaMenuLeave}
            >
              {loadingCategoryDetails ? (
                <div className="mega-menu-loading">جاري التحميل...</div>
              ) : categoryDetails?.category ? (
                <div className="mega-menu-content">
                  {/* Right Section: Subcategories List */}
                  <div className="mega-menu-subcategories">
                    <h2 className="mega-menu-main-title">{hoveredCategory.name}</h2>
                    {categoryDetails.category.children && categoryDetails.category.children.length > 0 ? (
                      <ul className="mega-menu-subcategories-list">
                        {categoryDetails.category.children.map((subcategory) => {
                          const subcategoryImage = subcategory.preview_image_path || 
                                                   subcategory.preview_image_url || 
                                                   subcategory.image_path;
                          return (
                            <li key={subcategory.id}>
                              <Link 
                                to={`/services2/categories/${categoryDetails.category.id}?subcategory=${subcategory.id}`}
                                className="mega-menu-subcategory-item"
                              >
                                {subcategoryImage && (
                                  <div className="mega-menu-subcategory-image">
                                    <img
                                      src={getImageUrl(subcategoryImage)}
                                      alt={subcategory.name}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                <span className="mega-menu-subcategory-name">{subcategory.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : categoryDetails.category.services && categoryDetails.category.services.length > 0 ? (
                      <ul className="mega-menu-subcategories-list">
                        {categoryDetails.category.services.slice(0, 10).map((service) => (
                          <li key={service.id}>
                            <Link 
                              to={`/services2/${service.id}`}
                              className="mega-menu-subcategory-item"
                            >
                              <span className="mega-menu-subcategory-name">{service.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  {/* Left Section: Promotional Image */}
                  {categoryDetails.category.image_path && (
                    <div className="mega-menu-promo">
                      <div className="mega-menu-image">
                        <img
                          src={getImageUrl(categoryDetails.category.image_path)}
                          alt={hoveredCategory.name}
                        />
                        <div className="mega-menu-cta">
                          ابدأ مشوارك مع {hoveredCategory.name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </section>
      )}

      {/* Main Hero Section */}
      <section className="noon-hero-section">
        <div className="noon-hero-container">
          {/* Main Banner Carousel */}
          {banners.length > 0 && (
            <div className="noon-main-banner">
              <div className="noon-banner-wrapper">
                {banners.map((banner, index) => {
                  const isExternalLink = banner.link && (banner.link.startsWith('http://') || banner.link.startsWith('https://'));
                  const bannerContent = (
                    <picture>
                      {banner.mobileImage &&
                        banner.mobileImage !== banner.image && (
                          <source
                            media="(max-width: 768px)"
                            srcSet={banner.mobileImage}
                          />
                        )}
                      <img
                        src={banner.image}
                        alt={banner.title || "Banner"}
                      />
                    </picture>
                  );

                  return (
                    <div
                      key={banner.id}
                      className={`noon-banner-slide ${
                        index === currentBanner ? "active" : ""
                      }`}
                    >
                      {banner.link ? (
                        isExternalLink ? (
                          <a
                            href={banner.link}
                            className="noon-banner-image"
                            style={{ display: 'block', textDecoration: 'none' }}
                          >
                            {bannerContent}
                          </a>
                        ) : (
                          <Link
                            to={banner.link}
                            className="noon-banner-image"
                            style={{ display: 'block', textDecoration: 'none' }}
                          >
                            {bannerContent}
                          </Link>
                        )
                      ) : (
                        <div className="noon-banner-image">
                          {bannerContent}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Banner Navigation */}
              <button
                className="noon-banner-nav noon-banner-prev"
                onClick={prevBanner}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
              <button
                className="noon-banner-nav noon-banner-next"
                onClick={nextBanner}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              {/* Banner Dots */}
              <div className="noon-banner-dots">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    className={`noon-banner-dot ${
                      index === currentBanner ? "active" : ""
                    }`}
                    onClick={() => goToBanner(index)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Side Banners */}
          {sideBanners.length > 0 && (
            <div className="noon-side-banners">
              {sideBanners.map((banner) => {
                const isExternalLink = banner.link && (banner.link.startsWith('http://') || banner.link.startsWith('https://'));
                const bannerContent = (
                  <picture>
                    {banner.mobileImage &&
                      banner.mobileImage !== banner.image && (
                        <source
                          media="(max-width: 768px)"
                          srcSet={banner.mobileImage}
                        />
                      )}
                    <img
                      src={banner.image}
                      alt={banner.title || "Side Banner"}
                    />
                  </picture>
                );

                return banner.link ? (
                  isExternalLink ? (
                    <a
                      key={banner.id}
                      href={banner.link}
                      className="noon-side-banner"
                      style={{ textDecoration: 'none' }}
                    >
                      {bannerContent}
                    </a>
                  ) : (
                    <Link
                      key={banner.id}
                      to={banner.link}
                      className="noon-side-banner"
                    >
                      {bannerContent}
                    </Link>
                  )
                ) : (
                  <div key={banner.id} className="noon-side-banner">
                    {bannerContent}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="noon-categories-section" aria-label="الفئات">
        <div className="noon-section-container">
          <div className="noon-categories-wrapper">
            

            <div className="noon-categories-scroll" ref={categoryScrollRef}>
              {loading ? (
                // Skeleton loaders
                Array(12)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="noon-category-item skeleton">
                      <div className="noon-category-image skeleton-image"></div>
                      <div className="skeleton-text"></div>
                    </div>
                  ))
              ) : categories.length > 0 ? (
                categories.map((category) => {
                  const categoryImage = getCategoryImage(category);
                  // Use updated_at timestamp for cache busting (converts ISO string to timestamp)
                  const cacheBust = category.updated_at
                    ? new Date(category.updated_at).getTime()
                    : category.created_at
                    ? new Date(category.created_at).getTime()
                    : null;
                  const imageUrl = categoryImage
                    ? getImageUrl(categoryImage, cacheBust)
                    : null;
                  // Use category id and updated_at for key to force re-render when image changes
                  const categoryKey = `${category.id}-${
                    category.updated_at || category.created_at || ""
                  }`;
                  return (
                    <Link
                      key={categoryKey}
                      to={`/products?category=${category.id}`}
                      className="noon-category-item"
                    >
                      <div className="noon-category-image">
                        {imageUrl ? (
                          <img
                            key={`img-${categoryKey}-${categoryImage}`}
                            src={imageUrl}
                            alt={category.name}
                            loading="lazy"
                            style={{
                              display: "block",
                              opacity: 0,
                              transition: "opacity 0.3s",
                            }}
                            onLoad={(e) => {
                              // Image loaded successfully - fade in
                              e.target.style.opacity = "1";
                            }}
                            onError={(e) => {
                              // Hide image and show icon fallback
                              e.target.style.display = "none";
                              const parent = e.target.parentElement;
                              const existingIcon = parent.querySelector("svg");
                              if (
                                !existingIcon ||
                                !existingIcon.classList.contains("fa-icon")
                              ) {
                                // Remove any existing non-FA icons
                                const nonFaIcons =
                                  parent.querySelectorAll("svg:not(.fa-icon)");
                                nonFaIcons.forEach((icon) => icon.remove());
                              }
                            }}
                          />
                        ) : null}
                        {!imageUrl && (
                          <div className="noon-category-icon-fallback">
                            <FontAwesomeIcon
                              icon={getCategoryIcon(category.name)}
                            />
                          </div>
                        )}
                      </div>
                      <span className="noon-category-name">
                        {category.name}
                      </span>
                    </Link>
                  );
                })
              ) : (
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "var(--noon-text-light)",
                  }}
                >
                  <p>لا توجد فئات متاحة حالياً</p>
                </div>
              )}
            </div>

          
          </div>

          {/* Pagination Dots */}
          {!loading && categories.length > 0 && totalCategoryPages > 1 && (
            <div className="noon-categories-pagination">
              {Array.from({ length: totalCategoryPages }, (_, i) => (
                <button
                  key={i}
                  className={`noon-pagination-dot ${
                    categoryPage === i ? "active" : ""
                  }`}
                  onClick={() => goToCategoryPage(i)}
                  aria-label={`صفحة ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Strip */}
      <section className="noon-features-strip" aria-label="المميزات">
        <div className="noon-section-container">
          <div className="noon-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="noon-feature-item">
                <FontAwesomeIcon
                  icon={feature.icon}
                  className="noon-feature-icon"
                />
                <div className="noon-feature-text">
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="noon-services-section" aria-label="الخدمات الأكثر طلباً">
        <div className="noon-section-container">
          <header className="noon-section-header">
            <h2>الخدمات الأكثر طلباً</h2>
            <Link to="/services" className="noon-view-all">
              عرض الكل <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
          </header>

          <div className="noon-services-grid">
            {loading
              ? // Skeleton loaders
                Array(20)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="homepage-product-card skeleton">
                      <div className="product-image-container skeleton-image"></div>
                      <div className="homepage-product-details skeleton-content">
                        <div className="skeleton-text"></div>
                        <div className="skeleton-text short"></div>
                      </div>
                    </div>
                  ))
              : services.slice(6, 12).map((service) => {
                  const serviceImage = getServiceImage(service);
                  const imageUrl = serviceImage
                    ? getImageUrl(serviceImage)
                    : null;
                  const serviceDiscount = service.discount || 0;

                  return (
                    <div
                      key={service.id}
                      className="homepage-product-card"
                      onClick={() => navigate(`/services2/${service.id}`)}
                    >
                      <div className="product-image-container">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={service.name}
                            className="product-image"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <div className="product-image-placeholder">
                            <FontAwesomeIcon icon={faTools} />
                          </div>
                        )}

                        {/* Discount Badge */}
                        {serviceDiscount > 0 && (
                          <span className="product-badge discount-badge">
                            {serviceDiscount}% OFF
                          </span>
                        )}

                        {/* Deal Banner */}
                        {serviceDiscount > 0 && (
                          <div className="product-deal-banner">Deal</div>
                        )}

                        {/* Wishlist Button */}
                        <button
                          className="product-wishlist-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement wishlist
                          }}
                          title="إضافة للمفضلة"
                        >
                          <FontAwesomeIcon icon={faHeart} />
                        </button>

                      </div>

                      <div className="homepage-product-details">
                        <h3 className="product-name">{service.name}</h3>
                        {service.description && (
                          <p className="product-description">
                            {service.description}
                          </p>
                        )}

                        {/* Rating Section */}
                        <div className="product-rating-section">
                          <span className="rating-value">
                            {service.rating && service.rating > 0
                              ? service.rating.toFixed(1)
                              : getRandomRating(service.id)}
                          </span>
                          <FontAwesomeIcon
                            icon={faStar}
                            className="rating-star"
                          />
                          <span className="review-count">
                            ({formatReviewCount(
                              service.reviews?.length > 0
                                ? service.reviews.length
                                : getRandomReviewCount(service.id)
                            )})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="noon-services-section" aria-label="المنتجات الأكثر طلباً">
        <div className="noon-section-container">
          <header className="noon-section-header">
            <h2>المنتجات الأكثر طلباً</h2>
            <Link to="/products" className="noon-view-all">
              عرض الكل <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
          </header>

          <div className="noon-services-grid">
            {loading
              ? // Skeleton loaders
                Array(50)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="homepage-product-card skeleton">
                      <div className="product-image-container skeleton-image"></div>
                      <div className="homepage-product-details skeleton-content">
                        <div className="skeleton-text"></div>
                        <div className="skeleton-text short"></div>
                      </div>
                    </div>
                  ))
              : products
                  .filter(
                    (product) =>
                      product.stockQuantity > 0 &&
                      product.stockQuantity !== null
                  )
                  .slice(0, 60)
                  .map((product) => {
                  const imageUrl = product.image
                    ? getImageUrl(product.image)
                    : null;
                  const discount =
                    product.originalPrice &&
                    product.price &&
                    product.originalPrice > product.price
                      ? Math.round(
                          ((product.originalPrice - product.price) /
                            product.originalPrice) *
                            100
                        )
                      : 0;

                  const slugify = (text = "", fallback = "") => {
                    const base = text && text.toString().trim();
                    const cleaned = base
                      ? base
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^-\w\u0600-\u06FF]+/g, "")
                          .replace(/-+/g, "-")
                          .replace(/^-+|-+$/g, "")
                      : "";
                    return cleaned || fallback;
                  };

                  // Get all product images
                  const productImages = product.images && product.images.length > 0
                    ? product.images.map(img => getImageUrl(img))
                    : imageUrl ? [imageUrl] : [];
                  
                  const currentImageIndex = productImageIndices[product.id] || 0;
                  const currentImageUrl = productImages.length > 0 
                    ? productImages[currentImageIndex] 
                    : imageUrl;
                  const hasMultipleImages = productImages.length > 1;

                  return (
                    <div
                      key={product.id}
                      className="homepage-product-card"
                      onMouseEnter={() => hasMultipleImages && handleProductHover(product.id, productImages)}
                      onMouseLeave={() => hasMultipleImages && handleProductLeave(product.id)}
                      onClick={() =>
                        navigate(
                          `/products/${product.id}/${slugify(
                            product.name,
                            `product-${product.id}`
                          )}`
                        )
                      }
                    >
                      <div className="product-image-container">
                        {currentImageUrl ? (
                          <img
                            key={`${product.id}-${currentImageIndex}`}
                            src={currentImageUrl}
                            alt={product.name}
                            className="product-image"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <div className="product-image-placeholder">
                            <FontAwesomeIcon icon={faShoppingCart} />
                          </div>
                        )}

                        {/* Image Navigation Buttons - Show on hover if multiple images */}
                        {hasMultipleImages && hoveredProductId === product.id && (
                          <>
                            <button
                              className="product-image-nav-btn product-image-nav-prev"
                              onClick={(e) => handlePrevImage(product.id, productImages, e)}
                              title="الصورة السابقة"
                            >
                              <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                            <button
                              className="product-image-nav-btn product-image-nav-next"
                              onClick={(e) => handleNextImage(product.id, productImages, e)}
                              title="الصورة التالية"
                            >
                              <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                          </>
                        )}

                        {/* Product Label */}
                        {product.label && (
                          <span className="product-badge product-label-badge">
                            {product.label}
                          </span>
                        )}

                        {/* Discount Badge */}
                        {discount > 0 && (
                          <span className="product-badge discount-badge">
                            {discount}%
                          </span>
                        )}

                        {/* Out of Stock Badge */}
                        {(product.stockQuantity === 0 ||
                          product.stockQuantity === null) && (
                          <span className="product-badge out-of-stock-badge">
                            نفذت الكمية
                          </span>
                        )}

                        {/* Wishlist Button */}
                        <button
                          className={`product-wishlist-btn ${
                            isInWishlist(product.id) ? "active" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product);
                          }}
                          title={
                            isInWishlist(product.id)
                              ? "إزالة من المفضلة"
                              : "إضافة للمفضلة"
                          }
                        >
                          <FontAwesomeIcon icon={faHeart} />
                        </button>

                        {/* Add to Cart Button - Bottom Left */}
                        <button
                          className="homepage-product-add-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const cartProduct = {
                              id: product.id,
                              name: product.name,
                              price: parseFloat(product.price),
                              image: imageUrl || null,
                              vendor: product.vendor || '',
                              stockQuantity: product.stockQuantity || 0,
                              category: product.category || ''
                            };
                            addToCart(cartProduct, 1);
                            // Trigger animation
                            const button = e.currentTarget;
                            if (button) {
                              button.classList.add('clicked');
                              setTimeout(() => {
                                button.classList.remove('clicked');
                              }, 600);
                            }
                          }}
                          title="إضافة إلى السلة"
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>

                      <div className="homepage-product-details">
                        <h3 className="product-name">
                          {product.name || "منتج بدون اسم"}
                        </h3>
                        

                        {/* Rating Section */}
                        <div className="product-rating-section">
                          <span className="rating-value">
                            {product.reviewCount === 0 || !product.reviewCount
                              ? getRandomRating(product.id)
                              : (product.rating || 0).toFixed(1)}
                          </span>
                          <FontAwesomeIcon
                            icon={faStar}
                            className="rating-star"
                          />
                          <span className="review-count">
                            ({formatReviewCount(
                              product.reviewCount === 0 || !product.reviewCount
                                ? getRandomReviewCount(product.id)
                                : product.reviewCount || 0
                            )})
                          </span>
                        </div>

                        {/* Price Section */}
                        <div className="product-price-section">
                          <div className="product-price">
                            {product.originalPrice &&
                              product.price &&
                              product.originalPrice > product.price && (
                                <span className="product-original-price">
                                  {product.originalPrice.toLocaleString(
                                    "en-US",
                                    {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    }
                                  )}
                                </span>
                              )}
                            <span className="price-currency">درهم</span>
                            <span className="price-value">
                              {(product.price || 0).toLocaleString("en-US", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </span>
                            {discount > 0 && (
                              <span className="discount-percentage">
                                {discount}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delivery Information */}
                        <div className="product-delivery-info">
                          <div className="delivery-availability">
                            <FontAwesomeIcon
                              icon={faShoppingBag}
                              className="delivery-icon"
                            />
                            <span>بتخلص بسرعة</span>
                          </div>
                          <div className="delivery-express">
                            <FontAwesomeIcon
                              icon={faBolt}
                              className="delivery-lightning-icon"
                            />
                            <span>يوصلك في {getDeliveryDate()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="noon-promo-section" aria-label="عرض ترويجي">
        <div className="noon-section-container">
          <div
            className="noon-promo-banner"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              position: "relative",
            }}
          >
            <div className="noon-promo-banner-overlay"></div>
            <div className="noon-promo-content">
              <h2>
                {" "}
                يشيل عنك هم التشطيب ......... كل اللي تحتاجه في مكان واحد
              </h2>
              <p>
                مجموعة واسعة من خدمات البناء والصيانة والتصميم الداخلي الصورة
                اعتقد مقاسها صغير ، لو نخلي ا
              </p>
              <Link to="/services" className="noon-promo-btn">
                استكشف الخدمات
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* More Services Grid */}
      {services.length > 8 && (
        <section className="noon-services-section" aria-label="المزيد من الخدمات">
          <div className="noon-section-container">
            <header className="noon-section-header">
              <h2>المزيد من الخدمات</h2>
              <Link to="/services2/categories" className="noon-view-all">
                عرض الكل <FontAwesomeIcon icon={faArrowLeft} />
              </Link>
            </header>

            <div className="noon-services-grid">
              {services.slice(0, 12).map((service) => {
                const serviceImage = getServiceImage(service);
                const imageUrl = serviceImage
                  ? getImageUrl(serviceImage)
                  : null;
                const serviceDiscount = service.discount || 0;

                return (
                  <div
                    key={service.id}
                    className="homepage-product-card"
                    onClick={() => navigate(`/services2/${service.id}`)}
                  >
                    <div className="product-image-container">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={service.name}
                          className="product-image"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                          loading="lazy"
                        />
                      ) : (
                        <div className="product-image-placeholder">
                          <FontAwesomeIcon icon={faTools} />
                        </div>
                      )}

                      {/* Discount Badge */}
                      {serviceDiscount > 0 && (
                        <span className="product-badge discount-badge">
                          {serviceDiscount}% OFF
                        </span>
                      )}

                      {/* Deal Banner */}
                      {serviceDiscount > 0 && (
                        <div className="product-deal-banner">Deal</div>
                      )}

                      {/* Wishlist Button */}
                      <button
                        className="product-wishlist-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement wishlist
                        }}
                        title="إضافة للمفضلة"
                      >
                        <FontAwesomeIcon icon={faHeart} />
                      </button>

                    </div>

                    <div className="homepage-product-details">
                      <h3 className="product-name">{service.name}</h3>
                      {service.description && (
                        <p className="product-description">
                          {service.description}
                        </p>
                      )}

                      {/* Rating Section */}
                      <div className="product-rating-section">
                        <span className="rating-value">
                          {service.rating && service.rating > 0
                            ? service.rating.toFixed(1)
                            : getRandomRating(service.id)}
                        </span>
                        <FontAwesomeIcon
                          icon={faStar}
                          className="rating-star"
                        />
                        <span className="review-count">
                          ({formatReviewCount(
                            service.reviews?.length > 0
                              ? service.reviews.length
                              : getRandomReviewCount(service.id)
                          )})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* More Products Grid */}
      {products.length > 8 && (
        <section className="noon-services-section" aria-label="المزيد من المنتجات">
          <div className="noon-section-container">
            <header className="noon-section-header">
              <h2>المزيد من المنتجات</h2>
              <Link to="/products" className="noon-view-all">
                عرض الكل <FontAwesomeIcon icon={faArrowLeft} />
              </Link>
            </header>

            <div className="noon-services-grid">
              {products
                  .filter(
                    (product) =>
                      product.stockQuantity > 0 &&
                      product.stockQuantity !== null
                  )
                  .slice(8, 12)
                  .map((product) => {
                const imageUrl = product.image
                  ? getImageUrl(product.image)
                  : null;
                const discount =
                  product.originalPrice &&
                  product.price &&
                  product.originalPrice > product.price
                    ? Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )
                    : 0;

                const slugify = (text = "", fallback = "") => {
                  const base = text && text.toString().trim();
                  const cleaned = base
                    ? base
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^-\w\u0600-\u06FF]+/g, "")
                        .replace(/-+/g, "-")
                        .replace(/^-+|-+$/g, "")
                    : "";
                  return cleaned || fallback;
                };

                // Get all product images
                const productImages = product.images && product.images.length > 0
                  ? product.images.map(img => getImageUrl(img))
                  : imageUrl ? [imageUrl] : [];
                
                const currentImageIndex = productImageIndices[product.id] || 0;
                const currentImageUrl = productImages.length > 0 
                  ? productImages[currentImageIndex] 
                  : imageUrl;
                const hasMultipleImages = productImages.length > 1;

                return (
                  <div
                    key={product.id}
                    className="homepage-product-card"
                    onMouseEnter={() => hasMultipleImages && handleProductHover(product.id, productImages)}
                    onMouseLeave={() => hasMultipleImages && handleProductLeave(product.id)}
                    onClick={() =>
                      navigate(
                        `/products/${product.id}/${slugify(
                          product.name,
                          `product-${product.id}`
                        )}`
                      )
                    }
                  >
                    <div className="product-image-container">
                      {currentImageUrl ? (
                        <img
                          key={`${product.id}-${currentImageIndex}`}
                          src={currentImageUrl}
                          alt={product.name}
                          className="product-image"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                          loading="lazy"
                        />
                      ) : (
                        <div className="product-image-placeholder">
                          <FontAwesomeIcon icon={faShoppingCart} />
                        </div>
                      )}

                      {/* Image Navigation Buttons - Show on hover if multiple images */}
                      {hasMultipleImages && hoveredProductId === product.id && (
                        <>
                          <button
                            className="product-image-nav-btn product-image-nav-prev"
                            onClick={(e) => handlePrevImage(product.id, productImages, e)}
                            title="الصورة السابقة"
                          >
                            <FontAwesomeIcon icon={faChevronRight} />
                          </button>
                          <button
                            className="product-image-nav-btn product-image-nav-next"
                            onClick={(e) => handleNextImage(product.id, productImages, e)}
                            title="الصورة التالية"
                          >
                            <FontAwesomeIcon icon={faChevronLeft} />
                          </button>
                        </>
                      )}

                      {/* Product Label */}
                      {product.label && (
                        <span className="product-badge product-label-badge">
                          {product.label}
                        </span>
                      )}

                      {/* Discount Badge */}
                      {discount > 0 && (
                        <span className="product-badge discount-badge">
                          {discount}%
                        </span>
                      )}

                      {/* Out of Stock Badge */}
                      {(product.stockQuantity === 0 ||
                        product.stockQuantity === null) && (
                        <span className="product-badge out-of-stock-badge">
                          نفذت الكمية
                        </span>
                      )}

                      {/* Wishlist Button */}
                      <button
                        className={`product-wishlist-btn ${
                          isInWishlist(product.id) ? "active" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        title={
                          isInWishlist(product.id)
                            ? "إزالة من المفضلة"
                            : "إضافة للمفضلة"
                        }
                      >
                        <FontAwesomeIcon icon={faHeart} />
                      </button>

                      {/* Add to Cart Button - Bottom Left */}
                      <button
                        className="homepage-product-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const cartProduct = {
                            id: product.id,
                            name: product.name,
                            price: parseFloat(product.price),
                            image: currentImageUrl || null,
                            vendor: product.vendor || '',
                            stockQuantity: product.stockQuantity || 0,
                            category: product.category || ''
                          };
                          addToCart(cartProduct, 1);
                          // Trigger animation
                          const button = e.currentTarget;
                          if (button) {
                            button.classList.add('clicked');
                            setTimeout(() => {
                              button.classList.remove('clicked');
                            }, 600);
                          }
                        }}
                        title="إضافة إلى السلة"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>

                    <div className="homepage-product-details">
                      <h3 className="product-name">
                        {product.name || "منتج بدون اسم"}
                      </h3>
                      {product.description && (
                        <p className="product-description">
                          {product.description}
                        </p>
                      )}

                      {/* Rating Section */}
                      <div className="product-rating-section">
                        <span className="rating-value">
                          {(product.rating || 0).toFixed(1)}
                        </span>
                        <FontAwesomeIcon
                          icon={faStar}
                          className="rating-star"
                        />
                        <span className="review-count">
                          ({formatReviewCount(product.reviewCount || 0)})
                        </span>
                      </div>

                      {/* Price Section */}
                      <div className="product-price-section">
                        <div className="product-price">
                          {product.originalPrice &&
                            product.price &&
                            product.originalPrice > product.price && (
                              <span className="product-original-price">
                                {product.originalPrice.toLocaleString("en-US", {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                })}
                              </span>
                            )}
                          <span className="price-currency">درهم</span>
                          <span className="price-value">
                            {(product.price || 0).toLocaleString("en-US", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                          </span>
                          {discount > 0 && (
                            <span className="discount-percentage">
                              {discount}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delivery Information */}
                      <div className="product-delivery-info">
                        <div className="delivery-availability">
                          <FontAwesomeIcon
                            icon={faShoppingBag}
                            className="delivery-icon"
                          />
                          <span>بتخلص بسرعة</span>
                        </div>
                        <div className="delivery-express">
                          <FontAwesomeIcon
                            icon={faBolt}
                            className="delivery-lightning-icon"
                          />
                          <span>يوصلك في {getDeliveryDate()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

     

      {/* App Download Section */}
      <section className="noon-app-section" aria-label="تحميل التطبيق">
        <div className="noon-section-container">
          <div className="noon-app-content">
            <div className="noon-app-text">
              <h2>حمّل التطبيق</h2>
              <p>احصل على تجربة أفضل مع تطبيق Buildinz للهاتف المحمول</p>
              <div className="noon-app-buttons">
                <a href="#" className="noon-app-btn">
                  <FontAwesomeIcon icon={faApple} />
                  <div>
                    <span>حمّل من</span>
                    <strong>App Store</strong>
                  </div>
                </a>
                <a href="#" className="noon-app-btn">
                  <FontAwesomeIcon icon={faGooglePlay} />
                  <div>
                    <span>حمّل من</span>
                    <strong>Google Play</strong>
                  </div>
                </a>
              </div>
            </div>
            <div className="noon-app-image">
              <img
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400"
                alt="تطبيق Buildinz"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="noon-footer" role="contentinfo" aria-label="تذييل الموقع">
        <div className="noon-footer-container">
          <div className="noon-footer-content">
            {/* About Section */}
            <div className="noon-footer-section noon-footer-about">
              <div className="noon-footer-logo">
                <FontAwesomeIcon icon={faTools} />
                Buildinz
              </div>
              <p>
                منصة شاملة تربط بين العملاء ومقدمي الخدمات المنزلية والمهنية في
                دولة الإمارات العربية المتحدة.
              </p>
              <div className="noon-footer-social">
                <a href="https://www.facebook.com/buildingzuae" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
                <a href="https://www.instagram.com/buildingzuae/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="https://www.tiktok.com/@buildingzuae" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <FontAwesomeIcon icon={faTiktok} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <nav className="noon-footer-section noon-footer-links" aria-label="روابط سريعة">
              <h3>روابط سريعة</h3>
              <ul>
                <li>
                  <Link to="/services2/categories">الخدمات</Link>
                </li>
                <li>
                  <Link to="/about">من نحن</Link>
                </li>
                <li>
                  <Link to="/faq">الأسئلة الشائعة</Link>
                </li>
                <li>
                  <Link to="/contact">تواصل معنا</Link>
                </li>
              </ul>
            </nav>

            {/* Support */}
            <nav className="noon-footer-section noon-footer-links" aria-label="الدعم">
              <h3>الدعم</h3>
              <ul>
                <li>
                  <Link to="/help">مركز المساعدة</Link>
                </li>
                <li>
                  <Link to="/privacy">سياسة الخصوصية</Link>
                </li>
                <li>
                  <Link to="/terms">الشروط والأحكام</Link>
                </li>
              </ul>
            </nav>

            {/* Contact & Newsletter */}
            <div className="noon-footer-section noon-footer-contact">
              <h3>تواصل معنا</h3>
              <div className="noon-contact-info">
                <FontAwesomeIcon icon={faPhone} />
                <span>+971 XX XXX XXXX</span>
              </div>
              <div className="noon-contact-info">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>info@buildinz.com</span>
              </div>
              <div className="noon-contact-info">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span> ابو ظبي</span>
              </div>

              <div className="noon-newsletter">
                <h4>النشرة الإخبارية</h4>
                <form onSubmit={handleNewsletterSubmit} aria-label="النشرة الإخبارية">
                  <input
                    type="email"
                    placeholder="بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit">اشتراك</button>
                </form>
              </div>
            </div>
          </div>

          <div className="noon-footer-bottom">
            <p>&copy; 2024 Buildinz. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
