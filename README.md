# Blog API v1.0.0

A production-ready Node.js/Express REST API with real-time admin monitoring, user authentication, and comprehensive logging.

## 🚀 Features

- **Express.js REST API** - Fast and scalable backend
- **MongoDB Integration** - NoSQL database with Mongoose ODM
- **JWT Authentication** - Secure token-based auth (access + refresh tokens)
- **Admin Dashboard** - Real-time system log monitoring with Socket.IO
- **Role-Based Access Control** - Admin and user roles with middleware-level protection
- **Live Log Monitoring** - Stream logs from Winston logger to admin dashboard via Socket.IO
- **Rate Limiting** - Protect APIs from abuse
- **Correlation IDs** - Track requests across the system
- **Comprehensive Testing** - Jest + Supertest test suite
- **Environment Configuration** - Multi-environment setup (.env, .env.local)

## 📋 Prerequisites

- **Node.js** (v16+)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)

## 🔧 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/codesource2001/blog-api-v1.git
   cd blog-api-v1
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=4001
   HOST=localhost
   MONGODB_URI=mongodb://localhost:27017/blog-api
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=1h
   JWT_REFRESH_EXPIRE=7d
   ```

## 🎯 Quick Start

### 1. Create Admin User
```bash
npm run seed:admin
```
This creates a default admin user:
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** `admin`

### 2. Start the Server
```bash
npm start
```
Server runs on: `http://localhost:4001`

### 3. Access Admin Dashboard
```
http://localhost:4001/admin/login
```
Login with the admin credentials above.

### 4. View Live Logs
Once logged in, the admin dashboard shows real-time logs as they're generated.

## 📦 Project Structure

```
blog-api-v1/
├── index.js                          # Entry point
├── package.json                      # Dependencies & scripts
├── README.md                         # Documentation (this file)
├── .env                             # Environment variables
├── .env.local                       # Local overrides
├── src/
│   ├── server.js                    # Express app setup
│   ├── config/
│   │   └── index.js                 # Configuration manager
│   ├── controllers/
│   │   ├── admin.controller.js      # Admin login & dashboard
│   │   ├── auth.controller.js       # Authentication endpoints
│   │   ├── user.controller.js       # User endpoints
│   │   ├── logger.controller.js     # Logger endpoints
│   │   └── test.controller.js       # Test endpoints
│   ├── database/
│   │   └── db.js                    # MongoDB connection
│   ├── middlewares/
│   │   ├── auth.middleware.js       # JWT & role protection
│   │   ├── logger.middleware.js     # Request logging
│   │   ├── correlation.middleware.js # Correlation ID generation
│   │   └── rateLimit.middleware.js  # Rate limiting
│   ├── models/
│   │   └── user.model.js            # User schema
│   ├── repositories/
│   │   ├── auth.repository.js       # Auth data operations
│   │   └── crud.repository.js       # Generic CRUD repository
│   ├── routes/
│   │   ├── admin.routes.js          # Admin routes
│   │   ├── auth.route.js            # Auth routes
│   │   ├── user.route.js            # User routes
│   │   └── logger.route.js          # Logger routes
│   ├── services/
│   │   └── auth.service.js          # Authentication logic
│   ├── utils/
│   │   ├── logger.js                # Winston logger with Socket.IO transport
│   │   ├── socket.js                # Socket.IO server setup
│   │   ├── jwt.js                   # JWT utilities
│   │   ├── cookies.js               # Cookie utilities
│   │   ├── catchAsync.js            # Error handling wrapper
│   │   └── context.js               # Request context
│   ├── validators/
│   │   └── auth.validator.js        # Input validation rules
│   └── views/
│       ├── index.html               # Home page
│       ├── admin/
│       │   ├── login.ejs            # Admin login form
│       │   └── dashboard.ejs        # Admin dashboard with live logs
│       └── login.ejs                # User login form
├── test/
│   ├── admin.routes.test.js         # Admin routes tests
│   ├── auth.service.test.js         # Auth service tests
│   └── logger.middleware.test.js    # Logger middleware tests
├── scripts/
│   └── seedAdmin.js                 # Admin user seeder
├── public/                          # Static files
├── error.log                        # Error log file
└── combined.log                     # Combined log file
```

## 🔌 API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/auth/login` | Login page (HTML) | None |
| POST | `/auth/login` | Submit login credentials | None |
| POST | `/auth/signup` | Create new user account | None |
| POST | `/auth/refresh` | Refresh access token | Refresh Token |
| GET | `/auth/logout` | Logout and clear cookies | Required |

