# BuildingZ Flutter App - API Integration Guide

## API Overview

The BuildingZ Flutter app communicates with the same RESTful API used by the web application. All endpoints are prefixed with `/api`.

## Base URL Configuration

```dart
// lib/constants/api_constants.dart
class ApiConstants {
  static const String baseUrl = 'http://127.0.0.1:8000/api';
}
```

## Authentication

The app uses JWT token-based authentication:

### Authentication Flow

1. User enters credentials
2. App sends credentials to API
3. API validates and returns JWT token
4. Token is stored securely
5. Token is included in subsequent API requests

### Token Storage

```dart
// lib/services/storage_service.dart
class StorageService {
  final FlutterSecureStorage _secureStorage = FlutterSecureStorage();
  
  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: 'auth_token', value: token);
  }
  
  Future<String?> getToken() async {
    return await _secureStorage.read(key: 'auth_token');
  }
  
  Future<void> deleteToken() async {
    await _secureStorage.delete(key: 'auth_token');
  }
}
```

## HTTP Client Setup

```dart
// lib/services/api_service.dart
class ApiService {
  late Dio _dio;
  final StorageService _storageService;
  
  ApiService(this._storageService) {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Accept': 'application/json'}
    ));
    
    _setupInterceptors();
  }
  
  void _setupInterceptors() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Add auth token to request
        final token = await _storageService.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        // Handle token refresh if 401
        if (e.response?.statusCode == 401) {
          // Handle unauthorized error
        }
        return handler.next(e);
      }
    ));
  }
  
  // Generic request methods
  Future<dynamic> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return response.data;
    } catch (e) {
      _handleError(e);
    }
  }
  
  Future<dynamic> post(String path, {dynamic data}) async {
    try {
      final response = await _dio.post(path, data: data);
      return response.data;
    } catch (e) {
      _handleError(e);
    }
  }
  
  Future<dynamic> put(String path, {dynamic data}) async {
    try {
      final response = await _dio.put(path, data: data);
      return response.data;
    } catch (e) {
      _handleError(e);
    }
  }
  
  Future<dynamic> delete(String path) async {
    try {
      final response = await _dio.delete(path);
      return response.data;
    } catch (e) {
      _handleError(e);
    }
  }
  
  void _handleError(dynamic error) {
    if (error is DioException) {
      // Handle different error types
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          throw Exception("Connection timed out");
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final errorMessage = error.response?.data['message'] ?? 'Unknown error';
          throw Exception("Error $statusCode: $errorMessage");
        default:
          throw Exception("Network error: ${error.message}");
      }
    } else {
      throw Exception("Unexpected error: $error");
    }
  }
}
```

## API Services

### Auth Service

```dart
// lib/services/auth_service.dart
class AuthService {
  final ApiService _apiService;
  final StorageService _storageService;
  
  AuthService(this._apiService, this._storageService);
  
  Future<UserModel> login(String email, String password) async {
    final response = await _apiService.post('/login', data: {
      'email': email,
      'password': password,
      'device_name': await _getDeviceName()
    });
    
    if (response['success']) {
      final token = response['data']['token'];
      await _storageService.saveToken(token);
      return UserModel.fromJson(response['data']['user']);
    } else {
      throw Exception(response['message'] ?? 'Login failed');
    }
  }
  
  Future<void> logout() async {
    await _apiService.post('/logout');
    await _storageService.deleteToken();
  }
  
  Future<String> _getDeviceName() async {
    DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
    if (Platform.isAndroid) {
      AndroidDeviceInfo androidInfo = await deviceInfo.androidInfo;
      return androidInfo.model;
    } else if (Platform.isIOS) {
      IosDeviceInfo iosInfo = await deviceInfo.iosInfo;
      return iosInfo.name;
    }
    return 'Unknown Device';
  }
}
```

### Product Service

```dart
// lib/services/product_service.dart
class ProductService {
  final ApiService _apiService;
  
  ProductService(this._apiService);
  
  Future<List<ProductModel>> getProducts({
    int? categoryId,
    String? search,
    int page = 1
  }) async {
    final response = await _apiService.get('/products', queryParameters: {
      if (categoryId != null) 'category_id': categoryId,
      if (search != null) 'search': search,
      'page': page
    });
    
    if (response['success']) {
      final List<dynamic> productsJson = response['data'];
      return productsJson.map((json) => ProductModel.fromJson(json)).toList();
    } else {
      throw Exception(response['message'] ?? 'Failed to fetch products');
    }
  }
  
  Future<ProductModel> getProductDetails(int productId) async {
    final response = await _apiService.get('/products/$productId');
    
    if (response['success']) {
      return ProductModel.fromJson(response['data']);
    } else {
      throw Exception(response['message'] ?? 'Failed to fetch product details');
    }
  }
}
```

### Service Booking Service

