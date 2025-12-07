# BuildingZ Flutter App - Complete Development Guide
## Part 2: API Services & File Upload

---

## 5. Service Builder API Implementation

### 5.1 Service Builder Service

**File:** `lib/services/service_builder_service.dart`

```dart
import 'package:dio/dio.dart';
import 'dart:io';
import '../models/category.dart';
import '../models/service.dart';
import '../models/order.dart';
import 'api_service.dart';

class ServiceBuilderService {
  final ApiService _api;

  ServiceBuilderService(this.api);

  // Get All Categories
  Future<List<Category>> getAllCategories() async {
    try {
      final response = await _api.get('/service-builder/categories');
      
      if (response.data['success'] == true) {
        final List<dynamic> categoriesJson = response.data['categories'];
        return categoriesJson.map((json) => Category.fromJson(json)).toList();
      }
      
      throw Exception(response.data['message'] ?? 'Failed to load categories');
    } catch (e) {
      throw Exception('Failed to load categories: $e');
    }
  }

  // Get Category by ID
  Future<Category> getCategoryById(int id) async {
    try {
      final response = await _api.get('/service-builder/categories/$id');
      
      if (response.data['success'] == true) {
        return Category.fromJson(response.data['category']);
      }
      
      throw Exception(response.data['message'] ?? 'Failed to load category');
    } catch (e) {
      throw Exception('Failed to load category: $e');
    }
  }

  // Get Service by ID
  Future<Service> getServiceById(int id) async {
    try {
      final response = await _api.get('/service-builder/services/$id');
      
      if (response.data['success'] == true) {
        return Service.fromJson(response.data['service']);
      }
      
      throw Exception(response.data['message'] ?? 'Failed to load service');
    } catch (e) {
      throw Exception('Failed to load service: $e');
    }
  }

  // Submit Order (JSON - No Files)
  Future<OrderResponse> submitOrderJson(OrderRequest orderRequest) async {
    try {
      final response = await _api.post(
        '/service-builder/orders',
        data: orderRequest.toJson(),
      );
      
      return OrderResponse.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to submit order: $e');
    }
  }

  // Submit Order (Multipart - With Files)
  Future<OrderResponse> submitOrderWithFiles({
    required OrderRequest orderRequest,
    required Map<int, File> files, // Map of field_id -> File
    ProgressCallback? onProgress,
  }) async {
    try {
      final formData = FormData();

      // Add basic fields
      formData.fields.addAll([
        MapEntry('service_id', orderRequest.serviceId.toString()),
        MapEntry('customer_name', orderRequest.customerName),
        MapEntry('customer_email', orderRequest.customerEmail),
        MapEntry('customer_phone', orderRequest.customerPhone),
        MapEntry('emirate', orderRequest.emirate),
        MapEntry('payment_method', orderRequest.paymentMethod),
      ]);

      // Add notes if present
      if (orderRequest.notes != null && orderRequest.notes!.isNotEmpty) {
        formData.fields.add(MapEntry('notes', orderRequest.notes!));
      }

      // Add field values
      for (int i = 0; i < orderRequest.fieldValues.length; i++) {
        final fieldValue = orderRequest.fieldValues[i];
        formData.fields.add(
          MapEntry('field_values[$i][field_id]', fieldValue.fieldId.toString())
        );
        if (fieldValue.optionId != null) {
          formData.fields.add(
            MapEntry('field_values[$i][option_id]', fieldValue.optionId.toString())
          );
        }
        formData.fields.add(
          MapEntry('field_values[$i][value]', fieldValue.value)
        );
      }

      // Add products
      for (int i = 0; i < orderRequest.products.length; i++) {
        final product = orderRequest.products[i];
        formData.fields.addAll([
          MapEntry('products[$i][product_id]', product.productId.toString()),
          MapEntry('products[$i][quantity]', product.quantity.toString()),
        ]);
      }

      // Add files with key format: field_files[field_{id}]
      for (var entry in files.entries) {
        final fieldId = entry.key;
        final file = entry.value;
        
        formData.files.add(
          MapEntry(
            'field_files[field_$fieldId]',
            await MultipartFile.fromFile(
              file.path,
              filename: file.path.split('/').last,
            ),
          ),
        );
      }

      // Add shipping address if present
      if (orderRequest.shippingAddress != null) {
        final address = orderRequest.shippingAddress!;
        formData.fields.addAll([
          MapEntry('shipping_address[name]', address.name),
          MapEntry('shipping_address[street]', address.street),
          MapEntry('shipping_address[city]', address.city),
          MapEntry('shipping_address[state]', address.state),
          MapEntry('shipping_address[country]', address.country),
          MapEntry('shipping_address[phone]', address.phone),
        ]);
      }

      final response = await _api.postMultipart(
        '/service-builder/orders',
        formData,
        onSendProgress: onProgress,
      );

      return OrderResponse.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to submit order: $e');
    }
  }

  // Calculate Price (if custom calculations enabled)
  Future<Map<String, dynamic>> calculatePrice({
    required int serviceId,
    required Map<String, dynamic> fieldValues,
  }) async {
    try {
      final response = await _api.post(
        '/service-builder/calculate',
        data: {
          'service_id': serviceId,
          'field_values': fieldValues,
        },
      );

      return response.data;
    } catch (e) {
      throw Exception('Failed to calculate price: $e');
    }
  }
}
```

