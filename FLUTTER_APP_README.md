# BuildingZ Flutter App - Complete Documentation

## 📚 Documentation Index

This is the **complete, production-ready Flutter development guide** for transforming the BuildingZ React web app into a native mobile application.

---

## 🗂️ Documentation Structure

### **Part 1: Setup, Data Models & API Integration**
📄 `FLUTTER_DOCUMENTATION_PART1_SETUP_AND_MODELS.md`

**What's Covered:**
- ✅ Project setup & folder structure
- ✅ All dependencies (30+ packages)
- ✅ Complete Dart data models with JSON serialization
  - User, Category, Service, Field, Option
  - Order, Product, Address, Notification
- ✅ API service base configuration
- ✅ Storage service for local data
- ✅ Network configuration & error handling

**Key Features:**
- 100% type-safe Dart models
- Automatic JSON serialization with `json_annotation`
- Complete API response examples
- Error handling patterns
- Image URL construction helpers

---

### **Part 2: API Services & File Upload**
📄 `FLUTTER_DOCUMENTATION_PART2_API_SERVICES.md`

**What's Covered:**
- ✅ Service Builder API implementation
- ✅ Authentication service (signup, login, logout)
- ✅ Search service with autocomplete
- ✅ Notification service
- ✅ **Complete file upload implementation**
  - FormData with multipart/form-data
  - Progress tracking
  - File validation (size, type)
  - Multiple file uploads

**Key Features:**
- JSON vs FormData submission logic
- File upload with progress callback
- All field types implementation (9 types)
- Dynamic form generation
- Form validation

---

### **Part 3: State Management, UI Theme & Navigation**
📄 `FLUTTER_DOCUMENTATION_PART3_UI_AND_STATE.md`

**What's Covered:**
- ✅ State management with Provider
  - AuthProvider
  - ServiceProvider
  - CartProvider
