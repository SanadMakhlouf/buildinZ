# BuildingZ Flutter App - Complete Development Guide
## Part 1: Setup, Data Models & API Integration

**Version:** 1.0 | **Platform:** Flutter 3.x+ | **Language:** Dart 3.x+

---

## 📋 Table of Contents (Part 1)
1. [Project Setup](#1-project-setup)
2. [Dependencies](#2-dependencies)
3. [Dart Data Models](#3-dart-data-models)
4. [API Service Layer](#4-api-service-layer)
5. [Network Configuration](#5-network-configuration)

---

## 1. Project Setup

### 1.1 Create Flutter Project
```bash
flutter create buildingz_app
cd buildingz_app
```

### 1.2 Project Structure
```
lib/
├── main.dart
├── config/
│   ├── app_config.dart
│   ├── theme.dart
│   └── routes.dart
├── models/
│   ├── user.dart
│   ├── category.dart
│   ├── service.dart
│   ├── field.dart
│   ├── product.dart
│   ├── order.dart
│   ├── address.dart
│   └── notification.dart
├── services/
│   ├── api_service.dart
│   ├── auth_service.dart
│   ├── service_builder_service.dart
│   ├── search_service.dart
│   ├── notification_service.dart
│   └── storage_service.dart
├── providers/
│   ├── auth_provider.dart
│   ├── cart_provider.dart
│   ├── service_provider.dart
│   └── notification_provider.dart
├── screens/
│   ├── home/
│   ├── services/
│   ├── products/
│   ├── auth/
│   ├── profile/
│   └── checkout/
├── widgets/
│   ├── common/
│   ├── service/
│   └── forms/
└── utils/
    ├── constants.dart
    ├── helpers.dart
    └── validators.dart
```

---

## 2. Dependencies

### 2.1 pubspec.yaml
```yaml
name: buildingz_app
description: BuildingZ service marketplace app
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  provider: ^6.1.0
  # OR
  flutter_riverpod: ^2.4.0
  
  # Network & API
  http: ^1.1.0
  dio: ^5.3.3              # Better for file upload
  
  # Local Storage
  shared_preferences: ^2.2.2
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  
  # JSON Serialization
  json_annotation: ^4.8.1
  
  # Image Handling
  cached_network_image: ^3.3.0
  image_picker: ^1.0.4
  file_picker: ^6.0.0
  
  # Location & Maps
  geolocator: ^10.1.0
  geocoding: ^2.1.1
  google_maps_flutter: ^2.5.0
  google_places_flutter: ^2.0.8
  
  # Push Notifications
  firebase_core: ^2.24.0
  firebase_messaging: ^14.7.0
  flutter_local_notifications: ^16.1.0
  
  # UI Components
  flutter_svg: ^2.0.9
  shimmer: ^3.0.0
  carousel_slider: ^4.2.1
  photo_view: ^0.14.0
  
  # URL Launcher (WhatsApp, etc)
  url_launcher: ^6.2.1
  
  # Date/Time
  intl: ^0.18.1
  
  # Utilities
  equatable: ^2.0.5
  logger: ^2.0.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.4.6
  json_serializable: ^6.7.1
  flutter_lints: ^3.0.0
```

### 2.2 Install Dependencies
```bash
flutter pub get
```

---

## 3. Dart Data Models

### 3.1 User Model

**File:** `lib/models/user.dart`

```dart
import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@JsonSerializable()
class User {
  final int id;
  final String name;
  final String email;
  final String phone;
  @JsonKey(name: 'profile_picture')
  final String? profilePicture;
  @JsonKey(name: 'email_verified_at')
  final DateTime? emailVerifiedAt;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.profilePicture,
    this.emailVerifiedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}
```

**API Response Example:**
```json
{
  "id": 1,
  "name": "Ahmed Mohammed",
  "email": "ahmed@example.com",
  "phone": "+971501234567",
  "profile_picture": "storage/profiles/image.jpg",
  "email_verified_at": "2024-10-01T10:30:00.000000Z",
  "created_at": "2024-10-01T10:30:00.000000Z",
  "updated_at": "2024-10-13T15:45:00.000000Z"
}
```

---

### 3.2 Category Model

**File:** `lib/models/category.dart`

```dart
import 'package:json_annotation/json_annotation.dart';
import 'service.dart';

part 'category.g.dart';

@JsonSerializable(explicitToJson: true)
class Category {
  final int id;
  final String name;
  final String slug;
  final String? description;
  @JsonKey(name: 'parent_id')
  final int? parentId;
  @JsonKey(name: 'preview_image_path')
  final String? previewImagePath;
  @JsonKey(name: 'preview_image_url')
  final String? previewImageUrl;
  @JsonKey(name: 'image_path')
  final String? imagePath;
  @JsonKey(name: 'sort_order')
  final int sortOrder;
  @JsonKey(name: 'is_active')
  final bool isActive;
  
  // Relationships
  final List<Category>? subcategories;
  final List<Service>? services;

  Category({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.parentId,
    this.previewImagePath,
    this.previewImageUrl,
    this.imagePath,
    required this.sortOrder,
    required this.isActive,
    this.subcategories,
    this.services,
  });

  factory Category.fromJson(Map<String, dynamic> json) => _$CategoryFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryToJson(this);
  
  // Helper to get image URL
  String? getImageUrl(String backendUrl) {
    final path = previewImagePath ?? previewImageUrl ?? imagePath;
    if (path == null) return null;
    if (path.startsWith('http')) return path;
    return '$backendUrl/storage/$path';
  }
}
```

**API Response Example:**
```json
{
  "id": 18,
  "name": "الاستشارات الهندسية",
  "slug": "alastsharat-alhndsy",
  "description": "خدمات الاستشارات الهندسية",
  "parent_id": null,
  "preview_image_path": "service-builder/categories/image.png",
  "preview_image_url": "http://127.0.0.1:8000/storage/service-builder/categories/image.png",
  "image_path": null,
  "sort_order": 1,
  "is_active": true,
  "subcategories": [],
  "services": [
    {
      "id": 33,
      "name": "تصميم واشراف",
      "slug": "tsmym-oashraf",
      "description": "التصاميم المعمارية",
      "base_price": 0,
      "preview_image_path": "service-builder/services/image.webp"
    }
  ]
}
```

---

### 3.3 Service Model

**File:** `lib/models/service.dart`

```dart
import 'package:json_annotation/json_annotation.dart';
import 'category.dart';
import 'field.dart';
import 'product.dart';

part 'service.g.dart';

@JsonSerializable(explicitToJson: true)
class Service {
  final int id;
  final String name;
  final String slug;
  final String? description;
  @JsonKey(name: 'base_price')
  final double basePrice;
  @JsonKey(name: 'sort_order')
  final int sortOrder;
  @JsonKey(name: 'is_active')
  final bool isActive;
  @JsonKey(name: 'enable_products')
  final bool enableProducts;
  @JsonKey(name: 'enable_dynamic_inputs')
  final bool enableDynamicInputs;
  @JsonKey(name: 'enable_custom_calculations')
  final bool enableCustomCalculations;
  @JsonKey(name: 'requires_pricing')
  final bool requiresPricing;
  @JsonKey(name: 'pricing_formula')
  final String? pricingFormula;
  
  // Relationships
  final Category category;
  @JsonKey(name: 'main_image')
  final ServiceImage? mainImage;
  final List<ServiceImage> images;
  @JsonKey(name: 'whatsapp_numbers')
  final List<WhatsAppContact> whatsappNumbers;
  final List<Field> fields;
  final List<Product> products;
  
  // Additional fields
  @JsonKey(name: 'preview_image_path')
  final String? previewImagePath;
  @JsonKey(name: 'preview_image_url')
  final String? previewImageUrl;
  @JsonKey(name: 'image_path')
  final String? imagePath;

  Service({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.basePrice,
    required this.sortOrder,
    required this.isActive,
    required this.enableProducts,
    required this.enableDynamicInputs,
    required this.enableCustomCalculations,
    required this.requiresPricing,
    this.pricingFormula,
    required this.category,
    this.mainImage,
    required this.images,
    required this.whatsappNumbers,
    required this.fields,
    required this.products,
    this.previewImagePath,
    this.previewImageUrl,
    this.imagePath,
  });

  factory Service.fromJson(Map<String, dynamic> json) => _$ServiceFromJson(json);
  Map<String, dynamic> toJson() => _$ServiceToJson(this);
  
  // Helper to get primary image URL
  String? getPrimaryImageUrl(String backendUrl) {
    String? path = mainImage?.url ?? 
                   previewImagePath ?? 
                   previewImageUrl ?? 
                   imagePath;
    if (path == null) return null;
    if (path.startsWith('http')) return path;
    return '$backendUrl/storage/$path';
  }
}

@JsonSerializable()
class ServiceImage {
  final int id;
  final String url;
  final String path;
  @JsonKey(name: 'is_main')
  final bool isMain;
  @JsonKey(name: 'sort_order')
  final int sortOrder;

  ServiceImage({
    required this.id,
    required this.url,
    required this.path,
    required this.isMain,
    required this.sortOrder,
  });

  factory ServiceImage.fromJson(Map<String, dynamic> json) => _$ServiceImageFromJson(json);
  Map<String, dynamic> toJson() => _$ServiceImageToJson(this);
}

@JsonSerializable()
class WhatsAppContact {
  @JsonKey(name: 'user_id')
  final int userId;
  final String name;
  @JsonKey(name: 'whatsapp_number')
  final String whatsappNumber;

  WhatsAppContact({
    required this.userId,
    required this.name,
    required this.whatsappNumber,
  });

  factory WhatsAppContact.fromJson(Map<String, dynamic> json) => 
      _$WhatsAppContactFromJson(json);
  Map<String, dynamic> toJson() => _$WhatsAppContactToJson(this);
  
  // Helper to get WhatsApp URL
  String getWhatsAppUrl() {
    final number = whatsappNumber.replaceAll(RegExp(r'[^\d+]'), '');
    return 'https://wa.me/$number';
  }
}
```

**API Response Example:**
```json
{
  "success": true,
  "service": {
    "id": 33,
    "name": "تصميم واشراف",
    "slug": "tsmym-oashraf",
    "description": "التصاميم المعمارية والإنشائية نقدّم حلولاً متكاملة...",
    "base_price": 0,
    "sort_order": 0,
    "is_active": true,
    "enable_products": false,
    "enable_dynamic_inputs": false,
    "enable_custom_calculations": false,
    "requires_pricing": false,
    "pricing_formula": null,
    "category": {
      "id": 18,
      "name": "الاستشارات الهندسية",
      "slug": "alastsharat-alhndsy",
      "description": null
    },
    "main_image": {
      "id": 14,
      "url": "http://127.0.0.1:8000/storage/service-builder/services/image.webp",
      "path": "service-builder/services/image.webp",
      "is_main": true,
      "sort_order": 0
    },
    "images": [
      {
        "id": 14,
        "url": "http://127.0.0.1:8000/storage/service-builder/services/image.webp",
        "path": "service-builder/services/image.webp",
        "is_main": true,
        "sort_order": 0
      }
    ],
    "whatsapp_numbers": [
      {
        "user_id": 15,
        "name": "fawzt",
        "whatsapp_number": "+971544626276"
      }
    ],
    "fields": [
      {
        "id": 293,
        "key": "noaa_alkhdm",
        "label": "نوع الخدمة",
        "variable_name": "noaa_alkhdm",
        "type": "radio",
        "required": false,
        "show_image": false,
        "min_value": null,
        "max_value": null,
        "step": "1.00",
        "unit": null,
        "sort_order": 0,
        "is_active": true,
        "options": [
          {
            "id": 286,
            "value": "تصميم ",
            "label": "تصميم ",
            "price_modifier": 0,
            "is_default": false,
            "image_url": null,
            "image_path": null,
            "sort_order": 0,
            "is_active": true
          }
        ]
      }
    ],
    "products": []
  }
}
```

---

### 3.4 Field Model

**File:** `lib/models/field.dart`

```dart
import 'package:json_annotation/json_annotation.dart';

part 'field.g.dart';

enum FieldType {
  text,
  number,
  textarea,
  select,
  radio,
  checkbox,
  date,
  time,
  file,
}

@JsonSerializable(explicitToJson: true)
class Field {
  final int id;
  final String key;
  final String label;
  @JsonKey(name: 'variable_name')
  final String variableName;
  final FieldType type;
  final bool required;
  @JsonKey(name: 'show_image')
  final bool showImage;
  @JsonKey(name: 'min_value')
  final double? minValue;
  @JsonKey(name: 'max_value')
  final double? maxValue;
  final String? step;
  final String? unit;
  @JsonKey(name: 'sort_order')
  final int sortOrder;
  @JsonKey(name: 'is_active')
  final bool isActive;
  final List<FieldOption> options;

  Field({
    required this.id,
    required this.key,
    required this.label,
    required this.variableName,
    required this.type,
    required this.required,
    required this.showImage,
    this.minValue,
    this.maxValue,
    this.step,
    this.unit,
    required this.sortOrder,
    required this.isActive,
    required this.options,
  });

  factory Field.fromJson(Map<String, dynamic> json) => _$FieldFromJson(json);
  Map<String, dynamic> toJson() => _$FieldToJson(this);
}

@JsonSerializable()
class FieldOption {
  final int id;
  final String value;
  final String label;
  @JsonKey(name: 'price_modifier')
  final double priceModifier;
  @JsonKey(name: 'is_default')
  final bool isDefault;
  @JsonKey(name: 'image_url')
  final String? imageUrl;
  @JsonKey(name: 'image_path')
  final String? imagePath;
  @JsonKey(name: 'sort_order')
  final int sortOrder;
  @JsonKey(name: 'is_active')
  final bool isActive;

  FieldOption({
    required this.id,
    required this.value,
    required this.label,
    required this.priceModifier,
    required this.isDefault,
    this.imageUrl,
    this.imagePath,
    required this.sortOrder,
    required this.isActive,
  });

  factory FieldOption.fromJson(Map<String, dynamic> json) => 
      _$FieldOptionFromJson(json);
  Map<String, dynamic> toJson() => _$FieldOptionToJson(this);
  
  // Helper to get image URL
  String? getImageUrl(String backendUrl) {
    final path = imageUrl ?? imagePath;
    if (path == null) return null;
    if (path.startsWith('http')) return path;
    return '$backendUrl/storage/$path';
  }
}
```

---

### 3.5 Order Model

**File:** `lib/models/order.dart`

```dart
import 'package:json_annotation/json_annotation.dart';
import 'address.dart';

part 'order.g.dart';

@JsonSerializable(explicitToJson: true)
class OrderRequest {
  @JsonKey(name: 'service_id')
  final int serviceId;
  @JsonKey(name: 'customer_name')
  final String customerName;
  @JsonKey(name: 'customer_email')
  final String customerEmail;
  @JsonKey(name: 'customer_phone')
  final String customerPhone;
  final String emirate;
  @JsonKey(name: 'field_values')
  final List<OrderFieldValue> fieldValues;
  final List<OrderProduct> products;
  final String? notes;
  @JsonKey(name: 'payment_method')
  final String paymentMethod;
  @JsonKey(name: 'shipping_address')
  final OrderAddress? shippingAddress;

  OrderRequest({
    required this.serviceId,
    required this.customerName,
    required this.customerEmail,
    required this.customerPhone,
    required this.emirate,
    required this.fieldValues,
    required this.products,
    this.notes,
    required this.paymentMethod,
    this.shippingAddress,
  });

  factory OrderRequest.fromJson(Map<String, dynamic> json) => 
      _$OrderRequestFromJson(json);
  Map<String, dynamic> toJson() => _$OrderRequestToJson(this);
}

@JsonSerializable()
class OrderFieldValue {
  @JsonKey(name: 'field_id')
  final int fieldId;
  @JsonKey(name: 'option_id')
  final int? optionId;
  final String value;

  OrderFieldValue({
    required this.fieldId,
    this.optionId,
    required this.value,
  });

  factory OrderFieldValue.fromJson(Map<String, dynamic> json) => 
      _$OrderFieldValueFromJson(json);
  Map<String, dynamic> toJson() => _$OrderFieldValueToJson(this);
}

@JsonSerializable()
class OrderProduct {
  @JsonKey(name: 'product_id')
  final int productId;
  final int quantity;

  OrderProduct({
    required this.productId,
    required this.quantity,
  });

  factory OrderProduct.fromJson(Map<String, dynamic> json) => 
      _$OrderProductFromJson(json);
  Map<String, dynamic> toJson() => _$OrderProductToJson(this);
}

@JsonSerializable()
class OrderAddress {
  final String name;
  final String street;
  final String city;
  final String state;
  final String country;
  final String phone;

  OrderAddress({
    required this.name,
    required this.street,
    required this.city,
    required this.state,
    required this.country,
    required this.phone,
  });

  factory OrderAddress.fromJson(Map<String, dynamic> json) => 
      _$OrderAddressFromJson(json);
  Map<String, dynamic> toJson() => _$OrderAddressToJson(this);
}

@JsonSerializable(explicitToJson: true)
class OrderResponse {
  final bool success;
  final String message;
  @JsonKey(name: 'order_id')
  final int orderId;
  @JsonKey(name: 'order_details')
  final OrderDetails orderDetails;

  OrderResponse({
    required this.success,
    required this.message,
    required this.orderId,
    required this.orderDetails,
  });

  factory OrderResponse.fromJson(Map<String, dynamic> json) => 
      _$OrderResponseFromJson(json);
  Map<String, dynamic> toJson() => _$OrderResponseToJson(this);
}

@JsonSerializable(explicitToJson: true)
class OrderDetails {
  @JsonKey(name: 'total_amount')
  final double? totalAmount;
  @JsonKey(name: 'field_values')
  final List<OrderFieldValue> fieldValues;
  final List<OrderProduct> products;
  @JsonKey(name: 'uploaded_files')
  final List<UploadedFile>? uploadedFiles;

  OrderDetails({
    this.totalAmount,
    required this.fieldValues,
    required this.products,
    this.uploadedFiles,
  });

  factory OrderDetails.fromJson(Map<String, dynamic> json) => 
      _$OrderDetailsFromJson(json);
  Map<String, dynamic> toJson() => _$OrderDetailsToJson(this);
}

@JsonSerializable()
class UploadedFile {
  @JsonKey(name: 'field_id')
  final int fieldId;
  @JsonKey(name: 'field_key')
  final String fieldKey;
  @JsonKey(name: 'original_name')
  final String originalName;
  @JsonKey(name: 'file_path')
  final String filePath;
  @JsonKey(name: 'file_url')
  final String fileUrl;
  @JsonKey(name: 'mime_type')
  final String mimeType;
  final int size;
  @JsonKey(name: 'uploaded_at')
  final DateTime uploadedAt;

  UploadedFile({
    required this.fieldId,
    required this.fieldKey,
    required this.originalName,
    required this.filePath,
    required this.fileUrl,
    required this.mimeType,
    required this.size,
    required this.uploadedAt,
  });

  factory UploadedFile.fromJson(Map<String, dynamic> json) => 
      _$UploadedFileFromJson(json);
  Map<String, dynamic> toJson() => _$UploadedFileToJson(this);
}
```

**API Response Example:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order_id": 123,
  "order_details": {
    "total_amount": null,
    "field_values": [
      {
        "field_id": 293,
        "option_id": 286,
        "value": "تصميم"
      }
    ],
    "products": [],
    "uploaded_files": [
      {
        "field_id": 232,
        "field_key": "upload_your_design_and_everyrything",
        "original_name": "design.pdf",
        "file_path": "service-builder/order-files/abc123.pdf",
        "file_url": "http://127.0.0.1:8000/storage/service-builder/order-files/abc123.pdf",
        "mime_type": "application/pdf",
        "size": 245760,
        "uploaded_at": "2025-10-13T19:00:00.000000Z"
      }
    ]
  }
}
```

---

### 3.6 Generate Model Files

Run this command to generate the `.g.dart` files:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

---

## 4. API Service Layer

### 4.1 Base API Configuration

**File:** `lib/config/app_config.dart`

```dart
class AppConfig {
  // API URLs
  static const String apiBaseUrl = 'http://127.0.0.1:8000/api';
  static const String backendUrl = 'http://127.0.0.1:8000';
  
  // For production:
  // static const String apiBaseUrl = 'https://api.buildingz.ae/api';
  // static const String backendUrl = 'https://api.buildingz.ae';
  
  // Google Maps API Key
  static const String googleMapsApiKey = 'AIzaSyDlu3vMSHhKwS97ggaXnFDn2J4muBQ9fYU';
  
  // Timeout
  static const int connectionTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000;
  
  // Image placeholder
  static const String placeholderImage = 'assets/images/placeholder.png';
  
  // UAE Emirates
  static const List<String> emirates = [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Ras Al Khaimah',
    'Fujairah',
    'Umm Al Quwain',
  ];
  
  static const Map<String, String> emiratesArabic = {
    'Dubai': 'دبي',
    'Abu Dhabi': 'أبوظبي',
    'Sharjah': 'الشارقة',
    'Ajman': 'عجمان',
    'Ras Al Khaimah': 'رأس الخيمة',
    'Fujairah': 'الفجيرة',
    'Umm Al Quwain': 'أم القيوين',
  };
  
  // Payment Methods
  static const String paymentCashOnDelivery = 'cash_on_delivery';
  static const String paymentOnline = 'online';
  
  // File upload constraints
  static const int maxFileSize = 10 * 1024 * 1024; // 10MB
  static const List<String> allowedFileTypes = [
    'pdf',
    'doc',
    'docx',
    'jpg',
    'jpeg',
    'png',
    'gif',
  ];
}
```

---

### 4.2 API Service Base

**File:** `lib/services/api_service.dart`

```dart
import 'package:dio/dio.dart';
import 'package:logger/logger.dart';
import '../config/app_config.dart';
import 'storage_service.dart';

class ApiService {
  late final Dio _dio;
  final StorageService _storageService = StorageService();
  final Logger _logger = Logger();

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(milliseconds: AppConfig.connectionTimeout),
        receiveTimeout: const Duration(milliseconds: AppConfig.receiveTimeout),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Add interceptors
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token if available
          final token = await _storageService.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          
          _logger.d('REQUEST[${options.method}] => PATH: ${options.path}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          _logger.d(
            'RESPONSE[${response.statusCode}] => PATH: ${response.requestOptions.path}'
          );
          return handler.next(response);
        },
        onError: (error, handler) {
          _logger.e(
            'ERROR[${error.response?.statusCode}] => PATH: ${error.requestOptions.path}'
          );
          return handler.next(error);
        },
      ),
    );
  }

  // GET Request
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // POST Request
  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // POST Request with FormData (for file upload)
  Future<Response> postMultipart(
    String path,
    FormData formData, {
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
        ),
        onSendProgress: onSendProgress,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // PUT Request
  Future<Response> put(
    String path, {
    dynamic data,
  }) async {
    try {
      final response = await _dio.put(path, data: data);
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // DELETE Request
  Future<Response> delete(String path) async {
    try {
      final response = await _dio.delete(path);
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Error Handler
  Exception _handleError(DioException error) {
    String errorMessage = 'An unexpected error occurred';

    if (error.response != null) {
      final statusCode = error.response!.statusCode;
      final data = error.response!.data;

      switch (statusCode) {
        case 400:
          errorMessage = data['message'] ?? 'Bad request';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please login again.';
          _storageService.clearToken(); // Clear invalid token
          break;
        case 403:
          errorMessage = 'Forbidden';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 422:
          // Validation errors
          if (data is Map && data.containsKey('errors')) {
            final errors = data['errors'] as Map<String, dynamic>;
            errorMessage = errors.values.first[0];
          } else {
            errorMessage = data['message'] ?? 'Validation failed';
          }
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = data['message'] ?? errorMessage;
      }
    } else if (error.type == DioExceptionType.connectionTimeout) {
      errorMessage = 'Connection timeout';
    } else if (error.type == DioExceptionType.receiveTimeout) {
      errorMessage = 'Receive timeout';
    } else if (error.type == DioExceptionType.unknown) {
      errorMessage = 'No internet connection';
    }

    _logger.e('API Error: $errorMessage');
    return Exception(errorMessage);
  }

  // Helper to get full image URL
  static String getImageUrl(String? path) {
    if (path == null || path.isEmpty) return AppConfig.placeholderImage;
    if (path.startsWith('http')) return path;
    return '${AppConfig.backendUrl}/storage/$path';
  }
}
```

---

### 4.3 Storage Service

**File:** `lib/services/storage_service.dart`

```dart
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/user.dart';

class StorageService {
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  static const String _cartKey = 'cart_data';
  static const String _recentSearchesKey = 'recent_searches';

  // Get token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // Save token
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  // Clear token
  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  // Get user
  Future<User?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(_userKey);
    if (userJson == null) return null;
    return User.fromJson(json.decode(userJson));
  }

  // Save user
  Future<void> saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, json.encode(user.toJson()));
  }

  // Clear user
  Future<void> clearUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_userKey);
  }

  // Check if authenticated
  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null;
  }

  // Logout (clear all auth data)
  Future<void> logout() async {
    await clearToken();
    await clearUser();
  }

  // Recent searches
  Future<List<String>> getRecentSearches() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_recentSearchesKey) ?? [];
  }

  Future<void> addRecentSearch(String query) async {
    final prefs = await SharedPreferences.getInstance();
    List<String> searches = prefs.getStringList(_recentSearchesKey) ?? [];
    
    // Remove if already exists
    searches.remove(query);
    
    // Add to beginning
    searches.insert(0, query);
    
    // Keep only last 10
    if (searches.length > 10) {
      searches = searches.sublist(0, 10);
    }
    
    await prefs.setStringList(_recentSearchesKey, searches);
  }

  Future<void> clearRecentSearches() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_recentSearchesKey);
  }
}
```

---

**Continue to Part 2 for:**
- Complete Service Implementation (Auth, Service Builder, Search)
- File Upload Implementation
- State Management
- UI Components
- Complete Widget Examples