**Usage Example:**

```dart
// Without files (JSON)
final orderRequest = OrderRequest(
  serviceId: 33,
  customerName: 'Ahmed Mohammed',
  customerEmail: 'ahmed@example.com',
  customerPhone: '+971501234567',
  emirate: 'Dubai',
  fieldValues: [
    OrderFieldValue(
      fieldId: 293,
      optionId: 286,
      value: 'تصميم',
    ),
  ],
  products: [],
  paymentMethod: 'cash_on_delivery',
);

final response = await serviceBuilderService.submitOrderJson(orderRequest);
print('Order ID: ${response.orderId}');

// With files (Multipart)
final files = {
  232: File('/path/to/design.pdf'),
  // fieldId: File
};

final responseWithFiles = await serviceBuilderService.submitOrderWithFiles(
  orderRequest: orderRequest,
  files: files,
  onProgress: (sent, total) {
    print('Upload progress: ${(sent / total * 100).toStringAsFixed(0)}%');
  },
);
```

---

### 5.2 Auth Service

**File:** `lib/services/auth_service.dart`

```dart
import '../models/user.dart';
import 'api_service.dart';
import 'storage_service.dart';

class AuthService {
  final ApiService _api;
  final StorageService _storage;

  AuthService(this._api, this._storage);

  // Sign Up
  Future<Map<String, dynamic>> signup({
    required String name,
    required String email,
    required String phone,
    required String password,
    required String passwordConfirmation,
  }) async {
    try {
      final response = await _api.post(
        '/auth/signup',
        data: {
          'name': name,
          'email': email,
          'phone': phone,
          'password': password,
          'password_confirmation': passwordConfirmation,
        },
      );

      if (response.data['success'] == true) {
        final user = User.fromJson(response.data['user']);
        final token = response.data['token'];

        // Save to local storage
        await _storage.saveToken(token);
        await _storage.saveUser(user);

        return {
          'success': true,
          'user': user,
          'token': token,
        };
      }

      throw Exception(response.data['message'] ?? 'Signup failed');
    } catch (e) {
      throw Exception('Signup failed: $e');
    }
  }

  // Login
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _api.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.data['success'] == true) {
        final user = User.fromJson(response.data['user']);
        final token = response.data['token'];

        // Save to local storage
        await _storage.saveToken(token);
        await _storage.saveUser(user);

        return {
          'success': true,
          'user': user,
          'token': token,
        };
      }

      throw Exception(response.data['message'] ?? 'Login failed');
    } catch (e) {
      throw Exception('Login failed: $e');
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      await _api.post('/auth/logout');
    } catch (e) {
      // Continue even if API call fails
    } finally {
      await _storage.logout();
    }
  }

  // Get Current User
  Future<User?> getCurrentUser() async {
    return await _storage.getUser();
  }

  // Check if authenticated
  Future<bool> isAuthenticated() async {
    return await _storage.isAuthenticated();
  }
}
```