```dart
// lib/services/service_service.dart
class ServiceService {
  final ApiService _apiService;
  
  ServiceService(this._apiService);
  
  Future<List<ServiceModel>> getServices({
    int? categoryId,
    String? search,
    int page = 1
  }) async {
    final response = await _apiService.get('/services', queryParameters: {
      if (categoryId != null) 'category_id': categoryId,
      if (search != null) 'search': search,
      'page': page
    });
    
    if (response['success']) {
      final List<dynamic> servicesJson = response['data'];
      return servicesJson.map((json) => ServiceModel.fromJson(json)).toList();
    } else {
      throw Exception(response['message'] ?? 'Failed to fetch services');
    }
  }
  
  Future<ServiceModel> getServiceDetails(int serviceId) async {
    final response = await _apiService.get('/services/$serviceId');
    
    if (response['success']) {
      return ServiceModel.fromJson(response['data']);
    } else {
      throw Exception(response['message'] ?? 'Failed to fetch service details');
    }
  }
  
  Future<Map<String, dynamic>> calculateServicePrice(
    int serviceId,
    List<Map<String, dynamic>> fieldValues,
    List<Map<String, dynamic>> products
  ) async {
    final response = await _apiService.post('/service-builder/calculate', data: {
      'service_id': serviceId,
      'field_values': fieldValues,
      'products': products
    });
    
    if (response['success']) {
      return response['calculation'];
    } else {
      throw Exception(response['message'] ?? 'Failed to calculate service price');
    }
  }
  
  Future<Map<String, dynamic>> submitServiceOrder(
    int serviceId,
    String customerName,
    String customerEmail,
    String customerPhone,
    List<Map<String, dynamic>> fieldValues,
    List<Map<String, dynamic>> products,
    String? notes
  ) async {
    final response = await _apiService.post('/service-builder/submit-order', data: {
      'service_id': serviceId,
      'customer_name': customerName,
      'customer_email': customerEmail,
      'customer_phone': customerPhone,
      'field_values': fieldValues,
      'products': products,
      'notes': notes
    });
    
    if (response['success']) {
      return {
        'order_id': response['order_id'],
        'estimated_delivery': response['estimated_delivery']
      };
    } else {
      throw Exception(response['message'] ?? 'Failed to submit service order');
    }
  }
}
```

### Order Service

```dart
// lib/services/order_service.dart
class OrderService {
  final ApiService _apiService;
  
  OrderService(this._apiService);
  
  Future<List<OrderModel>> getOrders() async {
    final response = await _apiService.get('/my-orders');
    
    if (response['success']) {
      final List<dynamic> ordersJson = response['orders'];
      return ordersJson.map((json) => OrderModel.fromJson(json)).toList();
    } else {
      throw Exception(response['message'] ?? 'Failed to fetch orders');
    }
  }
  
  Future<OrderModel> getOrderDetails(int orderId) async {
    final response = await _apiService.get('/my-orders/$orderId');
    
    if (response['success']) {
      return OrderModel.fromJson(response['order']);
    } else {
      throw Exception(response['message'] ?? 'Failed to fetch order details');
    }
  }
  
  Future<Map<String, dynamic>> createOrder(Map<String, dynamic> orderData) async {
    final response = await _apiService.post('/orders', data: orderData);
    
    if (response['success']) {
      return {
        'order_id': response['order_id'],
        'payment_url': response['payment_url']
      };
    } else {
      throw Exception(response['message'] ?? 'Failed to create order');
    }
  }
}
```

### Profile Service

```dart
// lib/services/profile_service.dart
class ProfileService {
  final ApiService _apiService;
  
  ProfileService(this._apiService);
  
  Future<UserModel> getUserProfile() async {
    final response = await _apiService.get('/user');
    
    if (response['success']) {
      return UserModel.fromJson(response['data']);
    } else {
      throw Exception(response['message'] ?? 'Failed to fetch user profile');
    }
  }
  
  Future<UserModel> updateUserProfile(Map<String, dynamic> profileData) async {
    final response = await _apiService.put('/profile', data: profileData);
    
    if (response['success']) {
      return UserModel.fromJson(response['data']);
    } else {
      throw Exception(response['message'] ?? 'Failed to update user profile');
    }
  }
  
  Future<List<AddressModel>> getUserAddresses() async {
    final response = await _apiService.get('/addresses');
    
    if (response['success']) {
      final List<dynamic> addressesJson = response['data'];
      return addressesJson.map((json) => AddressModel.fromJson(json)).toList();
    } else {
      throw Exception(response['message'] ?? 'Failed to fetch addresses');
    }
  }
  
  Future<AddressModel> addAddress(Map<String, dynamic> addressData) async {
    final response = await _apiService.post('/addresses', data: addressData);
    
    if (response['success']) {
      return AddressModel.fromJson(response['data']);
    } else {
      throw Exception(response['message'] ?? 'Failed to add address');
    }
  }
  
  Future<AddressModel> updateAddress(int addressId, Map<String, dynamic> addressData) async {
    final response = await _apiService.put('/addresses/$addressId', data: addressData);
    
    if (response['success']) {
      return AddressModel.fromJson(response['data']);
    } else {
      throw Exception(response['message'] ?? 'Failed to update address');
    }
  }
  
  Future<void> deleteAddress(int addressId) async {
    final response = await _apiService.delete('/addresses/$addressId');
    
    if (!response['success']) {
      throw Exception(response['message'] ?? 'Failed to delete address');
    }
  }
  
  Future<void> setDefaultAddress(int addressId) async {
    final response = await _apiService.put('/addresses/$addressId/default');
    
    if (!response['success']) {
      throw Exception(response['message'] ?? 'Failed to set default address');
    }
  }
}
```