- ✅ Complete theme configuration
  - Color palette (Orange #F39C12 primary)
  - Typography system
  - Component themes
- ✅ Navigation & routes setup
- ✅ Reusable UI widgets
  - Service cards
  - Loading shimmers
  - Empty states
  - Error views
- ✅ Complete home screen example

**Key Features:**
- Professional theme matching web design
- Provider pattern implementation
- Cached network images
- Responsive layouts
- Shimmer loading effects

---

### **Part 4: Authentication, Notifications, Testing & Deployment**
📄 `FLUTTER_DOCUMENTATION_PART4_COMPLETE_GUIDE.md`

**What's Covered:**
- ✅ Complete authentication screens
  - Login with validation
  - Signup with confirmation
  - Password visibility toggle
- ✅ Firebase push notifications
  - Setup & configuration
  - Foreground/background handling
  - Local notifications
  - Topic subscription
- ✅ Testing guide
  - Unit tests
  - Widget tests
  - Integration tests
- ✅ Deployment guide
  - Android build (APK, AAB)
  - iOS build & archive
- ✅ Common issues & solutions
- ✅ Performance optimizations

**Key Features:**
- Production-ready auth screens
- Complete Firebase integration
- Testing examples
- Build configurations
- Troubleshooting guide

---

## 🚀 Quick Start

### 1. **Read the Documentation in Order**
```
1. Part 1: Setup & Models
2. Part 2: API Services
3. Part 3: UI & State
4. Part 4: Testing & Deployment
```

### 2. **Create Flutter Project**
```bash
flutter create buildingz_app
cd buildingz_app
```

### 3. **Add Dependencies**
Copy `pubspec.yaml` dependencies from Part 1.

### 4. **Generate Models**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### 5. **Configure Firebase**
```bash
flutterfire configure
```

### 6. **Run the App**
```bash
flutter run
```

---

## 📊 API Response Reference

### Complete Examples Included:

#### **Service Detail Response:**
```json
{
  "success": true,
  "service": {
    "id": 31,
    "name": "test",
    "main_image": { "url": "...", "path": "..." },
    "images": [...],
    "whatsapp_numbers": [...],
    "fields": [
      {
        "id": 229,
        "type": "select",
        "options": [...]
      },
      {
        "id": 231,
        "type": "checkbox",
        "options": [...]
      },
      {
        "id": 232,
        "type": "file"
      }
    ]
  }
}
```

#### **Order Submission Request:**
```dart
// JSON (No Files)
{
  "service_id": 33,
  "customer_name": "Ahmed",
  "customer_email": "ahmed@example.com",
  "customer_phone": "+971501234567",
  "emirate": "Dubai",
  "field_values": [...],
  "products": [...],
  "payment_method": "cash_on_delivery"
}

// FormData (With Files)
service_id: 33
customer_name: Ahmed
field_values[0][field_id]: 293
field_values[0][value]: "تصميم"
field_files[field_232]: <binary file>
```

#### **Order Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order_id": 123,
  "order_details": {
    "total_amount": null,
    "field_values": [...],
    "uploaded_files": [
      {
        "field_id": 232,
        "original_name": "design.pdf",
        "file_url": "http://...storage/.../file.pdf",
        "size": 245760,
        "uploaded_at": "2025-10-13T19:00:00.000000Z"
      }
    ]
  }
}
```

---

## 🎨 Design System

### **Colors:**
```dart
Primary: #F39C12 (Orange)
Secondary: #34495E (Dark Blue-Grey)
Accent Blue: #3498DB
Success Green: #27AE60
Error Red: #E74C3C
WhatsApp Green: #25D366
```

### **Typography:**
```dart
Display Large: 32px, Bold
Display Medium: 24px, Bold
Display Small: 20px, Semi-Bold
Body Large: 16px
Body Medium: 14px
```

### **Spacing:**
```dart
XS: 4px
SM: 8px
MD: 16px
LG: 24px
XL: 32px
```

---

## 🔧 Critical Implementation Details

### **1. File Upload (MUST FOLLOW)**
```dart
// Key format is critical!
formData.files.add(
  MapEntry(
    'field_files[field_${fieldId}]',  // ← Must have "field_" prefix
    await MultipartFile.fromFile(file.path),
  ),
);
```

### **2. Emirates Handling**
```dart
// Send English values to backend
emirate: 'Dubai'  // ← English

// Display Arabic to user
Text(AppConfig.emiratesArabic['Dubai'])  // ← 'دبي'
```

### **3. Optional Email**
```dart
// If email is empty, send this
customerEmail: email.isEmpty 
    ? 'optional+email+notselected@buildingz.ae'
    : email
```

### **4. Image URL Construction**
```dart
String getImageUrl(String? path) {
  if (path == null) return placeholderImage;
  if (path.startsWith('http')) return path;
  return '${AppConfig.backendUrl}/storage/$path';
}

// Priority order
imageUrl = service.main_image?.url 
    ?? service.preview_image_path 
    ?? service.preview_image_url 
    ?? placeholderImage;