**API Response Examples:**

**Signup/Login Success:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Ahmed Mohammed",
    "email": "ahmed@example.com",
    "phone": "+971501234567",
    "profile_picture": null,
    "email_verified_at": null,
    "created_at": "2024-10-13T10:30:00.000000Z",
    "updated_at": "2024-10-13T10:30:00.000000Z"
  },
  "token": "1|abc123def456ghi789..."
}
```

**Signup/Login Error:**
```json
{
  "success": false,
  "message": "The email has already been taken.",
  "errors": {
    "email": [
      "The email has already been taken."
    ]
  }
}
```

---

### 5.3 Search Service

**File:** `lib/services/search_service.dart`

```dart
import '../models/category.dart';
import '../models/service.dart';
import '../models/product.dart';
import 'api_service.dart';

class SearchResponse {
  final String query;
  final List<Category> categories;
  final List<Service> services;
  final List<Product> products;
  final int totalResults;

  SearchResponse({
    required this.query,
    required this.categories,
    required this.services,
    required this.products,
    required this.totalResults,
  });

  factory SearchResponse.fromJson(Map<String, dynamic> json) {
    return SearchResponse(
      query: json['query'],
      categories: (json['results']['categories'] as List)
          .map((e) => Category.fromJson(e))
          .toList(),
      services: (json['results']['services'] as List)
          .map((e) => Service.fromJson(e))
          .toList(),
      products: (json['results']['products'] as List)
          .map((e) => Product.fromJson(e))
          .toList(),
      totalResults: json['total_results'],
    );
  }
}

class SearchService {
  final ApiService _api;

  SearchService(this._api);

  // Global Search
  Future<SearchResponse> search({
    required String query,
    String type = 'all', // all, categories, services, products
    int limit = 10,
  }) async {
    // Validation
    if (query.length < 2) {
      throw Exception('Query must be at least 2 characters');
    }

    if (limit < 1 || limit > 50) {
      throw Exception('Limit must be between 1 and 50');
    }

    try {
      final response = await _api.get(
        '/search',
        queryParameters: {
          'query': query,
          'type': type,
          'limit': limit,
        },
      );

      if (response.data['success'] == true) {
        return SearchResponse.fromJson(response.data);
      }

      throw Exception(response.data['message'] ?? 'Search failed');
    } catch (e) {
      throw Exception('Search failed: $e');
    }
  }

  // Search Categories only
  Future<List<Category>> searchCategories(String query, {int limit = 10}) async {
    final response = await search(query: query, type: 'categories', limit: limit);
    return response.categories;
  }

  // Search Services only
  Future<List<Service>> searchServices(String query, {int limit = 10}) async {
    final response = await search(query: query, type: 'services', limit: limit);
    return response.services;
  }

  // Search Products only
  Future<List<Product>> searchProducts(String query, {int limit = 10}) async {
    final response = await search(query: query, type: 'products', limit: limit);
    return response.products;
  }

