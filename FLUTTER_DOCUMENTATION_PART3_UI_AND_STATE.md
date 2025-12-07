# BuildingZ Flutter App - Complete Development Guide
## Part 3: State Management, UI Theme & Navigation

---

## 7. State Management with Provider

### 7.1 Setup Provider

**File:** `lib/main.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'config/routes.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';
import 'services/service_builder_service.dart';
import 'services/search_service.dart';
import 'services/storage_service.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/service_provider.dart';
import 'screens/splash/splash_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Initialize services
    final apiService = ApiService();
    final storageService = StorageService();
    final authService = AuthService(apiService, storageService);
    final serviceBuilderService = ServiceBuilderService(apiService);
    final searchService = SearchService(apiService);

    return MultiProvider(
      providers: [
        // Services
        Provider<ApiService>(create: (_) => apiService),
        Provider<StorageService>(create: (_) => storageService),
        Provider<AuthService>(create: (_) => authService),
        Provider<ServiceBuilderService>(create: (_) => serviceBuilderService),
        Provider<SearchService>(create: (_) => searchService),
        
        // State Providers
        ChangeNotifierProvider<AuthProvider>(
          create: (_) => AuthProvider(authService),
        ),
        ChangeNotifierProvider<CartProvider>(
          create: (_) => CartProvider(storageService),
        ),
        ChangeNotifierProvider<ServiceProvider>(
          create: (_) => ServiceProvider(serviceBuilderService),
        ),
      ],
      child: MaterialApp(
        title: 'BuildingZ',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        initialRoute: '/',
        onGenerateRoute: AppRoutes.generateRoute,
        home: const SplashScreen(),
      ),
    );
  }
}
```

---

### 7.2 Auth Provider

**File:** `lib/providers/auth_provider.dart`

```dart
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService;
  
  User? _user;
  bool _isLoading = false;
  String? _error;

  AuthProvider(this._authService) {
    _loadUser();
  }

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  // Load user from storage
  Future<void> _loadUser() async {
    _isLoading = true;
    notifyListeners();

    try {
      _user = await _authService.getCurrentUser();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Login
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.login(
        email: email,
        password: password,
      );
      
      _user = result['user'];
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Signup
  Future<bool> signup({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.signup(
        name: name,
        email: email,
        phone: phone,
        password: password,
        passwordConfirmation: password,
      );
      
      _user = result['user'];
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Logout
  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
```

---

### 7.3 Service Provider

**File:** `lib/providers/service_provider.dart`

```dart
import 'package:flutter/material.dart';
import '../models/category.dart';
import '../models/service.dart';
import '../services/service_builder_service.dart';

class ServiceProvider with ChangeNotifier {
  final ServiceBuilderService _serviceBuilderService;

  ServiceProvider(this._serviceBuilderService);

  List<Category> _categories = [];
  Category? _currentCategory;
  Service? _currentService;
  bool _isLoading = false;
  String? _error;

  List<Category> get categories => _categories;
  Category? get currentCategory => _currentCategory;
  Service? get currentService => _currentService;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Load all categories
  Future<void> loadCategories() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _categories = await _serviceBuilderService.getAllCategories();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load category by ID
  Future<void> loadCategory(int id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentCategory = await _serviceBuilderService.getCategoryById(id);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load service by ID
  Future<void> loadService(int id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentService = await _serviceBuilderService.getServiceById(id);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Clear current service
  void clearCurrentService() {
    _currentService = null;
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
```

---

### 7.4 Cart Provider

**File:** `lib/providers/cart_provider.dart`

