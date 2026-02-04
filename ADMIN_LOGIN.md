# Blog API v1.0.0 - Admin Login Guide

## Quick Start

### 1. Seed Admin User

Create the default admin user with this command:

```bash
npm run seed:admin
```

**Output:**
```
✓ Connected to MongoDB
✓ Admin user created successfully!

📋 Admin Credentials:
────────────────────────────────────────
  Email:    admin@example.com
  Password: admin123
────────────────────────────────────────

🔗 Admin Login URL:
  http://localhost:3000/admin/login
```

### 2. Login to Admin Dashboard

**Option A: Via Web UI**

1. Navigate to: `http://localhost:3000/admin/login`
2. Enter credentials:
   - Username: `admin@example.com`
   - Password: `admin123`
3. Click "Login"
4. You'll be redirected to: `http://localhost:3000/admin`

**Option B: Via API (cURL)**

```bash
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@example.com", "password": "admin123"}' \
  -c cookies.txt
```

**Option C: Via API (Node.js/Fetch)**

```javascript
const response = await fetch('http://localhost:3000/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin@example.com',
    password: 'admin123'
  }),
  credentials: 'include' // Include cookies
});

const data = await response.json();
console.log(data);
```

---

## Admin Routes

| Route | Method | Protected | Description |
|-------|--------|-----------|-------------|
| `/admin/login` | GET | ❌ | Admin login page |
| `/admin/login` | POST | ❌ | Process admin login |
| `/admin` | GET | ✅ | Admin dashboard |

### Route Details

#### GET `/admin/login`
Renders the admin login form.

**Example:**
```
GET http://localhost:3000/admin/login
```

#### POST `/admin/login`
Authenticates admin user and sets authentication cookies.

**Request Body:**
```json
{
  "username": "admin@example.com",
  "password": "admin123"
}
```

**Success Response (302 Redirect):**
- Redirects to: `/admin`
- Sets cookies: `accessToken`, `refreshToken`

**Error Response (400):**
```json
{
  "page": "admin/login",
  "title": "Admin Login",
  "error": "Invalid credentials"
}
```

#### GET `/admin`
Protected route - displays admin dashboard. Requires valid authentication token.

**Requirements:**
- Authentication token in cookies or Authorization header
- User role must be "admin"

**Success Response:**
```
Renders: src/views/admin/dashboard.ejs
```

---

## Default Admin Credentials

| Field | Value |
|-------|-------|
| **Email** | `admin@example.com` |
| **Password** | `admin123` |
| **Role** | `admin` |

> ⚠️ **Security Note**: Change these credentials in production!

---

## Admin User Model

```javascript
{
  _id: ObjectId,
  email: "admin@example.com",
  password: "$2a$10$...", // bcrypt hashed
  role: "admin",
  refreshToken: "jwt_token",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

## Authentication Flow

1. **Login Request** → POST `/admin/login` with email & password
2. **Password Verification** → bcrypt compare
3. **Token Generation** → JWT (access + refresh tokens)
4. **Cookie Setting** → Secure httpOnly cookies
5. **Redirect** → `/admin` dashboard
6. **Protected Routes** → `protect` middleware validates token

---

## Environment Variables

Ensure these are set in your `.env` file:

```env
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d
MONGO_URI=mongodb://...
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
```

---

## Admin Views

### Login Page: `src/views/admin/login.ejs`
- Form with username/password fields
- Error message display for failed login
- Form submission to `/admin/login` POST route

### Dashboard: `src/views/admin/dashboard.ejs`
- Protected page showing "Welcome to the Admin Dashboard"
- Only accessible after successful login

---

## Testing Admin Routes

Run tests with:
```bash
npm test -- test/admin.routes.test.js
```

**Tests include:**
- ✅ GET `/admin` - Protected dashboard rendering
- ✅ GET `/admin/login` - Login page rendering
- ✅ POST `/admin/login` - Successful login with token setup
- ✅ POST `/admin/login` - Error handling for invalid credentials
- ✅ Route protection verification

---

## Troubleshooting

### "Invalid credentials" error
- ✓ Verify email is exactly: `admin@example.com`
- ✓ Verify password is exactly: `admin123`
- ✓ Run seed script again: `npm run seed:admin`

### Admin dashboard not loading
- ✓ Check authentication token in cookies
- ✓ Verify token is not expired
- ✓ Check user role is "admin"

### Seed script fails
- ✓ Verify MongoDB connection in `.env` (MONGO_URI)
- ✓ Check MongoDB is running
- ✓ Verify network connectivity

---

## API Examples

### Login and Get Dashboard
```bash
# 1. Login
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@example.com", "password": "admin123"}' \
  -c cookies.txt

# 2. Access protected dashboard
curl -X GET http://localhost:3000/admin \
  -b cookies.txt
```

### Change Admin Password

```javascript
const bcryptjs = require("bcryptjs");
const { User } = require("./src/models");

const newPassword = "newSecurePassword123";
const salt = await bcryptjs.genSalt(10);
const hashedPassword = await bcryptjs.hash(newPassword, salt);

await User.updateOne(
  { email: "admin@example.com" },
  { password: hashedPassword }
);

console.log("Password updated!");
```

---

## File Structure

```
blog-api-v1/
├── src/
│   ├── controllers/
│   │   └── admin.controller.js       # Admin login/dashboard logic
│   ├── routes/
│   │   └── admin.routes.js            # Admin routes
│   ├── views/
│   │   └── admin/
│   │       ├── login.ejs              # Login form
│   │       └── dashboard.ejs          # Dashboard page
│   ├── models/
│   │   └── user.model.js              # User schema
│   └── services/
│       └── auth.service.js            # Authentication service
├── scripts/
│   └── seedAdmin.js                   # Seed script
├── test/
│   └── admin.routes.test.js           # Route tests
└── package.json
```

---

## Related Documentation

- [Auth Service](../src/services/auth.service.js)
- [Admin Controller](../src/controllers/admin.controller.js)
- [Admin Routes](../src/routes/admin.routes.js)
- [User Model](../src/models/user.model.js)