  // Get search suggestions (autocomplete)
  Future<List<String>> getSuggestions(String query) async {
    if (query.length < 2) return [];

    try {
      final response = await search(query: query, limit: 5);
      
      List<String> suggestions = [];
      
      // Add category names
      suggestions.addAll(response.categories.map((c) => c.name));
      
      // Add service names
      suggestions.addAll(response.services.map((s) => s.name));
      
      // Add product names
      suggestions.addAll(response.products.map((p) => p.name));
      
      return suggestions.take(10).toList();
    } catch (e) {
      return [];
    }
  }
}
```

**API Response Example:**
```json
{
  "success": true,
  "query": "تصميم",
  "results": {
    "categories": [
      {
        "id": 18,
        "name": "الاستشارات الهندسية",
        "slug": "alastsharat-alhndsy",
        "description": null,
        "preview_image_path": "service-builder/categories/image.png"
      }
    ],
    "services": [
      {
        "id": 33,
        "name": "تصميم واشراف",
        "slug": "tsmym-oashraf",
        "description": "التصاميم المعمارية",
        "preview_image_path": "service-builder/services/image.webp",
        "category": {
          "id": 18,
          "name": "الاستشارات الهندسية"
        }
      }
    ],
    "products": []
  },
  "total_results": 1
}
```

---

### 5.4 Notification Service

**File:** `lib/services/notification_service.dart`

```dart
import '../models/notification.dart';
import 'api_service.dart';

class NotificationService {
  final ApiService _api;

  NotificationService(this._api);

  // Get all notifications
  Future<List<AppNotification>> getNotifications() async {
    try {
      final response = await _api.get('/notifications');

      final List<dynamic> notificationsJson = response.data['notifications'];
      return notificationsJson
          .map((json) => AppNotification.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to load notifications: $e');
    }
  }

  // Mark notification as read
  Future<void> markAsRead(String notificationId) async {
    try {
      await _api.post('/notifications/$notificationId/read');
    } catch (e) {
      throw Exception('Failed to mark notification as read: $e');
    }
  }

  // Delete notification
  Future<void> deleteNotification(String notificationId) async {
    try {
      await _api.delete('/notifications/$notificationId');
    } catch (e) {
      throw Exception('Failed to delete notification: $e');
    }
  }

  // Get unread count
  Future<int> getUnreadCount() async {
    try {
      final notifications = await getNotifications();
      return notifications.where((n) => n.readAt == null).length;
    } catch (e) {
      return 0;
    }
  }
}
```

**Notification Model:**

**File:** `lib/models/notification.dart`

```dart
import 'package:json_annotation/json_annotation.dart';

part 'notification.g.dart';

@JsonSerializable(explicitToJson: true)
class AppNotification {
  final String id;
  final String type;
  final NotificationData data;
  @JsonKey(name: 'read_at')
  final DateTime? readAt;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  AppNotification({
    required this.id,
    required this.type,
    required this.data,
    this.readAt,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) =>
      _$AppNotificationFromJson(json);
  Map<String, dynamic> toJson() => _$AppNotificationToJson(this);

  bool get isUnread => readAt == null;
}

@JsonSerializable()
class NotificationData {
  final String title;
  final String message;
  final String icon;
  final String? url;

  NotificationData({
    required this.title,
    required this.message,
    required this.icon,
    this.url,
  });

  factory NotificationData.fromJson(Map<String, dynamic> json) =>
      _$NotificationDataFromJson(json);
  Map<String, dynamic> toJson() => _$NotificationDataToJson(this);
}
```

---

## 6. Complete File Upload Implementation

### 6.1 File Upload Widget

**File:** `lib/widgets/forms/file_upload_field.dart`

```dart
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import '../../config/app_config.dart';

class FileUploadField extends StatefulWidget {
  final String label;
  final bool required;
  final Function(File?) onFileSelected;
  final File? initialFile;

  const FileUploadField({
    Key? key,
    required this.label,
    this.required = false,
    required this.onFileSelected,
    this.initialFile,
  }) : super(key: key);

  @override
  State<FileUploadField> createState() => _FileUploadFieldState();
}

class _FileUploadFieldState extends State<FileUploadField> {
  File? _selectedFile;

  @override
  void initState() {
    super.initState();
    _selectedFile = widget.initialFile;
  }

