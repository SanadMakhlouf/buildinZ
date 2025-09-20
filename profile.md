# Service Builder Orders API Documentation

This document outlines the API endpoints available for managing service builder orders.

## Authentication

All endpoints in this document require authentication using Laravel Sanctum. Include your API token in the request header:

```
Authorization: Bearer YOUR_API_TOKEN
```

## Endpoints

### Get All My Service Builder Orders

Retrieves all service builder orders for the authenticated user.

**URL:** `/api/my-service-orders`

**Method:** `GET`

**Response:**

```json
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "order_number": "SB-7X9A2B5D3F",
      "service_name": "Home Cleaning Service",
      "total_amount": 1365,
      "currency": "AED",
      "status": "pending",
      "payment_status": "pending",
      "created_at": "2025-07-25 22:17:07",
      "estimated_delivery": "2025-08-01",
      "has_invoice": true,
      "has_payment_link": true
    },
    {
      "id": 2,
      "order_number": "SB-8Y7B3C9E2D",
      "service_name": "Office Cleaning Service",
      "total_amount": 850,
      "currency": "AED",
      "status": "confirmed",
      "payment_status": "paid",
      "created_at": "2025-07-24 15:30:22",
      "estimated_delivery": "2025-07-31",
      "has_invoice": true,
      "has_payment_link": true
    }
  ]
}
```

### Get Service Builder Order Details

Retrieves detailed information about a specific service builder order.

**URL:** `/api/my-service-orders/{order}`

**Method:** `GET`

**URL Parameters:**
- `order`: The ID of the service builder order

**Response:**

```json
{
  "success": true,
  "order": {
    "id": 1,
    "order_number": "SB-7X9A2B5D3F",
    "service": {
      "id": 1,
      "name": "Home Cleaning Service"
    },
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "0501234567",
    "currency": "AED",
    "subtotal": 1300,
    "tax_amount": 65,
    "shipping_cost": 0,
    "discount_amount": 0,
    "total_amount": 1365,
    "status": "pending",
    "payment_status": "pending",
    "payment_method": "cash_on_delivery",
    "payment_link": "https://checkout.stripe.com/pay/cs_test_...",
    "shipping_address": {
      "street": "123 Main Street",
      "city": "Dubai",
      "state": "",
      "country": "AE",
      "phone": "0501234567",
      "name": "John Doe"
    },
    "billing_address": {
      "street": "123 Main Street",
      "city": "Dubai",
      "state": "",
      "country": "AE",
      "phone": "0501234567",
      "name": "John Doe"
    },
    "notes": "Please deliver in the morning",
    "created_at": "2025-07-25 22:17:07",
    "estimated_delivery": "2025-08-01",
    "has_invoice": true,
    "invoice_number": "INV-SB-20250725001",
    "field_values": [
      {
        "id": 1,
        "name": "Room Size",
        "value": "Large",
        "price_adjustment": 100,
        "option": {
          "id": 3,
          "name": "Large",
          "price_adjustment": 100
        }
      },
      {
        "id": 2,
        "name": "Special Instructions",
        "value": "Clean under the furniture",
        "price_adjustment": 0
      }
    ],
    "product_items": [
      {
        "id": 2,
        "name": "Basic Cleaning",
        "unit_price": 500,
        "quantity": 1,
        "total": 500
      },
      {
        "id": 3,
        "name": "Deep Cleaning",
        "unit_price": 800,
        "quantity": 1,
        "total": 800
      }
    ]
  }
}
```

## Error Responses

### Authentication Error

```json
{
  "message": "Unauthenticated."
}
```

### Permission Error

```json
{
  "success": false,
  "message": "You do not have permission to view this order"
}
```

### Order Not Found

```json
{
  "message": "No query results for model [App\\Models\\ServiceBuilderOrder] {order_id}"
}
``` 