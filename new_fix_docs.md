# Product Features Documentation

This document describes the product-related features implemented in the BuildingZ backend, including product variants, delivery settings, image handling, and admin dashboard enhancements.

---

## Table of Contents

1. [Product Variants (Color/Size with Dynamic Pricing)](#1-product-variants-colorsize-with-dynamic-pricing)
2. [Delivery Lead Time & Free Delivery](#2-delivery-lead-time--free-delivery)
3. [Image Access & Media URLs](#3-image-access--media-urls)
4. [Interactive Summary Cards](#4-interactive-summary-cards)
5. [API Reference](#5-api-reference)

---

## 1. Product Variants (Color/Size with Dynamic Pricing)

### Overview

Products can have multiple variants (e.g., different colors, sizes) with individual prices, SKUs, and stock levels. This allows a single product to display options like "White/Black" or "200×160 cm" with different prices per option.

### Database Schema

**Table: `product_variants`**

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| product_id | bigint | Foreign key to products |
| sku | string | Variant-specific SKU (optional) |
| price | decimal(10,2) | Price for this variant |
| stock_quantity | integer | Stock for this variant |
| variant_attributes | json | e.g. `{"color": "Black", "size": "200x160"}` |
| images | json | Variant-specific image URLs |
| sort_order | integer | Display order |
| created_at, updated_at | timestamp | Timestamps |

### Model: ProductVariant

```php
// Access variant attributes
$variant->getAttributeValue('color');  // "Black"
$variant->getAttributeValue('size');   // "200x160"
$variant->color;  // Shorthand for color attribute
$variant->size;   // Shorthand for size attribute
```

### API Usage

**Create product with variants (Admin API):**

```json
POST /api/admin/products
{
  "name": "TUFJORD Bed Frame",
  "category_id": 1,
  "vendor_profile_id": 1,
  "price": 1995,
  "stock_quantity": 0,
  "sku": "BED-TUF-001",
  "description": "Upholstered bed frame",
  "variants": [
    {
      "sku": "BED-TUF-WHITE-200",
      "price": 1995,
      "stock_quantity": 10,
      "variant_attributes": {
        "color": "White/Black",
        "size": "200x160"
      }
    },
    {
      "sku": "BED-TUF-BLACK-200",
      "price": 2100,
      "stock_quantity": 5,
      "variant_attributes": {
        "color": "Black",
        "size": "200x160"
      }
    }
  ]
}
```

**Product response includes variants:**

```json
{
  "product": {
    "id": 1,
    "name": "TUFJORD Bed Frame",
    "price": 1995,
    "variants": [
      {
        "id": 1,
        "sku": "BED-TUF-WHITE-200",
        "price": 1995,
        "formatted_price": "1,995.00 AED",
        "stock_quantity": 10,
        "attributes": {"color": "White/Black", "size": "200x160"},
        "color": "White/Black",
        "size": "200x160",
        "images": []
      }
    ]
  }
}
```

### Frontend Integration

When the user selects a variant (color or size), the frontend should:
1. Update the displayed price from `variant.price`
2. Update availability from `variant.stock_quantity`
3. Optionally switch images from `variant.images` if available

---

## 2. Delivery Lead Time & Free Delivery

### Overview

- **Delivery Lead Time**: Admin sets the number of days from order to delivery. The system calculates the estimated delivery date automatically from today.
- **Free Delivery**: Products can be marked as free delivery (توصيل مجاني), shown as a badge on the product card.

### Database Schema

**Products table additions:**

| Column | Type | Description |
|--------|------|-------------|
| delivery_lead_days | integer (nullable) | Days from order to delivery |
| is_free_delivery | boolean | Default: false |

### Admin Panel

In **Products → Create/Edit**, under "Delivery & Shipping":
- **Delivery Lead Time (days)**: e.g., `3` = delivery in 3 days from today
- **Free delivery (توصيل مجاني)**: Checkbox to mark product as free delivery

### API Response

```json
{
  "product": {
    "delivery_lead_days": 3,
    "is_free_delivery": true,
    "estimated_delivery_date": "2026-03-05"
  }
}
```

- `estimated_delivery_date`: Calculated as `today + delivery_lead_days` (null if not set)
- `is_free_delivery`: Boolean for displaying the free delivery badge

---

## 3. Image Access & Media URLs

### Overview

Product images are stored in the media library. The system ensures correct URLs for all environments.

### URL Generation

- **Public disk**: Uses `asset('storage/' . path)` for reliable URLs
- **Other disks**: Uses `Storage::disk()->url(path)`

### Media URL Endpoint

If you need to resolve a media URL by ID:

```
GET /api/media/{id}/url
```

**Response:**
```json
{
  "success": true,
  "url": "http://localhost:8000/storage/media/product/abc123.webp",
  "thumbnail_url": "http://localhost:8000/storage/media/product/abc123_thumb.webp"
}
```

### Storage Setup

Ensure the storage symlink exists:
```bash
php artisan storage:link
```

---

## 4. Interactive Summary Cards

### Overview

On the **Products Management** page (`/admin/products`), the summary cards are clickable and filter the product list below.

### Card Behavior

| Card | Action |
|------|--------|
| **Total Products** | Shows all products (clears filter) |
| **Active Products** | Filters to active, non-archived products |
| **Low Stock** | Filters to products with stock < 10 |
| **Categories** | Navigates to Categories management page |

### URL Parameters

- `status=active` – Active products only
- `status=low_stock` – Low stock products (stock < 10)
- `status=out_of_stock` – Out of stock (stock = 0)
- `status=inactive` – Inactive products

### Stats Calculation

Stats (Total, Active, Low Stock) are calculated from the **full dataset**, not the current page, so the numbers are accurate regardless of filters.

---

## 5. API Reference

### Product Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (public) |
| GET | `/api/products/{id}` | Get product with variants, delivery info |
| GET | `/api/admin/products` | Admin: list with filters |
| POST | `/api/admin/products` | Admin: create with variants |
| PUT | `/api/admin/products/{id}` | Admin: update with variants |

### Product Request Body (Create/Update)

```json
{
  "name": "string (required)",
  "category_id": "integer (required)",
  "vendor_profile_id": "integer (required)",
  "description": "string (required)",
  "price": "number (required)",
  "stock_quantity": "integer (required)",
  "sku": "string (required, unique)",
  "sku_2": "string (optional)",
  "material": "string (optional)",
  "color": "string (optional)",
  "delivery_lead_days": "integer (optional)",
  "is_free_delivery": "boolean (optional)",
  "variants": [
    {
      "sku": "string (optional)",
      "price": "number (required)",
      "stock_quantity": "integer (optional)",
      "variant_attributes": {"color": "...", "size": "..."},
      "images": [],
      "sort_order": "integer (optional)"
    }
  ]
}
```

### Product Response (with new fields)

```json
{
  "id": 1,
  "name": "...",
  "price": 1995,
  "delivery_lead_days": 3,
  "is_free_delivery": true,
  "estimated_delivery_date": "2026-03-05",
  "variants": [...],
  "image_urls": [...],
  "primary_image_url": "...",
  "availability_status": "10",
  "is_available_for_purchase": true,
  "formatted_price": "1,995.00 AED"
}
```

---

## Migrations

Run migrations to apply schema changes:

```bash
php artisan migrate
```

**New migrations:**
- `2026_03_02_000001_create_product_variants_table`
- `2026_03_02_000002_add_delivery_fields_to_products_table`

---

## Category Navigation Arrows (Frontend)

The horizontal category list (e.g., on the home screen) should include **left/right navigation arrows** for easier scrolling on laptops. This is a frontend-only change; the categories API (`GET /api/categories`) already returns the data needed. The frontend should implement arrow buttons that scroll the category list horizontally.
