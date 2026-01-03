import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faTools,
  faWrench,
  faPaintRoller,
  faBolt,
  faWater,
  faCouch,
  faHammer,
  faCog,
  faLeaf,
} from "@fortawesome/free-solid-svg-icons";
import config from "../config/apiConfig";

const CategoryCarousel = ({
  categories = [],
  loading = false,
  onCategoryClick,
}) => {
  const categoryScrollRef = useRef(null);

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
    if (
      !imagePath ||
      imagePath === "" ||
      imagePath === null ||
      imagePath === undefined
    ) {
      return null;
    }
    if (imagePath.startsWith("http")) {
      if (cacheBust) {
        const separator = imagePath.includes("?") ? "&" : "?";
        return `${imagePath}${separator}v=${cacheBust}`;
      }
      return imagePath;
    }
    if (imagePath.startsWith("categories/")) {
      const fullUrl = config.utils.getImageUrl(imagePath);
      if (cacheBust) {
        const separator = fullUrl.includes("?") ? "&" : "?";
        return `${fullUrl}${separator}v=${cacheBust}`;
      }
      return fullUrl;
    }
    if (imagePath.startsWith("/")) {
      return `${config.BACKEND_URL}${imagePath}`;
    }
    return `${config.BACKEND_URL}/storage/${imagePath}`;
  };

  // Get category image helper
  const getCategoryImage = (category) => {
    if (category.image) {
      return category.image;
    }
    return (
      category.image_path ||
      category.preview_image_path ||
      category.preview_image_url ||
      category.image_url ||
      null
    );
  };

  const handleCategoryClick = (category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  return (
    <section className="noon-categories-section" aria-label="الفئات">
      <div className="noon-section-container">
        <div className="noon-categories-wrapper">
          <div className="noon-categories-scroll" ref={categoryScrollRef}>
            {loading ? (
              // Skeleton loaders - same as homepage
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
                const cacheBust = category.updated_at
                  ? new Date(category.updated_at).getTime()
                  : category.created_at
                  ? new Date(category.created_at).getTime()
                  : null;
                const imageUrl = categoryImage
                  ? getImageUrl(categoryImage, cacheBust)
                  : null;
                const categoryKey = `${category.id}-${
                  category.updated_at || category.created_at || ""
                }`;

                return (
                  <Link
                    key={categoryKey}
                    to={`/products?category=${category.id}`}
                    className="noon-category-item"
                    onClick={() => handleCategoryClick(category)}
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
                            e.target.style.opacity = "1";
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            const parent = e.target.parentElement;
                            const existingIcon = parent.querySelector("svg");
                            if (
                              !existingIcon ||
                              !existingIcon.classList.contains("fa-icon")
                            ) {
                              const nonFaIcons =
                                parent.querySelectorAll("svg:not(.fa-icon)");
                              nonFaIcons.forEach((icon) => icon.remove());
                            }
                          }}
                        />
                      ) : null}
                      {!imageUrl && (
                        <FontAwesomeIcon icon={getCategoryIcon(category.name)} />
                      )}
                    </div>
                    <span className="noon-category-name">{category.name}</span>
                  </Link>
                );
              })
            ) : (
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#666",
                }}
              >
                <p>لا توجد فئات متاحة حالياً</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;