```dart
import 'package:flutter/material.dart';
import '../services/storage_service.dart';
import '../models/product.dart';

class CartItem {
  final Product product;
  int quantity;

  CartItem({
    required this.product,
    this.quantity = 1,
  });

  double get totalPrice => product.price * quantity;
}

class CartProvider with ChangeNotifier {
  final StorageService _storageService;
  final List<CartItem> _items = [];

  CartProvider(this._storageService) {
    _loadCart();
  }

  List<CartItem> get items => _items;
  
  int get itemCount => _items.fold(0, (sum, item) => sum + item.quantity);
  
  double get totalAmount => _items.fold(
    0,
    (sum, item) => sum + item.totalPrice,
  );

  bool get isEmpty => _items.isEmpty;

  // Load cart from storage
  Future<void> _loadCart() async {
    // Implementation depends on storage structure
    notifyListeners();
  }

  // Add to cart
  void addItem(Product product, {int quantity = 1}) {
    final existingIndex = _items.indexWhere(
      (item) => item.product.id == product.id,
    );

    if (existingIndex >= 0) {
      _items[existingIndex].quantity += quantity;
    } else {
      _items.add(CartItem(product: product, quantity: quantity));
    }

    _saveCart();
    notifyListeners();
  }

  // Remove from cart
  void removeItem(int productId) {
    _items.removeWhere((item) => item.product.id == productId);
    _saveCart();
    notifyListeners();
  }

  // Update quantity
  void updateQuantity(int productId, int quantity) {
    final index = _items.indexWhere((item) => item.product.id == productId);
    
    if (index >= 0) {
      if (quantity <= 0) {
        _items.removeAt(index);
      } else {
        _items[index].quantity = quantity;
      }
      
      _saveCart();
      notifyListeners();
    }
  }

  // Clear cart
  void clear() {
    _items.clear();
    _saveCart();
    notifyListeners();
  }

  // Save cart to storage
  Future<void> _saveCart() async {
    // Implementation depends on storage structure
  }
}
```

---

## 8. Theme Configuration

### 8.1 App Theme

**File:** `lib/config/theme.dart`

```dart
import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors
  static const Color primary = Color(0xFFF39C12); // Orange
  static const Color primaryDark = Color(0xFFE67E22);
  static const Color primaryLight = Color(0xFFF5B041);

  // Secondary Colors
  static const Color secondary = Color(0xFF34495E); // Dark Blue-Grey
  static const Color secondaryDark = Color(0xFF2C3E50);
  static const Color secondaryLight = Color(0xFF7F8C8D);

  // Accent Colors
  static const Color accentBlue = Color(0xFF3498DB);
  static const Color accentGreen = Color(0xFF27AE60);
  static const Color accentRed = Color(0xFFE74C3C);
  static const Color accentPurple = Color(0xFF9B59B6);

  // Neutral Colors
  static const Color textPrimary = Color(0xFF2C3E50);
  static const Color textSecondary = Color(0xFF7F8C8D);
  static const Color textLight = Color(0xFFECF0F1);
  static const Color backgroundLight = Color(0xFFF8F9FA);
  static const Color backgroundDark = Color(0xFF2C3E50);
  static const Color border = Color(0xFFDFE6E9);

  // WhatsApp
  static const Color whatsappGreen = Color(0xFF25D366);
  static const Color whatsappDark = Color(0xFF128C7E);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: Colors.white,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        error: AppColors.accentRed,
        background: AppColors.backgroundLight,
      ),
      
      // AppBar Theme
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.secondary,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),

      // Text Theme
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimary,
        ),
        displayMedium: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimary,
        ),
        displaySmall: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          color: AppColors.textPrimary,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          color: AppColors.textSecondary,
        ),
      ),

      // Button Theme
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          elevation: 2,
        ),
      ),

      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.grey.shade50,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.accentBlue, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.accentRed),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),

      // Card Theme
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        margin: const EdgeInsets.all(8),
      ),

      // Floating Action Button Theme
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
    );
  }
}
```

---

## 9. Navigation & Routes

### 9.1 Routes Configuration

**File:** `lib/config/routes.dart`

