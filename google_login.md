# Frontend Integration Guide

Guide for integrating web and mobile frontends with the BuildingZ API.

## Base URL

```
https://admin.buildingzuae.com/api
```

Use this as the base for all API requests.

---

## Authentication

### Token Storage

After login or Google sign-in, store the token securely:

- **Web:** `localStorage`, `sessionStorage`, or httpOnly cookie
- **iOS:** Keychain
- **Android:** EncryptedSharedPreferences
- **Flutter/React Native:** Secure storage (flutter_secure_storage, react-native-keychain)

### Authenticated Requests

Include the token in the `Authorization` header:

```http
Authorization: Bearer 1|abc123...
```

---

## Login & Registration

### Email Login

```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "onesignal_player_id": "optional-push-token"
}
```

### Email Registration

```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "password_confirmation": "secret123",
  "phone": "+971501234567",
  "address": "Dubai, UAE",
  "role": "customer"
}
```

### Response (Login/Register)

```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "...", "email": "...", "roles": [...] },
    "token": "1|abc123...",
    "token_type": "Bearer"
  }
}
```

---

## Google Sign-In

### Web (Redirect Flow)

```javascript
// 1. Get Google URL and redirect
const res = await fetch('https://admin.buildingzuae.com/api/auth/google');
const { url } = await res.json();
window.location.href = url;

// 2. User signs in on Google → Google redirects to backend callback
// 3. Backend returns JSON with user + token
// Configure your frontend to handle the callback (e.g. /auth/callback?token=xxx)
```

### Web (Fetch token from callback)

If your backend redirects to your frontend with the token in the URL:

```javascript
// On /auth/callback page
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
if (token) {
  localStorage.setItem('auth_token', token);
  window.location.href = '/';
}
```

### React Native

```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const API_URL = 'https://admin.buildingzuae.com/api';

GoogleSignin.configure({
  webClientId: '242595606862-173l6d7ba1l88a7c4v2sthsg4pt383vr.apps.googleusercontent.com',
});

async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices();
  const { idToken } = await GoogleSignin.signIn();

  const res = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken }),
  });

  const json = await res.json();
  if (json.success) {
    const { token, user } = json.data;
    await AsyncStorage.setItem('auth_token', token);
    return user;
  }
  throw new Error(json.message || 'Google sign-in failed');
}
```

### iOS (Swift)

```swift
import GoogleSignIn

let API_URL = "https://admin.buildingzuae.com/api"
let iOS_CLIENT_ID = "242595606862-6hena6v208o2bhh8idecrs8b6ssjmrhk.apps.googleusercontent.com"

// Configure (e.g. in AppDelegate)
GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: iOS_CLIENT_ID)

// Sign in
GIDSignIn.sharedInstance.signIn(withPresenting: viewController) { result, error in
    guard let user = result?.user,
          let idToken = user.idToken?.tokenString else { return }

    var request = URLRequest(url: URL(string: "\(API_URL)/auth/google")!)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try? JSONEncoder().encode(["id_token": idToken])

    URLSession.shared.dataTask(with: request) { data, _, _ in
        guard let data = data,
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let success = json["success"] as? Bool, success,
              let dataObj = json["data"] as? [String: Any],
              let token = dataObj["token"] as? String else { return }

        UserDefaults.standard.set(token, forKey: "auth_token")
        // Navigate to home
    }.resume()
}
```

### Flutter

```dart
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

const apiUrl = 'https://admin.buildingzuae.com/api';

Future<Map<String, dynamic>?> signInWithGoogle() async {
  final googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);
  final account = await googleSignIn.signIn();
  if (account == null) return null;

  final auth = await account.authentication;
  final idToken = auth.idToken;
  if (idToken == null) return null;

  final res = await http.post(
    Uri.parse('$apiUrl/auth/google'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'id_token': idToken}),
  );

  final json = jsonDecode(res.body);
  if (json['success'] == true) {
    final token = json['data']['token'];
    // Store token (e.g. flutter_secure_storage)
    return json['data']['user'];
  }
  return null;
}
```

---

## Public API Endpoints (No Auth)

### Home Page Data

| Endpoint | Description |
|----------|-------------|
| `GET /api/banners` | Banners (optional `?slot=home_hero`) |
| `GET /api/banners/slot/home_hero` | Hero banners |
| `GET /api/products/featured?limit=6` | 6 featured products for home |
| `GET /api/products/featured?limit=all` | All featured (see more page) |
| `GET /api/categories` | Product categories |
| `GET /api/categories/tree` | Categories as tree |

### Products

| Endpoint | Description |
|----------|-------------|
| `GET /api/products` | List products (supports `?category=`, `?search=`, `?featured=1`) |
| `GET /api/products/{id}` | Product details |

### Product Response Fields

- `has_discount` – boolean
- `actual_price` – price before discount
- `discount_price` – price after discount (null if no discount)
- `formatted_price`, `formatted_actual_price`, `formatted_discount_price`
- `is_featured` – for home display
- `images` – array of image URLs

### Banners

```javascript
// Fetch home hero banners
const res = await fetch('https://admin.buildingzuae.com/api/banners/slot/home_hero');
const { data } = await res.json();
// data[].image_url, data[].mobile_image_url, data[].link
```

### Featured Products

```javascript
// Home page – 6 products
const res = await fetch('https://admin.buildingzuae.com/api/products/featured?limit=6');
const { data } = await res.json();
// data.products, data.count

// See more – all featured
const resAll = await fetch('https://admin.buildingzuae.com/api/products/featured?limit=all');
```

---

## Authenticated Endpoints

Require `Authorization: Bearer <token>`.

| Endpoint | Description |
|----------|-------------|
| `GET /api/user` | Current user |
| `POST /api/logout` | Logout (revoke token) |
| `POST /api/logout-all` | Logout from all devices |
| `GET /api/orders/order` | User orders |
| `GET /api/addresses` | User addresses |

---

## Error Handling

### Common Error Response

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable message",
  "code": "ERROR_CODE"
}
```

### Auth Error Codes

| Code | Meaning |
|------|---------|
| `INVALID_CREDENTIALS` | Wrong email/password |
| `INVALID_GOOGLE_TOKEN` | Google id_token invalid |
| `USE_GOOGLE_SIGNIN` | Account was created with Google |
| `EMAIL_USE_GOOGLE` | Email already registered with Google |

### HTTP Status

- `401` – Unauthorized (invalid token, wrong credentials)
- `403` – Forbidden |
- `422` – Validation error |
| `500` – Server error |

---

## Quick Reference

```javascript
const API = 'https://admin.buildingzuae.com/api';

// Public
fetch(`${API}/products/featured?limit=6`);
fetch(`${API}/banners/slot/home_hero`);
fetch(`${API}/categories`);
fetch(`${API}/products/1`);

// Auth
fetch(`${API}/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

// Authenticated
fetch(`${API}/user`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
```

---

## Related Docs

- [Google Login API](./GOOGLE_LOGIN_API.md)
- [Featured Products API](./FEATURED_PRODUCTS_API.md)
- [Banner API](./BANNER_API.md)
- [Product Discount](./PRODUCT_DISCOUNT.md)
- [AUTHENTICATION_DOCUMENTATION.md](../AUTHENTICATION_DOCUMENTATION.md) – full auth reference