### User Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | Get all users | Admin |
| GET | `/users/:id` | Get user by ID | Admin/Self |
| POST | `/users` | Create user | Admin |
| PUT | `/users/:id` | Update user | Admin/Self |
| DELETE | `/users/:id` | Delete user | Admin |

### Logger Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/logs/combined` | Get combined logs | Admin |
| GET | `/logs/error` | Get error logs only | Admin |

### Admin Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/login` | Admin login page | None |
| POST | `/admin/login` | Submit admin login | None |
| GET | `/admin` | Admin dashboard | Admin |

## 🛡️ Authentication & Authorization

### JWT Tokens
- **Access Token:** Valid for 1 hour, stored in httpOnly secure cookie
- **Refresh Token:** Valid for 7 days, stored in httpOnly secure cookie

### Middleware Protection
- `protect` - Verifies JWT and ensures user is authenticated
- `restrictTo(...roles)` - Restricts access to specific roles

Example:
```javascript
router.get('/users', protect, restrictTo('admin'), userController.getUsers);
```

## 📊 Admin Dashboard

### Features
- **Real-time Log Display** - Socket.IO live streaming
- **Log Filtering** - Filter by level (Info, Warn, Error, Debug)
- **Statistics** - Count of info and error logs
- **Connection Status** - Shows Socket.IO connection state
- **Clear Logs** - Clean the log display
- **Color-coded Logs** - Visual indication by log level

### Accessing the Dashboard
1. Navigate to `http://localhost:4001/admin/login`
2. Enter admin credentials
3. View real-time logs as your API processes requests

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Test Files
- `test/admin.routes.test.js` - Admin login and dashboard routes
- `test/auth.service.test.js` - Authentication service logic
- `test/logger.middleware.test.js` - Request logging functionality

### Test Coverage
- Admin routes (5 tests)
- Auth service (multiple tests)
- Logger middleware (multiple tests)
- **Total: 16+ tests** ✓ All passing

## 🚀 Running in Development

### With File Watching
```bash
npm run dev
```
Server restarts automatically when files change.

### Standard Start
```bash
npm start
```

### Seed Admin User
```bash
npm run seed:admin
```

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment (development/production) |
| `PORT` | 4001 | Server port |
| `HOST` | localhost | Server host |
| `MONGODB_URI` | mongodb://localhost:27017/blog-api | MongoDB connection URI |
| `JWT_SECRET` | (required) | Secret key for JWT signing |
| `JWT_EXPIRE` | 1h | Access token expiration |
| `JWT_REFRESH_EXPIRE` | 7d | Refresh token expiration |

## 🛠️ Technologies & Dependencies

### Core
- **Express.js** (v5.2.1) - Web framework
- **Node.js** - JavaScript runtime
- **MongoDB** - Database
- **Mongoose** (v9.1.5) - ODM

### Authentication & Security
- **jsonwebtoken** (v9.0.3) - JWT implementation
- **bcryptjs** (v3.0.3) - Password hashing
- **cookie-parser** (v1.4.7) - Cookie parsing
- **express-rate-limit** (v7.5.1) - Rate limiting
- **cors** (v2.8.6) - Cross-origin support

### Real-time & Logging
- **socket.io** (v4.7.5) - Real-time communication
- **socket.io-client** (v4.8.3) - Socket.IO client
- **winston** (v3.13.0) - Logging library

### Templating & Validation
- **ejs** (v3.1.10) - Template engine
- **express-validator** (v7.3.1) - Input validation

### Development & Testing
- **jest** (v30.2.0) - Testing framework
- **supertest** (v7.2.2) - HTTP assertion library
- **dotenv** (v17.2.3) - Environment variables

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Rate limiting on all routes
- ✅ CORS configuration
- ✅ httpOnly secure cookies
- ✅ Role-based access control
- ✅ Request correlation tracking
- ✅ Environment variable protection

## 📚 Additional Documentation

- [Admin Login Guide](./ADMIN_LOGIN.md) - Admin setup and login instructions
- [Admin Quick Reference](./ADMIN_QUICK_REF.md) - Quick command reference
- [Admin Setup](./ADMIN_SETUP.md) - Detailed admin configuration

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## 📄 License

ISC License - See LICENSE file for details

## 👨‍💻 Author

Blog API v1.0.0 - Node.js REST API with Real-time Admin Monitoring

## 📞 Support

For issues and questions:
- GitHub Issues: [GitHub Issues](https://github.com/codesource2001/blog-api-v1/issues)
- Repository: [GitHub Repo](https://github.com/codesource2001/blog-api-v1)

---

**Last Updated:** February 5, 2026  
**Status:** ✅ Production Ready