```dart
import 'package:flutter/material.dart';
import '../screens/splash/splash_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/signup_screen.dart';
import '../screens/services/services_screen.dart';
import '../screens/services/category_detail_screen.dart';
import '../screens/services/service_detail_screen.dart';
import '../screens/products/products_screen.dart';
import '../screens/cart/cart_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/search/search_screen.dart';

class AppRoutes {
  static const String splash = '/';
  static const String home = '/home';
  static const String login = '/login';
  static const String signup = '/signup';
  static const String services = '/services';
  static const String categoryDetail = '/category';
  static const String serviceDetail = '/service';
  static const String products = '/products';
  static const String cart = '/cart';
  static const String profile = '/profile';
  static const String search = '/search';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splash:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      
      case home:
        return MaterialPageRoute(builder: (_) => const HomeScreen());
      
      case login:
        return MaterialPageRoute(builder: (_) => const LoginScreen());
      
      case signup:
        return MaterialPageRoute(builder: (_) => const SignupScreen());
      
      case services:
        return MaterialPageRoute(builder: (_) => const ServicesScreen());
      
      case categoryDetail:
        final categoryId = settings.arguments as int;
        return MaterialPageRoute(
          builder: (_) => CategoryDetailScreen(categoryId: categoryId),
        );
      
      case serviceDetail:
        final serviceId = settings.arguments as int;
        return MaterialPageRoute(
          builder: (_) => ServiceDetailScreen(serviceId: serviceId),
        );
      
      case products:
        return MaterialPageRoute(builder: (_) => const ProductsScreen());
      
      case cart:
        return MaterialPageRoute(builder: (_) => const CartScreen());
      
      case profile:
        return MaterialPageRoute(builder: (_) => const ProfileScreen());
      
      case search:
        return MaterialPageRoute(builder: (_) => const SearchScreen());
      
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('No route defined for ${settings.name}'),
            ),
          ),
        );
    }
  }
}
```

---

## 10. Complete UI Widgets

### 10.1 Service Card Widget

**File:** `lib/widgets/service/service_card.dart`

```dart
import 'package:flutter/material.dart';
import 'package:cached_network_image.dart';
import '../../models/service.dart';
import '../../config/app_config.dart';
import '../../services/api_service.dart';

class ServiceCard extends StatelessWidget {
  final Service service;
  final VoidCallback? onTap;

  const ServiceCard({
    Key? key,
    required this.service,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final imageUrl = service.getPrimaryImageUrl(AppConfig.backendUrl);

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Service Image
            AspectRatio(
              aspectRatio: 16 / 9,
              child: imageUrl != null
                  ? CachedNetworkImage(
                      imageUrl: imageUrl,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: Colors.grey.shade200,
                        child: const Center(
                          child: CircularProgressIndicator(),
                        ),
                      ),
                      errorWidget: (context, url, error) => Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              Colors.purple.shade300,
                              Colors.blue.shade300,
                            ],
                          ),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.image_not_supported,
                            color: Colors.white,
                            size: 48,
                          ),
                        ),
                      ),
                    )
                  : Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Colors.purple.shade300,
                            Colors.blue.shade300,
                          ],
                        ),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.home_repair_service,
                          color: Colors.white,
                          size: 48,
                        ),
                      ),
                    ),
            ),

            // Service Info
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    service.name,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (service.description != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      service.description!,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  if (!service.requiresPricing && service.basePrice > 0) ...[
                    const SizedBox(height: 8),
                    Text(
                      '${service.basePrice} AED',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFF39C12),
                      ),
                    ),
                  ],
                ],
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

### 10.2 Loading Shimmer Widget

**File:** `lib/widgets/common/loading_shimmer.dart`

```dart
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class LoadingShimmer extends StatelessWidget {
  final double? width;
  final double height;
  final BorderRadius? borderRadius;

  const LoadingShimmer({
    Key? key,
    this.width,
    required this.height,
    this.borderRadius,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: borderRadius ?? BorderRadius.circular(8),
        ),
      ),
    );
  }
}