  Future<void> _pickFile() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: AppConfig.allowedFileTypes,
      );

      if (result != null && result.files.single.path != null) {
        final file = File(result.files.single.path!);
        
        // Check file size
        final fileSize = await file.length();
        if (fileSize > AppConfig.maxFileSize) {
          _showError('File size exceeds 10MB limit');
          return;
        }

        setState(() {
          _selectedFile = file;
        });

        widget.onFileSelected(file);
      }
    } catch (e) {
      _showError('Failed to pick file: $e');
    }
  }

  void _removeFile() {
    setState(() {
      _selectedFile = null;
    });
    widget.onFileSelected(null);
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  String _getFileName() {
    if (_selectedFile == null) return '';
    return _selectedFile!.path.split('/').last;
  }

  String _getFileSize() {
    if (_selectedFile == null) return '';
    final bytes = _selectedFile!.lengthSync();
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              widget.label,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            if (widget.required)
              const Text(
                ' *',
                style: TextStyle(color: Colors.red),
              ),
          ],
        ),
        const SizedBox(height: 8),
        if (_selectedFile == null)
          GestureDetector(
            onTap: _pickFile,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(8),
                color: Colors.grey.shade50,
              ),
              child: Row(
                children: [
                  Icon(Icons.cloud_upload, color: Colors.grey.shade600),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Click to upload file',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  ),
                  Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey.shade600),
                ],
              ),
            ),
          )
        else
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.green.shade300),
              borderRadius: BorderRadius.circular(8),
              color: Colors.green.shade50,
            ),
            child: Row(
              children: [
                Icon(Icons.insert_drive_file, color: Colors.green.shade700),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _getFileName(),
                        style: const TextStyle(fontWeight: FontWeight.w500),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        _getFileSize(),
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.red),
                  onPressed: _removeFile,
                ),
              ],
            ),
          ),
      ],
    );
  }
}
```

### 6.2 Service Booking Screen with File Upload

**File:** `lib/screens/services/service_booking_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import '../../models/service.dart';
import '../../models/field.dart';
import '../../models/order.dart';
import '../../services/service_builder_service.dart';
import '../../widgets/forms/file_upload_field.dart';
import '../../config/app_config.dart';

class ServiceBookingScreen extends StatefulWidget {
  final Service service;

  const ServiceBookingScreen({Key? key, required this.service}) : super(key: key);

  @override
  State<ServiceBookingScreen> createState() => _ServiceBookingScreenState();
}

