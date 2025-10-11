# Notification API Documentation

This document describes the comprehensive notification system implemented for the BuildingZ backend API.

## Overview

The notification system provides two main API groups:

1. **User Notifications API** - For managing user notifications and preferences
2. **Admin Notifications API** - For admin management of notifications and bulk messaging

## Base URLs

- **User Notifications**: `GET /api/notifications/`
- **Admin Notifications**: `GET /api/admin/notifications/`

---

## 1. User Notifications API

### Authentication Required
All user notification endpoints require authentication via Sanctum token.

### 1.1 Get All Notifications

**Endpoint:** `GET /api/notifications/`

**Description:** Retrieve all notifications for the authenticated user with pagination and filtering.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 15 | Items per page (max: 50) |
| `type` | string | 'all' | Filter: 'all', 'unread', 'read' |

#### Example Request

```bash
GET /api/notifications?page=1&limit=10&type=unread
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "type": "App\\Notifications\\OrderConfirmationNotification",
      "data": {
        "order_id": 123,
        "order_number": "ORD-001",
        "message": "Your order #ORD-001 has been confirmed."
      },
      "read_at": null,
      "created_at": "2024-01-15T10:30:00.000000Z",
      "is_read": false
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "unread_count": 5
  }
}
```

### 1.2 Get Unread Count

**Endpoint:** `GET /api/notifications/unread-count`

**Description:** Get the count of unread notifications.

#### Response

```json
{
  "success": true,
  "unread_count": 5
}
```

### 1.3 Mark Notification as Read

**Endpoint:** `POST /api/notifications/mark-read`

**Description:** Mark a specific notification as read.

#### Request Body

```json
{
  "notification_id": "uuid-string"
}
```

#### Response

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### 1.4 Mark All Notifications as Read

**Endpoint:** `POST /api/notifications/mark-all-read`

**Description:** Mark all notifications for the user as read.

#### Response

```json
{
  "success": true,
  "message": "All notifications marked as read",
  "updated_count": 5
}
```

### 1.5 Delete Notification

**Endpoint:** `DELETE /api/notifications/delete`

**Description:** Delete a specific notification.

#### Request Body

```json
{
  "notification_id": "uuid-string"
}
```

#### Response

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

### 1.6 Clear All Notifications

**Endpoint:** `DELETE /api/notifications/clear-all`

**Description:** Delete all notifications for the user.

#### Response

```json
{
  "success": true,
  "message": "All notifications cleared",
  "deleted_count": 25
}
```

### 1.7 Get Notification Preferences

**Endpoint:** `GET /api/notifications/preferences`

**Description:** Get user's notification preferences.

#### Response

```json
{
  "success": true,
  "preferences": {
    "id": 1,
    "user_id": 123,
    "order_confirmation_email": true,
    "order_confirmation_push": true,
    "order_status_email": true,
    "order_status_push": true,
    "handyman_assigned_email": true,
    "handyman_assigned_push": true,
    "service_completed_email": true,
    "service_completed_push": true,
    "marketing_email": false,
    "marketing_push": false,
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-01-15T10:30:00.000000Z"
  }
}
```

### 1.8 Update Notification Preferences

**Endpoint:** `PUT /api/notifications/preferences`

**Description:** Update user's notification preferences.

#### Request Body

```json
{
  "order_confirmation_email": true,
  "order_confirmation_push": false,
  "order_status_email": true,
  "order_status_push": true,
  "handyman_assigned_email": true,
  "handyman_assigned_push": false,
  "service_completed_email": true,
  "service_completed_push": true,
  "marketing_email": false,
  "marketing_push": false
}
```

#### Response

```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "preferences": {
    // Updated preferences object
  }
}
```

### 1.9 Send Test Notification

**Endpoint:** `POST /api/notifications/test`

**Description:** Send a test notification to verify the system is working.

#### Response

```json
{
  "success": true,
  "message": "Test notification sent successfully"
}
```

---

## 2. Admin Notifications API

### Authentication Required
All admin notification endpoints require admin role authentication.

### 2.1 Get All Admin Notifications

**Endpoint:** `GET /api/admin/notifications/`

