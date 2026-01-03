import React from 'react';
import { Helmet } from 'react-helmet';

const SITE_NAME = 'BuildingZ';
const SITE_URL = 'https://buildingzuae.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_DESCRIPTION = 'أكبر متجر إلكتروني لمواد البناء والديكور في الإمارات. تسوق الأثاث، الأدوات، مواد البناء مع توصيل سريع لجميع أنحاء الإمارات.';

/**
 * SEO Component for consistent meta tags across the site
 * @param {Object} props - SEO properties
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.keywords - Page keywords (comma-separated)
 * @param {string} props.image - Open Graph image URL
 * @param {string} props.url - Canonical URL
 * @param {string} props.type - Open Graph type (website, product, article)
 * @param {Object} props.product - Product data for product pages
 * @param {Object} props.breadcrumb - Breadcrumb data
 * @param {boolean} props.noindex - Whether to add noindex
 */
const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = '',
  image = DEFAULT_IMAGE,
  url = '',
  type = 'website',
  product = null,
  breadcrumb = null,
  noindex = false,
  children
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - متجر مواد البناء والديكور في الإمارات`;
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  
  const defaultKeywords = 'مواد بناء, ديكور, أثاث, الإمارات, أبوظبي, دبي, متجر أونلاين, BuildingZ, بيلدنج زد';
  const fullKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  // Generate Product JSON-LD
  const generateProductSchema = () => {
    if (!product) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description || description,
      "image": product.images || [fullImage],
      "sku": product.sku || product.id,
      "brand": {
        "@type": "Brand",
        "name": product.brand || product.vendor || "BuildingZ"
      },
      "offers": {
        "@type": "Offer",
        "url": fullUrl,
        "priceCurrency": "AED",
        "price": product.price,
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "availability": product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": product.vendor || "BuildingZ UAE"
        }
      },
      ...(product.rating && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": product.rating,
          "reviewCount": product.reviewCount || 1,
          "bestRating": "5",
          "worstRating": "1"
        }
      })
    };
  };

  // Generate Breadcrumb JSON-LD
  const generateBreadcrumbSchema = () => {
    if (!breadcrumb || !breadcrumb.length) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumb.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url ? `${SITE_URL}${item.url}` : undefined
      }))
    };
  };

  const productSchema = generateProductSchema();
  const breadcrumbSchema = generateBreadcrumbSchema();

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={fullKeywords} />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ar_AE" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Product specific OG tags */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content="AED" />
          {product.inStock !== false && (
            <meta property="product:availability" content="in stock" />
          )}
        </>
      )}
      
      {/* JSON-LD Structured Data */}
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
      
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      
      {children}
    </Helmet>
  );
};

export default SEO;

