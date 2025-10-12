# Global Search API Documentation

## Overview
The Global Search API allows you to search across services, categories, and products in the BuildingZ platform. It supports Arabic text search and provides flexible filtering options.

**Base URL:** `http://127.0.0.1:8000/api`

**Version:** 1.0

**Last Updated:** October 11, 2025

---

## Endpoint

### Search
Search across services, categories, and products.

**URL:** `/search`

**Method:** `GET`

**Authentication:** Not required (Public endpoint)

**Rate Limiting:** Standard rate limits apply

---

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | **Yes** | - | Search query (supports Arabic and English text) |
| `type` | string | No | `all` | Type of results to return. Options: `all`, `services`, `categories`, `products` |
| `limit` | integer | No | `10` | Maximum number of results per type (1-100) |

---

## Request Examples

### Search All Types (Default)
```http
GET /api/search?q=تصميم واشراف
```

### Search Only Services
```http
GET /api/search?q=تصميم واشراف&type=services&limit=10
```

### Search Only Categories
```http
GET /api/search?q=استشارات&type=categories&limit=5
```

### Search Only Products
```http
GET /api/search?q=دهانات&type=products&limit=20
```

### Search with URL Encoded Arabic Text
```http
GET /api/search?q=%D8%AA%D8%B5%D9%85%D9%8A%D9%85+%D9%88%D8%A7%D8%B4%D8%B1%D8%A7&type=services&limit=10
```

---

## Response Format

### Success Response

**Status Code:** `200 OK`

**Response Body:**

```json
{
    "success": true,
    "query": "تصميم واشراف",
    "type": "all",
    "total_results": 15,
    "results": {
        "services": [
            {
                "id": 33,
                "name": "تصميم واشراف",
                "slug": "tsmym-oashraf",
                "description": "التصاميم المعمارية والإنشائية نقدّم حلولاً متكاملة في التصميم المعماري...",
                "base_price": 0.00,
                "preview_image_path": "http://127.0.0.1:8000/storage/service-builder/services/main-image.jpg",
                "category": {
                    "id": 18,
                    "name": "الاستشارات الهندسية",
                    "slug": "alastsharat-alhndsy"
                },
                "requires_pricing": false,
                "type": "service"
            }
        ],
        "categories": [
            {
                "id": 18,
                "name": "الاستشارات الهندسية",
                "slug": "alastsharat-alhndsy",
                "description": "استشارات هندسية متخصصة",
                "image_path": "http://127.0.0.1:8000/storage/service-builder/categories/category.jpg",
                "services_count": 6,
                "type": "category"
            }
        ],
        "products": [
            {
                "id": 1,
                "name": "دهان جدران",
                "description": "دهان عالي الجودة للجدران",
                "price": 50.00,
                "unit": "متر مربع",
                "image": "http://127.0.0.1:8000/storage/products/paint.jpg",
                "tags": [
                    {
                        "id": 1,
                        "name": "دهانات",
                        "slug": "dhanat"
                    }
                ],
                "type": "product"
            }
        ]
    }
}
```

### Empty Results Response

**Status Code:** `200 OK`

```json
{
    "success": true,
    "query": "nonexistent term",
    "type": "all",
    "total_results": 0,
    "results": {
        "services": [],
        "categories": [],
        "products": []
    }
}
```

### Error Response - Missing Query

**Status Code:** `400 Bad Request`

```json
{
    "success": false,
    "message": "Search query is required",
    "results": []
}
```

---

## Response Fields

### Service Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique service identifier |
| `name` | string | Service name (Arabic/English) |
| `slug` | string | URL-friendly service identifier |
| `description` | string | Service description |
| `base_price` | float | Base price in AED |
| `preview_image_path` | string/null | Full URL to service image |
| `category` | object/null | Category information |
| `category.id` | integer | Category ID |
| `category.name` | string | Category name |
| `category.slug` | string | Category slug |
| `requires_pricing` | boolean | Whether service requires pricing |
| `type` | string | Always "service" |

### Category Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique category identifier |
| `name` | string | Category name (Arabic/English) |
| `slug` | string | URL-friendly category identifier |
| `description` | string/null | Category description |
| `image_path` | string/null | Full URL to category image |
| `services_count` | integer | Number of active services in category |
| `type` | string | Always "category" |

### Product Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique product identifier |
| `name` | string | Product name (Arabic/English) |
| `description` | string/null | Product description |
| `price` | float | Product price in AED |
| `unit` | string | Unit of measurement |
| `image` | string/null | Full URL to product image |
| `tags` | array | Array of product tags |
| `tags[].id` | integer | Tag ID |
| `tags[].name` | string | Tag name |
| `tags[].slug` | string | Tag slug |
| `type` | string | Always "product" |