**Description:** Retrieve all admin notifications with pagination and filtering.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 15 | Items per page (max: 50) |
| `type` | string | 'all' | Filter: 'all', 'unread', 'read' |
| `user_id` | integer | null | Filter by specific user |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 123,
      "title": "New Order Received",
      "message": "Order #ORD-001 has been placed",
      "type": "info",
      "icon": "shopping-cart",
      "color": "blue",
      "action_text": "View Order",
      "action_url": "/admin/orders/123",
      "read": false,
      "read_at": null,
      "created_at": "2024-01-15T10:30:00.000000Z",
      "user": {
        "id": 123,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 15,
    "unread_count": 12
  }
}
```

### 2.2 Create Admin Notification

**Endpoint:** `POST /api/admin/notifications/`

**Description:** Create a new admin notification.

#### Request Body

```json
{
  "title": "System Maintenance",
  "message": "Scheduled maintenance will occur tonight from 2-4 AM",
  "type": "warning",
  "user_id": 123,
  "action_text": "View Details",
  "action_url": "/admin/maintenance",
  "icon": "wrench",
  "color": "yellow"
}
```

#### Response

```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    // Created notification object
  }
}
```

### 2.3 Send Notifications to Users

**Endpoint:** `POST /api/admin/notifications/send-to-users`

**Description:** Send notifications to specific users or all users (for marketing).

#### Request Body (Specific Users)

```json
{
  "title": "Special Offer",
  "message": "Get 20% off your next order!",
  "type": "marketing",
  "user_ids": [1, 2, 3, 4, 5],
  "action_text": "Shop Now",
  "action_url": "/products"
}
```

#### Request Body (Marketing to All Users)

```json
{
  "title": "New Product Launch",
  "message": "Check out our latest products!",
  "type": "marketing",
  "send_to_all": true,
  "action_text": "Browse Products",
  "action_url": "/products"
}
```

#### Response

```json
{
  "success": true,
  "message": "Notifications sent successfully",
  "sent_count": 150
}
```

### 2.4 Mark Admin Notification as Read

**Endpoint:** `PUT /api/admin/notifications/{id}/mark-read`

**Description:** Mark a specific admin notification as read.

#### Response

```json
{
  "success": true,
  "message": "Notification marked as read",
  "unread_count": 11
}
```

### 2.5 Mark All Admin Notifications as Read

**Endpoint:** `POST /api/admin/notifications/mark-all-read`

**Description:** Mark all admin notifications as read.

#### Response

```json
{
  "success": true,
  "message": "All notifications marked as read",
  "updated_count": 12
}
```

### 2.6 Delete Admin Notification

**Endpoint:** `DELETE /api/admin/notifications/{id}`

**Description:** Delete a specific admin notification.

#### Response

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

### 2.7 Clear All Admin Notifications

**Endpoint:** `DELETE /api/admin/notifications/clear-all`

**Description:** Delete all admin notifications.

#### Response

```json
{
  "success": true,
  "message": "All notifications cleared"
}
```

### 2.8 Get Notification Statistics

**Endpoint:** `GET /api/admin/notifications/statistics`

**Description:** Get comprehensive notification statistics.

#### Response

```json
{
  "success": true,
  "statistics": {
    "total": 1250,
    "unread": 45,
    "read": 1205,
    "by_type": {
      "info": 800,
      "success": 300,
      "warning": 100,
      "error": 50
    },
    "today": 25,
    "this_week": 150,
    "this_month": 500
  }
}
```

---

## 3. Notification Types and Data Structure

### 3.1 Available Notification Types

| Type | Description | Use Case |
|------|-------------|----------|
| `info` | General information | System updates, announcements |
| `success` | Success messages | Completed actions, achievements |
| `warning` | Warning messages | Important notices, cautions |
| `error` | Error messages | System errors, failures |
| `order_confirmation` | Order confirmations | New order notifications |
| `order_status` | Order status updates | Status changes, shipping updates |
| `handyman_assigned` | Handyman assignments | Service request assignments |
| `service_completed` | Service completions | Completed service notifications |
| `marketing` | Marketing messages | Promotions, offers |

### 3.2 Notification Data Structure

```json
{
  "id": "notification-uuid",
  "type": "App\\Notifications\\CustomNotification",
  "data": {
    "title": "Notification Title",
    "message": "Notification message content",
    "type": "info",
    "icon": "bell",
    "color": "blue",
    "action_text": "View Details",
    "action_url": "/path/to/action",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "read_at": null,
  "created_at": "2024-01-15T10:30:00.000000Z",
  "updated_at": "2024-01-15T10:30:00.000000Z",
  "is_read": false
}
```

---

## 4. Error Responses

All endpoints return consistent error responses:

### 4.1 Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "title": ["The title field is required."],
    "message": ["The message field is required."]
  }
}
```

**HTTP Status:** 422 Unprocessable Entity

### 4.2 Unauthorized

```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

**HTTP Status:** 401 Unauthorized

### 4.3 Forbidden

```json
{
  "success": false,
  "message": "This action is unauthorized."
}
```

**HTTP Status:** 403 Forbidden

### 4.4 Not Found

```json
{
  "success": false,
  "message": "Notification not found"
}
```

**HTTP Status:** 404 Not Found

### 4.5 Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

**HTTP Status:** 500 Internal Server Error

---

## 5. Usage Examples

### 5.1 Frontend JavaScript Examples

```javascript
// Get user notifications
async function getUserNotifications(page = 1, type = 'all') {
  const response = await fetch(`/api/notifications?page=${page}&type=${type}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return await response.json();
}

// Mark notification as read
async function markAsRead(notificationId) {
  const response = await fetch('/api/notifications/mark-read', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ notification_id: notificationId })
  });
  return await response.json();
}

// Update notification preferences
async function updatePreferences(preferences) {
  const response = await fetch('/api/notifications/preferences', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(preferences)
  });
  return await response.json();
}

// Send notification to users (Admin)
async function sendToUsers(notificationData) {
  const response = await fetch('/api/admin/notifications/send-to-users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(notificationData)
  });
  return await response.json();
}
```

### 5.2 cURL Examples

```bash
# Get user notifications
curl -X GET "http://localhost:8000/api/notifications?page=1&type=unread" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"

# Mark notification as read
curl -X POST "http://localhost:8000/api/notifications/mark-read" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"notification_id": "uuid-string"}'

# Update preferences
curl -X PUT "http://localhost:8000/api/notifications/preferences" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"marketing_email": false, "marketing_push": true}'

# Send notification to users (Admin)
curl -X POST "http://localhost:8000/api/admin/notifications/send-to-users" \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Special Offer",
    "message": "Get 20% off your next order!",
    "type": "marketing",
    "user_ids": [1, 2, 3],
    "action_text": "Shop Now",
    "action_url": "/products"
  }'
```

---

## 6. Implementation Details

### 6.1 Database Structure

The notification system uses Laravel's default notifications table:

```sql
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    notifiable_type VARCHAR(255) NOT NULL,
    notifiable_id BIGINT UNSIGNED NOT NULL,
    data TEXT NOT NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX (notifiable_type, notifiable_id)
);
```

### 6.2 Notification Preferences

User notification preferences are stored in the `notification_preferences` table:

```sql
CREATE TABLE notification_preferences (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    order_confirmation_email BOOLEAN DEFAULT TRUE,
    order_confirmation_push BOOLEAN DEFAULT TRUE,
    order_status_email BOOLEAN DEFAULT TRUE,
    order_status_push BOOLEAN DEFAULT TRUE,
    handyman_assigned_email BOOLEAN DEFAULT TRUE,
    handyman_assigned_push BOOLEAN DEFAULT TRUE,
    service_completed_email BOOLEAN DEFAULT TRUE,
    service_completed_push BOOLEAN DEFAULT TRUE,
    marketing_email BOOLEAN DEFAULT FALSE,
    marketing_push BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 6.3 Performance Considerations

- **Pagination**: All list endpoints implement pagination to handle large datasets
- **Indexing**: Database indexes are created on frequently queried fields
- **Queuing**: Notifications are queued for better performance
- **Caching**: Consider implementing caching for frequently accessed data

### 6.4 Security Features

- **Authentication**: All endpoints require proper authentication
- **Authorization**: Admin endpoints require admin role verification
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: Consider implementing rate limiting for notification sending

---

## 7. Integration Guide

### 7.1 Frontend Integration

1. **Real-time Updates**: Use WebSockets or polling for real-time notification updates
2. **Badge Count**: Display unread count in navigation/header
3. **Toast Notifications**: Show new notifications as toast messages
4. **Notification Center**: Create a dedicated notification management page

### 7.2 Mobile Integration

1. **Push Notifications**: Integrate with FCM/APNS for mobile push notifications
2. **Background Sync**: Implement background notification sync
3. **Offline Support**: Cache notifications for offline viewing

### 7.3 Email Integration

1. **Email Templates**: Create branded email templates for notifications
2. **Unsubscribe**: Implement email unsubscribe functionality
3. **Email Preferences**: Allow users to manage email notification preferences

---

## 8. Future Enhancements

Potential improvements for the notification system:

1. **Rich Notifications**: Support for images, videos, and interactive elements
2. **Scheduled Notifications**: Send notifications at specific times
3. **Notification Templates**: Reusable notification templates
4. **Analytics**: Track notification open rates and engagement
5. **A/B Testing**: Test different notification formats
6. **Geolocation**: Location-based notifications
7. **Personalization**: AI-driven personalized notifications
8. **Multi-language**: Support for multiple languages
9. **Notification History**: Extended notification history and archiving
10. **Advanced Filtering**: More sophisticated filtering and search options