## Data Models

### User Model

```dart
// lib/models/user_model.dart
class UserModel {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? role;
  final bool verified;
  final bool profileComplete;
  
  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.role,
    this.verified = false,
    this.profileComplete = false,
  });
  
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'].toString(),
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      role: json['role'],
      verified: json['verified'] ?? false,
      profileComplete: json['profile_complete'] ?? false,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
      'verified': verified,
      'profile_complete': profileComplete,
    };
  }
}
```

### Product Model

```dart
// lib/models/product_model.dart
class ProductModel {
  final int id;
  final String name;
  final String description;
  final double price;
  final String? imagePath;
  final int categoryId;
  final bool isAvailable;
  
  ProductModel({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.imagePath,
    required this.categoryId,
    required this.isAvailable,
  });
  
  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      price: double.parse(json['price'].toString()),
      imagePath: json['image_path'],
      categoryId: json['category_id'],
      isAvailable: json['is_available'] ?? true,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'image_path': imagePath,
      'category_id': categoryId,
      'is_available': isAvailable,
    };
  }
}
```

## Using API in Controllers

```dart
// lib/controllers/products_controller.dart
class ProductsController extends GetxController {
  final ProductService _productService;
  
  ProductsController(this._productService);
  
  RxList<ProductModel> products = <ProductModel>[].obs;
  RxBool isLoading = false.obs;
  RxString error = ''.obs;
  RxInt currentPage = 1.obs;
  RxBool hasMorePages = true.obs;
  
  Future<void> getProducts({
    int? categoryId,
    String? search,
    bool refresh = false
  }) async {
    if (refresh) {
      currentPage.value = 1;
      hasMorePages.value = true;
    }
    
    if (!hasMorePages.value && !refresh) return;
    
    try {
      isLoading.value = true;
      error.value = '';
      
      final newProducts = await _productService.getProducts(
        categoryId: categoryId,
        search: search,
        page: currentPage.value
      );
      
      if (refresh) {
        products.clear();
      }
      
      if (newProducts.isEmpty) {
        hasMorePages.value = false;
      } else {
        products.addAll(newProducts);
        currentPage.value++;
      }
    } catch (e) {
      error.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }
}
```

## Error Handling

```dart
// lib/utils/api_error_handler.dart
class ApiErrorHandler {
  static String getMessage(dynamic error) {
    if (error is Exception) {
      return error.toString().replaceAll('Exception: ', '');
    }
    return 'An unexpected error occurred';
  }
  
  static void showError(String message) {
    Get.snackbar(
      'Error',
      message,
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.red,
      colorText: Colors.white,
    );
  }
}
```

## API Endpoints Reference

### Authentication Endpoints
- `POST /api/register`: User registration
- `POST /api/login`: User login
- `POST /api/logout`: User logout
- `GET /api/user`: Get authenticated user details

### Categories Endpoints
- `GET /api/categories`: Get all categories
- `GET /api/categories/{id}`: Get category details

### Products Endpoints
- `GET /api/products`: Get all products
- `GET /api/products/{id}`: Get product details

### Services Endpoints
- `GET /api/services`: Get all services
- `GET /api/services/{id}`: Get service details
- `POST /api/service-builder/calculate`: Calculate service price
- `POST /api/service-builder/submit-order`: Submit service order

### Orders Endpoints
- `POST /api/orders`: Create a new order
- `GET /api/orders/{id}`: Get order details
- `GET /api/my-orders`: Get user's order history

### Profile Endpoints
- `GET /api/user`: Get user profile
- `PUT /api/profile`: Update user profile
- `PUT /api/notification-preferences`: Update notification preferences
- `DELETE /api/account`: Delete user account

### Address Endpoints
- `GET /api/addresses`: Get user addresses
- `POST /api/addresses`: Create new address
- `PUT /api/addresses/{id}`: Update address
- `DELETE /api/addresses/{id}`: Delete address
- `PUT /api/addresses/{id}/default`: Set default address