class ServiceCardShimmer extends StatelessWidget {
  const ServiceCardShimmer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const LoadingShimmer(
            height: 150,
            borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const LoadingShimmer(
                  width: double.infinity,
                  height: 16,
                ),
                const SizedBox(height: 8),
                LoadingShimmer(
                  width: MediaQuery.of(context).size.width * 0.6,
                  height: 14,
                ),
                const SizedBox(height: 8),
                const LoadingShimmer(
                  width: 80,
                  height: 20,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

---

### 10.3 Empty State Widget

**File:** `lib/widgets/common/empty_state.dart`

```dart
import 'package:flutter/material.dart';

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? message;
  final String? actionLabel;
  final VoidCallback? onAction;

  const EmptyState({
    Key? key,
    required this.icon,
    required this.title,
    this.message,
    this.actionLabel,
    this.onAction,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 80,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: Colors.grey,
              ),
              textAlign: TextAlign.center,
            ),
            if (message != null) ...[
              const SizedBox(height: 8),
              Text(
                message!,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade600,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: onAction,
                child: Text(actionLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
```

---

### 10.4 Error Widget

**File:** `lib/widgets/common/error_view.dart`

```dart
import 'package:flutter/material.dart';

class ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;

  const ErrorView({
    Key? key,
    required this.message,
    this.onRetry,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 80,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            const Text(
              'Oops! Something went wrong',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
```

---

## 11. Complete Screen Examples

### 11.1 Home Screen

**File:** `lib/screens/home/home_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/service_provider.dart';
import '../../widgets/service/service_card.dart';
import '../../widgets/common/loading_shimmer.dart';
import '../../widgets/common/error_view.dart';
import '../../config/routes.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<ServiceProvider>().loadCategories();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('BuildingZ'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              Navigator.pushNamed(context, AppRoutes.search);
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              // Navigate to notifications
            },
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () {
              Navigator.pushNamed(context, AppRoutes.profile);
            },
          ),
        ],
      ),
      body: Consumer<ServiceProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.75,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: 6,
              itemBuilder: (context, index) => const ServiceCardShimmer(),
            );
          }

          if (provider.error != null) {
            return ErrorView(
              message: provider.error!,
              onRetry: () => provider.loadCategories(),
            );
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Hero Section
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      const Color(0xFF34495E),
                      const Color(0xFF2C3E50),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Welcome to BuildingZ',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Book professional services in UAE',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white70,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pushNamed(context, AppRoutes.services);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF39C12),
                      ),
                      child: const Text('Explore Services'),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Categories Section
              const Text(
                'Service Categories',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),

              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.75,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                ),
                itemCount: provider.categories.length,
                itemBuilder: (context, index) {
                  final category = provider.categories[index];
                  
                  return GestureDetector(
                    onTap: () {
                      Navigator.pushNamed(
                        context,
                        AppRoutes.categoryDetail,
                        arguments: category.id,
                      );
                    },
                    child: Card(
                      clipBehavior: Clip.antiAlias,
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          // Background Image/Gradient
                          Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [
                                  Colors.purple.shade300,
                                  Colors.blue.shade300,
                                ],
                              ),
                            ),
                          ),
                          
                          // Overlay
                          Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.transparent,
                                  Colors.black.withOpacity(0.7),
                                ],
                              ),
                            ),
                          ),
                          
                          // Category Name
                          Positioned(
                            bottom: 12,
                            left: 12,
                            right: 12,
                            child: Text(
                              category.name,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, AppRoutes.cart);
        },
        child: const Icon(Icons.shopping_cart),
      ),
    );
  }
}
```

---

**Continue to Part 4 for:**
- Complete Authentication Screens
- Service Detail Screen
- Push Notifications Setup
- Testing Guide
- Deployment Checklist
- Common Issues & Solutions