---

## Search Behavior

### Search Algorithm
The search API uses **LIKE** pattern matching to search across multiple fields:

**Services:**
- Service name
- Service description
- Service slug

**Categories:**
- Category name
- Category description
- Category slug

**Products:**
- Product name
- Product description

### Arabic Text Support
- ✅ Full support for Arabic characters
- ✅ Automatic handling of URL-encoded Arabic text
- ✅ Partial word matching
- ✅ Case-insensitive search

### Result Ordering
- **Services:** Ordered by `sort_order` (admin-defined priority)
- **Categories:** Ordered by `sort_order` (admin-defined priority)
- **Products:** Ordered alphabetically by name

### Filtering
- Only **active** services are included in results
- Only **active** products are included in results
- All categories are searchable regardless of status
- Results are limited by the `limit` parameter per type

---

## Usage Examples

### JavaScript/Fetch
```javascript
// Search for services
fetch('http://127.0.0.1:8000/api/search?q=تصميم&type=services&limit=10')
  .then(response => response.json())
  .then(data => {
    console.log('Found services:', data.results.services);
  });
```

### cURL
```bash
# Search all types
curl "http://127.0.0.1:8000/api/search?q=تصميم+واشراف"

# Search only services with limit
curl "http://127.0.0.1:8000/api/search?q=استشارات&type=services&limit=5"
```

### Axios (JavaScript)
```javascript
import axios from 'axios';

const searchServices = async (query) => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/search', {
      params: {
        q: query,
        type: 'services',
        limit: 10
      }
    });
    return response.data.results.services;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

// Usage
const results = await searchServices('تصميم');
```

### PHP (Laravel HTTP Client)
```php
use Illuminate\Support\Facades\Http;

$response = Http::get('http://127.0.0.1:8000/api/search', [
    'q' => 'تصميم واشراف',
    'type' => 'services',
    'limit' => 10
]);

$results = $response->json();
```

---

## Best Practices

1. **Always URL-encode query parameters**, especially for Arabic text
2. **Use the `type` parameter** to limit results to specific types for better performance
3. **Set appropriate `limit` values** (default is 10, max recommended is 100)
4. **Cache search results** on the frontend to reduce API calls
5. **Implement debouncing** for real-time search to avoid excessive requests
6. **Handle empty results gracefully** in your UI

---

## Common Use Cases

### 1. Auto-complete Search Bar
```javascript
let searchTimeout;

function handleSearchInput(query) {
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(() => {
    if (query.length >= 2) {
      fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`)
        .then(res => res.json())
        .then(data => displaySuggestions(data.results));
    }
  }, 300); // Debounce for 300ms
}
```

### 2. Category-Specific Search
```javascript
function searchInCategory(categoryId, query) {
  // First search for matching services
  fetch(`/api/search?q=${encodeURIComponent(query)}&type=services&limit=20`)
    .then(res => res.json())
    .then(data => {
      // Filter by category on the frontend
      const filtered = data.results.services.filter(
        service => service.category && service.category.id === categoryId
      );
      displayResults(filtered);
    });
}
```

### 3. Unified Search Results Page
```javascript
async function performUnifiedSearch(query) {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=all&limit=10`);
  const data = await response.json();
  
  return {
    services: data.results.services || [],
    categories: data.results.categories || [],
    products: data.results.products || [],
    total: data.total_results
  };
}
```

---

## Performance Notes

- **Response Time:** < 200ms for typical queries
- **Recommended Limit:** 10-20 items per type for optimal performance
- **Caching:** Results are not cached on the server; implement client-side caching as needed
- **Database:** Uses optimized indexes on `name`, `slug`, and `description` fields

---

## Error Handling

| Status Code | Error Type | Description | Solution |
|-------------|-----------|-------------|----------|
| 400 | Bad Request | Missing or invalid query parameter | Ensure `q` parameter is provided and not empty |
| 429 | Too Many Requests | Rate limit exceeded | Implement request throttling on client side |
| 500 | Internal Server Error | Server error | Contact support if persistent |

---

## Changelog

### Version 1.0 (October 11, 2025)
- Initial release
- Support for services, categories, and products search
- Arabic text support
- Flexible filtering with `type` parameter
- Configurable result limits

---

## Support

For issues or questions regarding the Search API, please contact:
- **Email:** support@buildingz.com
- **Documentation:** https://docs.buildingz.com/api/search

---

## Related Endpoints

- [Service Builder Services API](./SERVICE_BUILDER_SERVICES_API.md)
- [Categories API](./SERVICE_BUILDER_SERVICES_API.md#categories)
- [Products API](./SERVICE_BUILDER_SERVICES_API.md#products)
