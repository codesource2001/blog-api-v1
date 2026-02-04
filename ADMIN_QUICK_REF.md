# Admin Login - Quick Reference

## 🚀 Setup

```bash
npm run seed:admin
```

## 📋 Default Credentials

| Field | Value |
|-------|-------|
| Email | `admin@example.com` |
| Password | `admin123` |

## 🔗 URLs

| Purpose | URL |
|---------|-----|
| Login Form | `http://localhost:4001/admin/login` |
| Dashboard | `http://localhost:4001/admin` |

## 🌐 Web Login Steps

1. Go to: `http://localhost:4001/admin/login`
2. Enter email: `admin@example.com`
3. Enter password: `admin123`
4. Click "Login"
5. Redirected to dashboard: `http://localhost:4001/admin`

## 🔑 API Login (cURL)

```bash
curl -X POST http://localhost:4001/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@example.com",
    "password": "admin123"
  }' \
  -c cookies.txt
```

Then access protected routes:
```bash
curl -X GET http://localhost:4001/admin \
  -b cookies.txt
```

## 🔑 API Login (JavaScript/Fetch)

```javascript
// Login
const response = await fetch('http://localhost:4001/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin@example.com',
    password: 'admin123'
  }),
  credentials: 'include' // Include cookies
});

if (response.ok) {
  console.log('Login successful!');
  // Access dashboard
  const dashboard = await fetch('http://localhost:4001/admin', {
    credentials: 'include'
  });
}
```

## 📝 Route Summary

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/admin/login` | GET | ❌ | Login form |
| `/admin/login` | POST | ❌ | Process login |
| `/admin` | GET | ✅ | Dashboard |

## 🛠️ Admin Operations

### Change Password

```bash
node
> const User = require('./src/models').User
> const bcryptjs = require('bcryptjs')
> const salt = await bcryptjs.genSalt(10)
> const hash = await bcryptjs.hash('newPassword123', salt)
> await User.updateOne({email: 'admin@example.com'}, {password: hash})
> console.log('Password updated!')
```

### View Admin User

```bash
node
> const User = require('./src/models').User
> const admin = await User.findOne({email: 'admin@example.com'})
> console.log(admin)
```

### Create Additional Admin

```bash
npm run seed:admin  # Creates another default admin if needed
# Or programmatically:
> const User = require('./src/models').User
> const bcryptjs = require('bcryptjs')
> const salt = await bcryptjs.genSalt(10)
> const hash = await bcryptjs.hash('password', salt)
> await User.create({email: 'newadmin@example.com', password: hash, role: 'admin'})
```

## 📚 Related Files

- [Detailed Guide](./ADMIN_LOGIN.md)
- [Admin Routes](./src/routes/admin.routes.js)
- [Admin Controller](./src/controllers/admin.controller.js)
- [Auth Service](./src/services/auth.service.js)
- [User Model](./src/models/user.model.js)
- [Seed Script](./scripts/seedAdmin.js)
