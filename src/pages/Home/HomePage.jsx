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
} from "@fortawesome/free-solid-svg-icons";
import {
  faApple,
  faGooglePlay,
  faFacebookF,
  faTwitter,
  faInstagram,
  faLinkedinIn,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import "./HomePage.css";
import serviceBuilderService from "../../services/serviceBuilderService";
import config from "../../config/apiConfig";

const HomePage = () => {
  const navigate = useNavigate();

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

  // Refs
  const categoryScrollRef = useRef(null);
  const bannerIntervalRef = useRef(null);

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
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Get category icon
  const getCategoryIcon = (categoryName) => {
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (categoryName?.includes(key)) {
        return icon;
      }
    }
    return categoryIcons.default;
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
  ];

  return (
    <div className="noon-homepage">
      {/* Service Categories Names (no images) */}
      {serviceCategoriesNames.length > 0 && (
        <section className="noon-service-names-strip">
          <div className="noon-section-container">
            <div className="noon-service-names-list" dir="rtl">
              {serviceCategoriesNames.map((cat) => (
                <Link
                  key={`svc-cat-${cat.id}`}
                  to={`/services2/categories/${cat.id}`}
                  className="service-name-pill"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Hero Section */}
      <section className="noon-hero-section">
        <div className="noon-hero-container">
          {/* Main Banner Carousel */}
          {banners.length > 0 && (
            <div className="noon-main-banner">
              <div className="noon-banner-wrapper">
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className={`noon-banner-slide ${
                      index === currentBanner ? "active" : ""
                    }`}
                  >
                    <div className="noon-banner-image">
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
                    </div>
                  </div>
                ))}
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
              {sideBanners.map((banner) => (
                <Link
                  key={banner.id}
                  to={banner.link || "#"}
                  className="noon-side-banner"
                >
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
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="noon-categories-section">
        <div className="noon-section-container">
          <div className="noon-categories-wrapper">
            {!loading && categories.length > 0 && (
              <button
                className="noon-scroll-btn noon-scroll-right"
                onClick={() => scrollCategories("left")}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            )}

            <div className="noon-categories-scroll" ref={categoryScrollRef}>
              {loading ? (
                // Skeleton loaders
                Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="noon-category-item skeleton">
                      <div className="noon-category-icon skeleton-circle"></div>
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
                      <div className="noon-category-icon">
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
                          <FontAwesomeIcon
                            icon={getCategoryIcon(category.name)}
                          />
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

            {!loading && categories.length > 0 && (
              <button
                className="noon-scroll-btn noon-scroll-left"
                onClick={() => scrollCategories("right")}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="noon-features-strip">
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
      <section className="noon-services-section">
        <div className="noon-section-container">
          <div className="noon-section-header">
            <h2>الخدمات الأكثر طلباً</h2>
            <Link to="/services2/categories" className="noon-view-all">
              عرض الكل <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
          </div>

          <div className="noon-services-grid">
            {loading
              ? // Skeleton loaders
                Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="noon-service-card skeleton">
                      <div className="skeleton-image"></div>
                      <div className="skeleton-content">
                        <div className="skeleton-text"></div>
                        <div className="skeleton-text short"></div>
                      </div>
                    </div>
                  ))
              : services.slice(0, 8).map((service) => {
                  const serviceImage = getServiceImage(service);
                  const imageUrl = serviceImage
                    ? getImageUrl(serviceImage)
                    : null;

                  return (
                    <Link
                      key={service.id}
                      to={`/services2/service/${service.id}`}
                      className="noon-service-card"
                    >
                      <div className="noon-service-image">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={service.name}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background:
                                "linear-gradient(135deg, #0A3259 0%, #1a4d80 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#DAA520",
                              fontSize: "3rem",
                            }}
                          >
                            <FontAwesomeIcon icon={faTools} />
                          </div>
                        )}
                        {service.discount && (
                          <span className="noon-service-badge">
                            خصم {service.discount}%
                          </span>
                        )}
                      </div>
                      <div className="noon-service-content">
                        <h3 className="noon-service-name">{service.name}</h3>
                        <p className="noon-service-desc">
                          {service.description?.substring(0, 60)}...
                        </p>
                        <div className="noon-service-footer">
                          {service.base_price && (
                            <span className="noon-service-price">
                              يبدأ من {service.base_price} درهم
                            </span>
                          )}
                          <div className="noon-service-rating">
                            <FontAwesomeIcon icon={faStar} />
                            <span>{service.rating?.toFixed(1) || "4.8"}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="noon-services-section">
        <div className="noon-section-container">
          <div className="noon-section-header">
            <h2>المنتجات الأكثر طلباً</h2>
            <Link to="/products" className="noon-view-all">
              عرض الكل <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
          </div>

          <div className="noon-services-grid">
            {loading
              ? // Skeleton loaders
                Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="noon-service-card skeleton">
                      <div className="skeleton-image"></div>
                      <div className="skeleton-content">
                        <div className="skeleton-text"></div>
                        <div className="skeleton-text short"></div>
                      </div>
                    </div>
                  ))
              : products.slice(0, 8).map((product) => {
                  const imageUrl = product.image
                    ? getImageUrl(product.image)
                    : null;

                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="noon-service-card"
                    >
                      <div className="noon-service-image">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background:
                                "linear-gradient(135deg, #0A3259 0%, #1a4d80 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#DAA520",
                              fontSize: "3rem",
                            }}
                          >
                            <FontAwesomeIcon icon={faShoppingCart} />
                          </div>
                        )}
                        {product.originalPrice &&
                          product.price < product.originalPrice && (
                            <span className="noon-service-badge">
                              خصم{" "}
                              {Math.round(
                                ((product.originalPrice - product.price) /
                                  product.originalPrice) *
                                  100
                              )}
                              %
                            </span>
                          )}
                      </div>
                      <div className="noon-service-content">
                        <h3 className="noon-service-name">{product.name}</h3>
                        <p className="noon-service-desc">
                          {product.description?.substring(0, 60)}...
                        </p>
                        <div className="noon-service-footer">
                          {product.originalPrice &&
                          product.price < product.originalPrice ? (
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                className="noon-service-price"
                                style={{
                                  textDecoration: "line-through",
                                  opacity: 0.6,
                                  fontSize: "0.85rem",
                                }}
                              >
                                {product.originalPrice} درهم
                              </span>
                              <span className="noon-service-price">
                                {product.price} درهم
                              </span>
                            </div>
                          ) : (
                            <span className="noon-service-price">
                              {product.price} درهم
                            </span>
                          )}
                          <div className="noon-service-rating">
                            <FontAwesomeIcon icon={faStar} />
                            <span>{product.rating?.toFixed(1) || "4.8"}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="noon-promo-section">
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
              <Link to="/services2/categories" className="noon-promo-btn">
                استكشف الخدمات
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* More Services Grid */}
      {services.length > 8 && (
        <section className="noon-services-section">
          <div className="noon-section-container">
            <div className="noon-section-header">
              <h2>المزيد من الخدمات</h2>
              <Link to="/services2/categories" className="noon-view-all">
                عرض الكل <FontAwesomeIcon icon={faArrowLeft} />
              </Link>
            </div>

            <div className="noon-services-grid">
              {services.slice(8, 12).map((service) => {
                const serviceImage = getServiceImage(service);
                const imageUrl = serviceImage
                  ? getImageUrl(serviceImage)
                  : null;

                return (
                  <Link
                    key={service.id}
                    to={`/services2/service/${service.id}`}
                    className="noon-service-card"
                  >
                    <div className="noon-service-image">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={service.name}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background:
                              "linear-gradient(135deg, #0A3259 0%, #1a4d80 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#DAA520",
                            fontSize: "3rem",
                          }}
                        >
                          <FontAwesomeIcon icon={faTools} />
                        </div>
                      )}
                    </div>
                    <div className="noon-service-content">
                      <h3 className="noon-service-name">{service.name}</h3>
                      <p className="noon-service-desc">
                        {service.description?.substring(0, 60)}...
                      </p>
                      <div className="noon-service-footer">
                        {service.base_price && (
                          <span className="noon-service-price">
                            يبدأ من {service.base_price} درهم
                          </span>
                        )}
                        <div className="noon-service-rating">
                          <FontAwesomeIcon icon={faStar} />
                          <span>{service.rating?.toFixed(1) || "4.8"}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* More Products Grid */}
      {products.length > 8 && (
        <section className="noon-services-section">
          <div className="noon-section-container">
            <div className="noon-section-header">
              <h2>المزيد من المنتجات</h2>
              <Link to="/products" className="noon-view-all">
                عرض الكل <FontAwesomeIcon icon={faArrowLeft} />
              </Link>
            </div>

            <div className="noon-services-grid">
              {products.slice(8, 12).map((product) => {
                const imageUrl = product.image
                  ? getImageUrl(product.image)
                  : null;

                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="noon-service-card"
                  >
                    <div className="noon-service-image">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background:
                              "linear-gradient(135deg, #0A3259 0%, #1a4d80 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#DAA520",
                            fontSize: "3rem",
                          }}
                        >
                          <FontAwesomeIcon icon={faShoppingCart} />
                        </div>
                      )}
                      {product.originalPrice &&
                        product.price < product.originalPrice && (
                          <span className="noon-service-badge">
                            خصم{" "}
                            {Math.round(
                              ((product.originalPrice - product.price) /
                                product.originalPrice) *
                                100
                            )}
                            %
                          </span>
                        )}
                    </div>
                    <div className="noon-service-content">
                      <h3 className="noon-service-name">{product.name}</h3>
                      <p className="noon-service-desc">
                        {product.description?.substring(0, 60)}...
                      </p>
                      <div className="noon-service-footer">
                        {product.originalPrice &&
                        product.price < product.originalPrice ? (
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              className="noon-service-price"
                              style={{
                                textDecoration: "line-through",
                                opacity: 0.6,
                                fontSize: "0.85rem",
                              }}
                            >
                              {product.originalPrice} درهم
                            </span>
                            <span className="noon-service-price">
                              {product.price} درهم
                            </span>
                          </div>
                        ) : (
                          <span className="noon-service-price">
                            {product.price} درهم
                          </span>
                        )}
                        <div className="noon-service-rating">
                          <FontAwesomeIcon icon={faStar} />
                          <span>{product.rating?.toFixed(1) || "4.8"}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Categories Grid Section */}
      <section className="noon-categories-grid-section">
        <div className="noon-section-container">
          <div className="noon-section-header">
            <h2>تصفح حسب الفئة</h2>
          </div>

          <div className="noon-categories-grid">
            {categories.slice(0, 6).map((category) => {
              const categoryImage = getCategoryImage(category);
              const imageUrl = categoryImage
                ? getImageUrl(categoryImage)
                : null;
              return (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="noon-category-card"
                >
                  <div className="noon-category-card-image">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={category.name}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : null}
                    {!imageUrl && (
                      <div className="noon-category-card-icon">
                        <FontAwesomeIcon
                          icon={getCategoryIcon(category.name)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="noon-category-card-content">
                    <h3>{category.name}</h3>
                    <span className="noon-category-count">
                      {category.services_count ||
                        category.products_count ||
                        category.subcategories?.length ||
                        0}{" "}
                      {category.services_count ? "خدمة" : "منتج"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="noon-app-section">
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
      <footer className="noon-footer">
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
                <a href="#" aria-label="Facebook">
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
                <a href="#" aria-label="Twitter">
                  <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a href="#" aria-label="Instagram">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="#" aria-label="LinkedIn">
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </a>
                <a href="#" aria-label="WhatsApp">
                  <FontAwesomeIcon icon={faWhatsapp} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="noon-footer-section noon-footer-links">
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
            </div>

            {/* Support */}
            <div className="noon-footer-section noon-footer-links">
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
            </div>

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
                <form onSubmit={handleNewsletterSubmit}>
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
