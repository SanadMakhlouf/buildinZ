# Advertisement API Documentation

## Overview

The Advertisement API allows you to fetch active advertisements for display on your frontend. All endpoints are public and don't require authentication.

## Base URL

```
http://localhost:8000/api
```

## Endpoints

### 1. Get All Active Advertisements

Get all active advertisements (filtered by active status and date range).

**Endpoint:** `GET /api/advertisements`

**Query Parameters:**
- `position` (optional) - Filter by position: `home_banner`, `sidebar`, `footer`, `popup`, `custom`

**Example Request:**
```bash
GET /api/advertisements
GET /api/advertisements?position=home_banner
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Summer Sale",
      "description": "50% off all items",
      "image_url": "http://localhost:8000/storage/advertisements/desktop-uuid.webp",
      "mobile_image_url": "http://localhost:8000/storage/advertisements/mobile-uuid.webp",
      "link": "https://example.com/sale",
      "position": "home_banner",
      "sort_order": 0,
      "start_date": null,
      "end_date": null,
      "created_at": "2025-12-08T10:00:00.000000Z",
      "updated_at": "2025-12-08T10:00:00.000000Z"
    }
  ],
  "count": 1
}
```

### 2. Get Advertisements by Position

Get active advertisements filtered by a specific position.

**Endpoint:** `GET /api/advertisements/position/{position}`

**Position Values:**
- `home_banner` - For homepage banners
- `sidebar` - For sidebar advertisements
- `footer` - For footer advertisements
- `popup` - For popup/modal advertisements
- `custom` - For custom positions

**Example Request:**
```bash
GET /api/advertisements/position/home_banner
GET /api/advertisements/position/sidebar
GET /api/advertisements/position/footer
GET /api/advertisements/position/popup
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Summer Sale",
      "description": "50% off all items",
      "image_url": "http://localhost:8000/storage/advertisements/desktop-uuid.webp",
      "mobile_image_url": "http://localhost:8000/storage/advertisements/mobile-uuid.webp",
      "link": "https://example.com/sale",
      "position": "home_banner",
      "sort_order": 0,
      "start_date": null,
      "end_date": null
    }
  ],
  "count": 1
}
```

## Frontend Usage Examples

### JavaScript (Fetch API)

```javascript
// Get all advertisements
async function getAllAdvertisements() {
  try {
    const response = await fetch('http://localhost:8000/api/advertisements');
    const result = await response.json();
    
    if (result.success) {
      console.log('Advertisements:', result.data);
      return result.data;
    }
  } catch (error) {
    console.error('Error fetching advertisements:', error);
  }
}

// Get home banner advertisements
async function getHomeBanners() {
  try {
    const response = await fetch('http://localhost:8000/api/advertisements/position/home_banner');
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
  } catch (error) {
    console.error('Error fetching banners:', error);
  }
}

// Get sidebar advertisements
async function getSidebarAds() {
  try {
    const response = await fetch('http://localhost:8000/api/advertisements/position/sidebar');
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
  } catch (error) {
    console.error('Error fetching sidebar ads:', error);
  }
}

// Get appropriate image based on device
function getAdImage(advertisement, isMobile = false) {
  if (isMobile) {
    return advertisement.mobile_image_url || advertisement.image_url;
  }
  return advertisement.image_url;
}

// Usage example
const ads = await getHomeBanners();
const isMobile = window.innerWidth <= 768;
ads.forEach(ad => {
  const imageUrl = getAdImage(ad, isMobile);
  console.log('Use this image:', imageUrl);
});
```

### React Example

```jsx
import { useState, useEffect } from 'react';

function AdvertisementBanner() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdvertisements() {
      try {
        const response = await fetch('http://localhost:8000/api/advertisements/position/home_banner');
        const result = await response.json();
        
        if (result.success) {
          setAdvertisements(result.data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAdvertisements();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (advertisements.length === 0) return null;

  return (
    <div className="advertisement-banner">
      {advertisements.map((ad) => (
        <a
          key={ad.id}
          href={ad.link || '#'}
          target={ad.link ? '_blank' : '_self'}
          rel="noopener noreferrer"
        >
          {/* Responsive image with mobile and desktop versions */}
          <picture>
            {/* Mobile image */}
            <source 
              media="(max-width: 768px)" 
              srcSet={ad.mobile_image_url || ad.image_url} 
            />
            {/* Desktop image */}
            <img
              src={ad.image_url}
              alt={ad.title || 'Advertisement'}
              className="w-full h-auto"
            />
          </picture>
          {ad.title && <h3>{ad.title}</h3>}
          {ad.description && <p>{ad.description}</p>}
        </a>
      ))}
    </div>
  );
}

export default AdvertisementBanner;
```

### Vue.js Example

