# Expected Delivery

How product delivery expectations work in admin and API.

---

## Admin

**Where:** Product Create / Edit → Expected Delivery section

| Field | Description |
|-------|-------------|
| **Min days** | Minimum days from order to delivery (e.g. 3) |
| **Max days** | Optional. For ranges (e.g. 4 → "3-4 days") |
| **Free delivery** | Checkbox for free shipping badge |

**Product list:** Shows delivery text (e.g. "3 days", "3-4 days") and Free badge.

---

## API

**Endpoints:** `GET /api/products`, `GET /api/products/{id}`

| Field | Type | Example |
|-------|------|---------|
| `delivery_lead_days` | int \| null | 3 |
| `delivery_lead_days_max` | int \| null | 4 |
| `expected_delivery_text` | string \| null | "3-4 days" |
| `is_free_delivery` | bool | true |
| `estimated_delivery_date` | string \| null | "2026-03-06" |

**Examples:**

| Min | Max | expected_delivery_text |
|-----|-----|------------------------|
| 3 | — | "3 days" |
| 3 | 4 | "3-4 days" |
| 1 | — | "1 day" |

---

## Database

- `delivery_lead_days` – min days
- `delivery_lead_days_max` – max days (optional)
- `is_free_delivery` – boolean