```

### **5. Field Types (All 9 Supported)**
- ✅ text
- ✅ number
- ✅ textarea
- ✅ select
- ✅ radio
- ✅ checkbox (multiple selection)
- ✅ date
- ✅ time
- ✅ file (multiple files)

---

## 📦 Dependencies Summary

### **Core:**
- `provider` / `flutter_riverpod` - State management
- `dio` - API & file upload
- `shared_preferences` / `hive` - Local storage
- `json_annotation` & `json_serializable` - JSON handling

### **UI:**
- `cached_network_image` - Image caching
- `shimmer` - Loading effects
- `carousel_slider` - Image galleries
- `photo_view` - Image zoom

### **Location & Maps:**
- `geolocator` - GPS location
- `geocoding` - Address lookup
- `google_maps_flutter` - Map display
- `google_places_flutter` - Address autocomplete

### **Push Notifications:**
- `firebase_core` & `firebase_messaging`
- `flutter_local_notifications`

### **Utilities:**
- `image_picker` & `file_picker` - File uploads
- `url_launcher` - WhatsApp links
- `intl` - Date formatting
- `logger` - Logging

---

## ✅ What's Included

### **100% Complete Implementation:**
1. ✅ All Dart models with JSON serialization
2. ✅ Complete API integration (all endpoints)
3. ✅ File upload with FormData
4. ✅ Dynamic form generation (9 field types)
5. ✅ State management (Provider)
6. ✅ Theme configuration (matching web design)
7. ✅ Navigation & routing
8. ✅ Authentication screens
9. ✅ Push notifications (Firebase)
10. ✅ Image caching & optimization
11. ✅ Error handling
12. ✅ Loading states
13. ✅ Empty states
14. ✅ Form validation
15. ✅ Testing guide
16. ✅ Deployment instructions
17. ✅ Common issues & solutions
18. ✅ Performance optimizations

---

## 🎯 API Endpoints Covered

### **Authentication:**
- POST `/api/auth/signup`
- POST `/api/auth/login`
- POST `/api/auth/logout`

### **Service Builder:**
- GET `/api/service-builder/categories`
- GET `/api/service-builder/categories/{id}`
- GET `/api/service-builder/services/{id}`
- POST `/api/service-builder/orders` (JSON & FormData)
- POST `/api/service-builder/calculate`

### **Search:**
- GET `/api/search?query={query}&type={type}&limit={limit}`

### **Notifications:**
- GET `/api/notifications`
- POST `/api/notifications/{id}/read`
- DELETE `/api/notifications/{id}`

### **Profile & Addresses:**
- GET `/api/profile`
- PUT `/api/profile`
- GET `/api/addresses`
- POST `/api/addresses`
- PUT `/api/addresses/{id}`
- DELETE `/api/addresses/{id}`

---

## 🧪 Testing Coverage

### **Included Test Examples:**
1. ✅ Unit tests (API service, utilities)
2. ✅ Widget tests (UI components)
3. ✅ Integration tests (full flows)
4. ✅ Mock data examples
5. ✅ Test setup & configuration

---

## 📱 Platform Support

### **Android:**
- Minimum SDK: 21 (Android 5.0)
- Target SDK: 33 (Android 13)
- Build formats: APK, AAB
- Permissions: Internet, Camera, Storage, Location

### **iOS:**
- Minimum version: 12.0
- Build: Archive & Upload
- Permissions: Camera, Photos, Location, Notifications

---

## 🔐 Security

### **Implemented:**
- ✅ Token-based authentication (Bearer)
- ✅ Secure storage (shared_preferences)
- ✅ HTTPS enforcement
- ✅ Input validation
- ✅ File type validation
- ✅ File size limits (10MB)
- ✅ Error message sanitization

---

## 🚨 Common Issues & Solutions

All documented in Part 4, including:
- File upload not working → Key format fix
- Images not loading → URL construction fix
- Invalid emirate error → Value format fix
- Email required → Optional email logic
- Validation errors → Complete examples

---

## 📞 Support & Resources

### **Documentation:**
- Part 1: Models & Setup
- Part 2: API & File Upload
- Part 3: UI & State Management
- Part 4: Auth, Notifications, Testing

### **External Resources:**
- Flutter Docs: https://flutter.dev
- Firebase Setup: https://firebase.google.com
- Provider Package: https://pub.dev/packages/provider
- Dio Package: https://pub.dev/packages/dio

---

## 🎉 Ready to Build!

**This documentation contains EVERYTHING needed to build a production-ready Flutter app for BuildingZ!**

### **Next Steps:**
1. Read Part 1 (Setup & Models)
2. Follow Part 2 (API Services)
3. Implement Part 3 (UI & State)
4. Test & Deploy using Part 4

**The app is fully specified and ready for development!** 🚀📱✨

---

**Version:** 1.0  
**Last Updated:** October 2024  
**Platform:** Flutter 3.x+  
**Language:** Dart 3.x+  

**Good luck with your Flutter development!** 🎊