```vue
<template>
  <div class="advertisement-sidebar">
    <div v-if="loading">Loading...</div>
    <div v-else-if="advertisements.length === 0">No advertisements</div>
    <div v-else>
      <a
        v-for="ad in advertisements"
        :key="ad.id"
        :href="ad.link || '#'"
        :target="ad.link ? '_blank' : '_self'"
        rel="noopener noreferrer"
        class="ad-item"
      >
        <img :src="ad.image_url" :alt="ad.title || 'Advertisement'" />
        <h3 v-if="ad.title">{{ ad.title }}</h3>
        <p v-if="ad.description">{{ ad.description }}</p>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      advertisements: [],
      loading: true
    };
  },
  async mounted() {
    try {
      const response = await fetch('http://localhost:8000/api/advertisements/position/sidebar');
      const result = await response.json();
      
      if (result.success) {
        this.advertisements = result.data;
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.loading = false;
    }
  }
};
</script>
```

### jQuery Example

```javascript
// Get home banner advertisements
$.ajax({
  url: 'http://localhost:8000/api/advertisements/position/home_banner',
  method: 'GET',
  success: function(response) {
    if (response.success) {
      response.data.forEach(function(ad) {
        var isMobile = window.innerWidth <= 768;
        var imageUrl = isMobile ? (ad.mobile_image_url || ad.image_url) : ad.image_url;
        
        var adHtml = `
          <a href="${ad.link || '#'}" target="${ad.link ? '_blank' : '_self'}">
            <picture>
              ${ad.mobile_image_url ? `<source media="(max-width: 768px)" srcset="${ad.mobile_image_url}" />` : ''}
              <img src="${ad.image_url}" alt="${ad.title || 'Advertisement'}" />
            </picture>
            ${ad.title ? '<h3>' + ad.title + '</h3>' : ''}
            ${ad.description ? '<p>' + ad.description + '</p>' : ''}
          </a>
        `;
        $('#advertisement-container').append(adHtml);
      });
    }
  },
  error: function(error) {
    console.error('Error fetching advertisements:', error);
  }
});
```

### Axios Example

```javascript
import axios from 'axios';

// Get all advertisements
async function getAdvertisements() {
  try {
    const response = await axios.get('http://localhost:8000/api/advertisements');
    return response.data.data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Get by position with query parameter
async function getAdvertisementsByPosition(position) {
  try {
    const response = await axios.get('http://localhost:8000/api/advertisements', {
      params: { position: position }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Get appropriate image URL based on device
function getImageUrl(advertisement, isMobile = false) {
  if (isMobile && advertisement.mobile_image_url) {
    return advertisement.mobile_image_url;
  }
  return advertisement.image_url;
}

// Usage
const homeBanners = await getAdvertisementsByPosition('home_banner');
const sidebarAds = await getAdvertisementsByPosition('sidebar');

// Display with responsive images
homeBanners.forEach(ad => {
  const isMobile = window.innerWidth <= 768;
  const imageUrl = getImageUrl(ad, isMobile);
  // Use imageUrl in your component
});
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Advertisement ID |
| `title` | string\|null | Advertisement title |
| `description` | string\|null | Advertisement description |
| `image_url` | string | Full URL to the desktop/laptop advertisement image |
| `mobile_image_url` | string\|null | Full URL to the mobile advertisement image (null if not uploaded) |
| `link` | string\|null | Optional link URL (when clicked) |
| `position` | string | Position: `home_banner`, `sidebar`, `footer`, `popup`, `custom` |
| `sort_order` | integer | Sort order (lower numbers appear first) |
| `start_date` | string\|null | ISO 8601 date string (when advertisement should start) |
| `end_date` | string\|null | ISO 8601 date string (when advertisement should end) |
| `created_at` | string | ISO 8601 timestamp |
| `updated_at` | string | ISO 8601 timestamp |

## Notes

1. **Active Filtering**: Only advertisements with `is_active = true` and within their date range (if set) are returned.

2. **Sorting**: Advertisements are sorted by `sort_order` (ascending) and then by `created_at` (descending).

3. **Image URLs**: 
   - `image_url`: Full URL for desktop/laptop images (always present, required)
   - `mobile_image_url`: Full URL for mobile images (null if not uploaded, fallback to `image_url`)
   - All image URLs are full URLs that can be used directly in `<img>` tags or `<picture>` elements
   - **Best Practice**: Use HTML5 `<picture>` element for responsive images:
     ```html
     <picture>
       <source media="(max-width: 768px)" srcset="mobile_image_url || image_url" />
       <img src="image_url" alt="Advertisement" />
     </picture>
     ```

4. **Mobile Image Fallback**: If `mobile_image_url` is `null`, always use `image_url` for mobile devices. This ensures your advertisements always display correctly.

5. **Links**: If an advertisement has a `link`, you should make it clickable. If `link` is `null`, you can still display the image but it won't be clickable.

6. **Positions**: Use appropriate positions for different parts of your frontend:
   - `home_banner` - Main banner on homepage
   - `sidebar` - Sidebar advertisements
   - `footer` - Footer advertisements
   - `popup` - Popup/modal advertisements
   - `custom` - Custom positions

7. **Admin Dashboard**: When creating advertisements in the admin dashboard:
   - **Desktop/Laptop Image**: Required - This is the main image for desktop and laptop screens
   - **Mobile Image**: Optional - If not provided, the desktop image will be used for mobile devices

## Error Handling

If there's an error, the API will return a standard error response:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Always check the `success` field before using the data.

## CORS

If you're making requests from a different domain, make sure CORS is configured in your Laravel application. Check `config/cors.php` for CORS settings.
s