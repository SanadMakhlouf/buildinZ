# BuildingZ Flutter App - Complete Development Guide
## Part 4: Authentication, Notifications, Testing & Deployment

---

## 12. Complete Authentication Screens

### 12.1 Login Screen

**File:** `lib/screens/auth/login_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../config/routes.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    
    final success = await authProvider.login(
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (success && mounted) {
      Navigator.pushReplacementNamed(context, AppRoutes.home);
    } else if (authProvider.error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.error!),
          backgroundColor: Colors.red,
        ),
      );
      authProvider.clearError();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo
                  Container(
                    height: 100,
                    decoration: const BoxDecoration(
                      color: Color(0xFFF39C12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.home_repair_service,
                      size: 50,
                      color: Colors.white,
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // Title
                  const Text(
                    'Welcome Back',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  
                  const SizedBox(height: 8),
                  
                  Text(
                    'Login to your account',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey.shade600,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // Email Field
                  TextFormField(
                    controller: _emailController,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      prefixIcon: Icon(Icons.email),
                    ),
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your email';
                      }
                      if (!value.contains('@')) {
                        return 'Please enter a valid email';
                      }
                      return null;
                    },
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Password Field
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      prefixIcon: const Icon(Icons.lock),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility_off : Icons.visibility,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your password';
                      }
                      return null;
                    },
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Login Button
                  Consumer<AuthProvider>(
                    builder: (context, authProvider, child) {
                      return ElevatedButton(
                        onPressed: authProvider.isLoading ? null : _login,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.all(16),
                        ),
                        child: authProvider.isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text(
                                'Login',
                                style: TextStyle(fontSize: 16),
                              ),
                      );
                    },
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Signup Link
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Don't have an account? "),
                      TextButton(
                        onPressed: () {
                          Navigator.pushNamed(context, AppRoutes.signup);
                        },
                        child: const Text('Sign Up'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

---

### 12.2 Signup Screen

**File:** `lib/screens/auth/signup_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../config/routes.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({Key? key}) : super(key: key);

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _signup() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    
    final success = await authProvider.signup(
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
      password: _passwordController.text,
    );

    if (success && mounted) {
      Navigator.pushReplacementNamed(context, AppRoutes.home);
    } else if (authProvider.error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.error!),
          backgroundColor: Colors.red,
        ),
      );
      authProvider.clearError();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sign Up'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Create Account',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                const SizedBox(height: 32),
                
                // Name Field
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    labelText: 'Full Name',
                    prefixIcon: Icon(Icons.person),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your name';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 16),
                
                // Email Field
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    prefixIcon: Icon(Icons.email),
                  ),
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your email';
                    }
                    if (!value.contains('@')) {
                      return 'Please enter a valid email';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 16),
                
                // Phone Field
                TextFormField(
                  controller: _phoneController,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number',
                    prefixIcon: Icon(Icons.phone),
                    hintText: '+971501234567',
                  ),
                  keyboardType: TextInputType.phone,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your phone number';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 16),
                
                // Password Field
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: 'Password',
                    prefixIcon: const Icon(Icons.lock),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_off : Icons.visibility,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a password';
                    }
                    if (value.length < 6) {
                      return 'Password must be at least 6 characters';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 16),
                
                // Confirm Password Field
                TextFormField(
                  controller: _confirmPasswordController,
                  obscureText: _obscureConfirmPassword,
                  decoration: InputDecoration(
                    labelText: 'Confirm Password',
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscureConfirmPassword ? Icons.visibility_off : Icons.visibility,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscureConfirmPassword = !_obscureConfirmPassword;
                        });
                      },
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please confirm your password';
                    }
                    if (value != _passwordController.text) {
                      return 'Passwords do not match';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 24),
                
                // Signup Button
                Consumer<AuthProvider>(
                  builder: (context, authProvider, child) {
                    return ElevatedButton(
                      onPressed: authProvider.isLoading ? null : _signup,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.all(16),
                      ),
                      child: authProvider.isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Text(
                              'Sign Up',
                              style: TextStyle(fontSize: 16),
                            ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

---

## 13. Push Notifications Setup

### 13.1 Firebase Setup

**1. Add Firebase to your project:**
```bash
# Install FlutterFire CLI
dart pub global activate flutterfire_cli

# Configure Firebase
flutterfire configure
```

**2. Update `pubspec.yaml`:**
```yaml
dependencies:
  firebase_core: ^2.24.0
  firebase_messaging: ^14.7.0
  flutter_local_notifications: ^16.1.0
```

---

### 13.2 Firebase Initialization

**File:** `lib/main.dart` (Update)

```dart
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  // Initialize notifications
  final notificationService = NotificationService();
  await notificationService.initialize();
  
  runApp(const MyApp());
}
```

---

### 13.3 Notification Service

**File:** `lib/services/push_notification_service.dart`

```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:logger/logger.dart';

class PushNotificationService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  final Logger _logger = Logger();

  Future<void> initialize() async {
    // Request permission
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      _logger.i('User granted permission');
    }

    // Get FCM token
    String? token = await _firebaseMessaging.getToken();
    _logger.i('FCM Token: $token');
    // Send this token to your backend

    // Initialize local notifications
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
      requestSoundPermission: true,
      requestBadgePermission: true,
      requestAlertPermission: true,
    );

    const InitializationSettings initializationSettings =
        InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );

    await _localNotifications.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTap,
    );

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Handle notification opened app
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationOpenedApp);
  }

  // Handle foreground notifications
  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    _logger.i('Foreground message: ${message.notification?.title}');

    // Show local notification
    await _showLocalNotification(message);
  }

  // Show local notification
  Future<void> _showLocalNotification(RemoteMessage message) async {
    const AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
      'buildingz_channel',
      'BuildingZ Notifications',
      channelDescription: 'Notifications for BuildingZ app',
      importance: Importance.max,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );

    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails();

    const NotificationDetails platformDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      message.hashCode,
      message.notification?.title,
      message.notification?.body,
      platformDetails,
      payload: message.data['url'],
    );
  }

  // Handle notification tap
  void _onNotificationTap(NotificationResponse response) {
    final payload = response.payload;
    if (payload != null) {
      _logger.i('Notification tapped with payload: $payload');
      // Navigate to specific screen based on payload
    }
  }

  // Handle notification opened app from background
  void _handleNotificationOpenedApp(RemoteMessage message) {
    _logger.i('Notification opened app: ${message.data}');
    // Navigate to specific screen
  }

  // Update FCM token
  Future<String?> getToken() async {
    return await _firebaseMessaging.getToken();
  }

  // Subscribe to topic
  Future<void> subscribeToTopic(String topic) async {
    await _firebaseMessaging.subscribeToTopic(topic);
    _logger.i('Subscribed to topic: $topic');
  }

  // Unsubscribe from topic
  Future<void> unsubscribeFromTopic(String topic) async {
    await _firebaseMessaging.unsubscribeFromTopic(topic);
    _logger.i('Unsubscribed from topic: $topic');
  }
}

// Background message handler (must be top-level function)
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  final logger = Logger();
  logger.i('Background message: ${message.notification?.title}');
}
```

---

## 14. Testing Guide

### 14.1 Unit Testing

**File:** `test/services/api_service_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:buildingz_app/services/api_service.dart';

void main() {
  group('ApiService', () {
    late ApiService apiService;

    setUp(() {
      apiService = ApiService();
    });

    test('getImageUrl returns full URL for relative path', () {
      const path = 'service-builder/services/image.png';
      final result = ApiService.getImageUrl(path);
      
      expect(result, contains('http'));
      expect(result, contains(path));
    });

    test('getImageUrl returns same URL for absolute path', () {
      const url = 'https://example.com/image.png';
      final result = ApiService.getImageUrl(url);
      
      expect(result, equals(url));
    });

    test('getImageUrl returns placeholder for null path', () {
      final result = ApiService.getImageUrl(null);
      
      expect(result, contains('placeholder'));
    });
  });
}
```

---

### 14.2 Widget Testing

**File:** `test/widgets/service_card_test.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:buildingz_app/widgets/service/service_card.dart';
import 'package:buildingz_app/models/service.dart';

void main() {
  testWidgets('ServiceCard displays service name', (WidgetTester tester) async {
    final service = Service(
      id: 1,
      name: 'Test Service',
      slug: 'test-service',
      basePrice: 100,
      sortOrder: 0,
      isActive: true,
      enableProducts: false,
      enableDynamicInputs: false,
      enableCustomCalculations: false,
      requiresPricing: false,
      category: /* mock category */,
      images: [],
      whatsappNumbers: [],
      fields: [],
      products: [],
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ServiceCard(service: service),
        ),
      ),
    );

    expect(find.text('Test Service'), findsOneWidget);
  });
}
```

---

### 14.3 Integration Testing

**File:** `integration_test/app_test.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:buildingz_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('App Integration Tests', () {
    testWidgets('Full login flow', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Find and tap login button
      final loginButton = find.text('Login');
      expect(loginButton, findsOneWidget);
      await tester.tap(loginButton);
      await tester.pumpAndSettle();

      // Enter credentials
      await tester.enterText(
        find.byType(TextFormField).first,
        'test@example.com',
      );
      await tester.enterText(
        find.byType(TextFormField).last,
        'password123',
      );

      // Submit
      await tester.tap(find.widgetWithText(ElevatedButton, 'Login'));
      await tester.pumpAndSettle();

      // Verify navigation to home
      expect(find.text('BuildingZ'), findsOneWidget);
    });
  });
}
```

---

## 15. Deployment Guide

### 15.1 Android Build

**1. Update `android/app/build.gradle`:**
```gradle
android {
    defaultConfig {
        applicationId "com.buildingz.app"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
        }
    }
}
```

**2. Build APK:**
```bash
flutter build apk --release
```

**3. Build App Bundle:**
```bash
flutter build appbundle --release
```

---

### 15.2 iOS Build

**1. Update `ios/Runner/Info.plist`:**
```xml
<key>CFBundleDisplayName</key>
<string>BuildingZ</string>
<key>CFBundleVersion</key>
<string>1.0.0</string>
```

**2. Build:**
```bash
flutter build ios --release
```

**3. Archive in Xcode:**
- Open `ios/Runner.xcworkspace`
- Product → Archive
- Upload to App Store Connect

---

## 16. API Response Examples (Complete Reference)

### 16.1 Service Detail Response (Full Example)

```json
{
  "success": true,
  "service": {
    "id": 31,
    "name": "test",
    "slug": "test",
    "description": "dasdasd",
    "base_price": 40,
    "sort_order": 0,
    "is_active": true,
    "enable_products": true,
    "enable_dynamic_inputs": false,
    "enable_custom_calculations": false,
    "requires_pricing": false,
    "pricing_formula": null,
    "category": {
      "id": 19,
      "name": "الألمونيوم والأخشاب",
      "slug": "alalmonyom-oalakhshab",
      "description": null
    },
    "main_image": {
      "id": 4,
      "url": "http://127.0.0.1:8000/storage/service-builder/services/image.png",
      "path": "service-builder/services/image.png",
      "is_main": true,
      "sort_order": 3
    },
    "images": [
      {
        "id": 1,
        "url": "http://127.0.0.1:8000/storage/service-builder/services/image1.png",
        "path": "service-builder/services/image1.png",
        "is_main": false,
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
        "id": 229,
        "key": "test",
        "label": "test",
        "variable_name": "test",
        "type": "select",
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
            "id": 199,
            "value": "test",
            "label": "test",
            "price_modifier": 0,
            "is_default": false,
            "image_url": "http://127.0.0.1:8000/storage/service-builder/options/image.png",
            "image_path": "service-builder/options/image.png",
            "sort_order": 0,
            "is_active": true
          }
        ]
      },
      {
        "id": 231,
        "key": "choose_the_size_please",
        "label": "Choose the size please",
        "variable_name": "choose_the_size_please",
        "type": "checkbox",
        "required": false,
        "show_image": false,
        "min_value": null,
        "max_value": null,
        "step": "1.00",
        "unit": null,
        "sort_order": 2,
        "is_active": true,
        "options": [
          {
            "id": 201,
            "value": "Big",
            "label": "Big",
            "price_modifier": 0,
            "is_default": false,
            "image_url": "http://127.0.0.1:8000/storage/service-builder/options/big.png",
            "image_path": "service-builder/options/big.png",
            "sort_order": 0,
            "is_active": true
          }
        ]
      },
      {
        "id": 232,
        "key": "upload_your_design_and_everyrything",
        "label": "Upload your design and everyrything",
        "variable_name": "upload_your_design_and_everyrything",
        "type": "file",
        "required": false,
        "show_image": false,
        "min_value": null,
        "max_value": null,
        "step": "1.00",
        "unit": null,
        "sort_order": 3,
        "is_active": true,
        "options": []
      }
    ],
    "products": []
  }
}
```

---

## 17. Common Issues & Solutions

### 17.1 File Upload Issues

**Problem:** Files not uploading
```dart
// SOLUTION: Ensure proper FormData structure
FormData formData = FormData();

// Correct key format
formData.files.add(
  MapEntry(
    'field_files[field_${fieldId}]',  // MUST include "field_" prefix
    await MultipartFile.fromFile(file.path),
  ),
);
```

---

### 17.2 Image Loading Issues

**Problem:** Images not displaying
```dart
// SOLUTION: Use proper URL construction
String getImageUrl(String? path) {
  if (path == null) return placeholderImage;
  if (path.startsWith('http')) return path;
  return '${AppConfig.backendUrl}/storage/$path';
}

// Use CachedNetworkImage with error handling
CachedNetworkImage(
  imageUrl: imageUrl,
  errorWidget: (context, url, error) => PlaceholderWidget(),
)
```

---

### 17.3 Emirates Validation

**Problem:** "Invalid emirate" error
```dart
// SOLUTION: Send English values, display Arabic

// Send to backend
final orderRequest = OrderRequest(
  emirate: 'Dubai',  // ← English value
  // ...
);

// Display to user
DropdownMenuItem(
  value: 'Dubai',  // English value
  child: Text('دبي'),  // Arabic display
)
```

---

### 17.4 Email Optional Handling

**Problem:** Email required by backend
```dart
// SOLUTION: Send fake email if empty
final email = emailController.text.isEmpty 
    ? 'optional+email+notselected@buildingz.ae'
    : emailController.text;

final orderRequest = OrderRequest(
  customerEmail: email,
  // ...
);
```

---

## 18. Performance Optimizations

### 18.1 Image Optimization
```dart
// Lazy loading for lists
CachedNetworkImage(
  imageUrl: url,
  memCacheWidth: 300,  // Resize in memory
  maxHeightDiskCache: 400,  // Cache size limit
)

// Preload critical images
precacheImage(NetworkImage(url), context);
```

### 18.2 List Performance
```dart
// Use ListView.builder for long lists
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(items[index]),
)

// Add separators for better performance
ListView.separated(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(items[index]),
  separatorBuilder: (context, index) => const Divider(),
)
```

---

## 19. Final Checklist

### Before Submission:
- [ ] All API endpoints tested
- [ ] File upload working (text, images, PDFs)
- [ ] All field types rendering correctly
- [ ] Form validation working
- [ ] Emirates dropdown functional
- [ ] Email optional logic implemented
- [ ] WhatsApp links working
- [ ] Push notifications configured
- [ ] Images loading with fallbacks
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] SEO meta tags (if web)
- [ ] App icons configured
- [ ] Splash screen designed
- [ ] Privacy policy added
- [ ] Terms & conditions added
- [ ] Testing completed (unit, widget, integration)
- [ ] Performance optimized
- [ ] Build successful (Android/iOS)
- [ ] Store listings prepared

---

## 20. Conclusion

This Flutter documentation provides a **complete, production-ready** implementation guide for the BuildingZ app, including:

✅ **All Dart data models** with JSON serialization  
✅ **Complete API integration** with request/response examples  
✅ **File upload implementation** (multipart/form-data)  
✅ **State management** with Provider  
✅ **Complete UI theme** matching design system  
✅ **Authentication screens**  
✅ **Push notifications setup**  
✅ **Testing guide** (unit, widget, integration)  
✅ **Deployment instructions** (Android & iOS)  
✅ **Common issues & solutions**  
✅ **Performance optimizations**  

**The app is ready to be built! 🚀**

---

**For Questions or Support:**
- Review API documentation in backend
- Check Flutter documentation: https://flutter.dev
- Firebase setup: https://firebase.google.com

**Good luck with your Flutter app development!** 📱✨