class _ServiceBookingScreenState extends State<ServiceBookingScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Form data
  final Map<int, dynamic> _fieldValues = {};
  final Map<int, File> _uploadedFiles = {};
  
  // Customer info
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  String? _selectedEmirate;
  
  bool _isSubmitting = false;
  double _uploadProgress = 0;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  // Build dynamic form field
  Widget _buildFormField(Field field) {
    switch (field.type) {
      case FieldType.text:
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label + (field.required ? ' *' : ''),
            border: const OutlineInputBorder(),
          ),
          validator: field.required
              ? (value) => value?.isEmpty ?? true ? 'This field is required' : null
              : null,
          onSaved: (value) => _fieldValues[field.id] = value,
        );

      case FieldType.number:
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label + (field.required ? ' *' : ''),
            border: const OutlineInputBorder(),
            suffixText: field.unit,
          ),
          keyboardType: TextInputType.number,
          validator: (value) {
            if (field.required && (value?.isEmpty ?? true)) {
              return 'This field is required';
            }
            if (value != null && value.isNotEmpty) {
              final number = double.tryParse(value);
              if (number == null) return 'Please enter a valid number';
              
              if (field.minValue != null && number < field.minValue!) {
                return 'Minimum value is ${field.minValue}';
              }
              if (field.maxValue != null && number > field.maxValue!) {
                return 'Maximum value is ${field.maxValue}';
              }
            }
            return null;
          },
          onSaved: (value) => _fieldValues[field.id] = value,
        );

      case FieldType.checkbox:
        return _buildCheckboxField(field);

      case FieldType.radio:
        return _buildRadioField(field);

      case FieldType.file:
        return FileUploadField(
          label: field.label,
          required: field.required,
          onFileSelected: (file) {
            if (file != null) {
              _uploadedFiles[field.id] = file;
              _fieldValues[field.id] = file.path.split('/').last;
            } else {
              _uploadedFiles.remove(field.id);
              _fieldValues.remove(field.id);
            }
          },
        );

      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildCheckboxField(Field field) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          field.label + (field.required ? ' *' : ''),
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 8),
        ...field.options.map((option) {
          return CheckboxListTile(
            title: Text(option.label),
            value: (_fieldValues[field.id] as List<int>?)?.contains(option.id) ?? false,
            onChanged: (checked) {
              setState(() {
                if (_fieldValues[field.id] == null) {
                  _fieldValues[field.id] = <int>[];
                }
                
                final values = _fieldValues[field.id] as List<int>;
                if (checked == true) {
                  values.add(option.id);
                } else {
                  values.remove(option.id);
                }
              });
            },
          );
        }).toList(),
      ],
    );
  }

  Widget _buildRadioField(Field field) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          field.label + (field.required ? ' *' : ''),
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 8),
        ...field.options.map((option) {
          return RadioListTile<int>(
            title: Text(option.label),
            value: option.id,
            groupValue: _fieldValues[field.id] as int?,
            onChanged: (value) {
              setState(() {
                _fieldValues[field.id] = value;
              });
            },
          );
        }).toList(),
      ],
    );
  }

  Future<void> _submitOrder() async {
    if (!_formKey.currentState!.validate()) return;
    
    _formKey.currentState!.save();

    // Validate required fields
    for (final field in widget.service.fields) {
      if (field.required) {
        if (field.type == FieldType.checkbox) {
          final values = _fieldValues[field.id] as List<int>?;
          if (values == null || values.isEmpty) {
            _showError('Please select at least one option for ${field.label}');
            return;
          }
        } else if (!_fieldValues.containsKey(field.id) || 
                   _fieldValues[field.id] == null ||
                   _fieldValues[field.id].toString().isEmpty) {
          _showError('${field.label} is required');
          return;
        }
      }
    }

    setState(() {
      _isSubmitting = true;
      _uploadProgress = 0;
    });

    try {
      // Format field values
      final List<OrderFieldValue> formattedFieldValues = [];
      
      for (final entry in _fieldValues.entries) {
        final field = widget.service.fields.firstWhere((f) => f.id == entry.key);
        
        if (field.type == FieldType.file) continue; // Skip files
        
        if (field.type == FieldType.checkbox) {
          final selectedIds = entry.value as List<int>;
          if (selectedIds.isNotEmpty) {
            final selectedLabels = selectedIds
                .map((id) => field.options.firstWhere((o) => o.id == id).value)
                .join(', ');
            
            formattedFieldValues.add(OrderFieldValue(
              fieldId: entry.key,
              optionId: selectedIds.first,
              value: selectedLabels,
            ));
          }
        } else if (field.type == FieldType.radio || field.type == FieldType.select) {
          final optionId = entry.value as int;
          final option = field.options.firstWhere((o) => o.id == optionId);
          
          formattedFieldValues.add(OrderFieldValue(
            fieldId: entry.key,
            optionId: optionId,
            value: option.value,
          ));
        } else {
          formattedFieldValues.add(OrderFieldValue(
            fieldId: entry.key,
            value: entry.value.toString(),
          ));
        }
      }

      final orderRequest = OrderRequest(
        serviceId: widget.service.id,
        customerName: _nameController.text,
        customerEmail: _emailController.text.isEmpty 
            ? 'optional+email+notselected@buildingz.ae' 
            : _emailController.text,
        customerPhone: _phoneController.text,
        emirate: _selectedEmirate!,
        fieldValues: formattedFieldValues,
        products: [],
        paymentMethod: AppConfig.paymentCashOnDelivery,
      );

      final serviceBuilderService = context.read<ServiceBuilderService>();
      OrderResponse response;

      if (_uploadedFiles.isNotEmpty) {
        // Submit with files
        response = await serviceBuilderService.submitOrderWithFiles(
          orderRequest: orderRequest,
          files: _uploadedFiles,
          onProgress: (sent, total) {
            setState(() {
              _uploadProgress = sent / total;
            });
          },
        );
      } else {
        // Submit without files
        response = await serviceBuilderService.submitOrderJson(orderRequest);
      }

      if (response.success) {
        _showSuccessDialog(response);
      }
    } catch (e) {
      _showError('Failed to submit order: $e');
    } finally {
      setState(() {
        _isSubmitting = false;
        _uploadProgress = 0;
      });
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  void _showSuccessDialog(OrderResponse response) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Order Submitted Successfully'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Order ID: ${response.orderId}'),
            if (widget.service.whatsappNumbers.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text('Contact us on WhatsApp:'),
              ...widget.service.whatsappNumbers.map((contact) =>
                ListTile(
                  leading: const Icon(Icons.phone, color: Colors.green),
                  title: Text(contact.name),
                  subtitle: Text(contact.whatsappNumber),
                  onTap: () {
                    // Launch WhatsApp
                    // url_launcher.launch(contact.getWhatsAppUrl());
                  },
                )
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.service.name),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Customer Information
            const Text(
              'Customer Information',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Name *',
                border: OutlineInputBorder(),
              ),
              validator: (value) => value?.isEmpty ?? true ? 'Name is required' : null,
            ),
            const SizedBox(height: 16),
            
            TextFormField(
              controller: _phoneController,
              decoration: const InputDecoration(
                labelText: 'Phone *',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.phone,
              validator: (value) => value?.isEmpty ?? true ? 'Phone is required' : null,
            ),
            const SizedBox(height: 16),
            
            TextFormField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email (optional)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            
            DropdownButtonFormField<String>(
              value: _selectedEmirate,
              decoration: const InputDecoration(
                labelText: 'Emirate *',
                border: OutlineInputBorder(),
              ),
              items: AppConfig.emirates.map((emirate) {
                return DropdownMenuItem(
                  value: emirate,
                  child: Text(AppConfig.emiratesArabic[emirate] ?? emirate),
                );
              }).toList(),
              validator: (value) => value == null ? 'Emirate is required' : null,
              onChanged: (value) => setState(() => _selectedEmirate = value),
            ),
            
            const SizedBox(height: 32),
            
            // Dynamic Fields
            if (widget.service.fields.isNotEmpty) ...[
              const Text(
                'Service Details',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              
              ...widget.service.fields.map((field) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: _buildFormField(field),
              )),
            ],
            
            const SizedBox(height: 32),
            
            // Submit Button
            if (_isSubmitting && _uploadProgress > 0)
              Column(
                children: [
                  LinearProgressIndicator(value: _uploadProgress),
                  const SizedBox(height: 8),
                  Text('Uploading... ${(_uploadProgress * 100).toStringAsFixed(0)}%'),
                ],
              )
            else
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitOrder,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(16),
                  backgroundColor: const Color(0xFFF39C12),
                ),
                child: _isSubmitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'Submit Order',
                        style: TextStyle(fontSize: 16, color: Colors.white),
                      ),
              ),
          ],
        ),
      ),
    );
  }
}
```

---

**Continue to Part 3 for:**
- State Management with Provider/Riverpod
- Complete UI Components
- Theme Configuration
- Navigation Setup
- Push Notifications
- Testing Guide



