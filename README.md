# Veloria — Full-Stack E-Commerce

React frontend + Node.js backend with **JWT Auth**, **Image Upload (Multer)**, **Mock Payment Gateway** (Card / UPI / COD), and a full Postman test suite.

---

## Project Structure

```
fullstack-ecommerce/
├── backend/
│   ├── config/
│   │   └── db.js                  # In-memory data store (users, products, orders)
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, Profile, Avatar upload
│   │   ├── productController.js   # CRUD + product image upload
│   │   ├── orderController.js     # Place orders, view history, admin management
│   │   └── paymentController.js   # Mock gateway: Card / UPI / COD
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + adminOnly guards
│   │   ├── upload.js              # Multer config for avatars + product images
│   │   └── validate.js            # express-validator rules for all endpoints
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── payments.js
│   ├── utils/
│   │   ├── jwt.js                 # signToken / verifyToken helpers
│   │   └── response.js            # Standardised success/error response helpers
│   ├── uploads/                   # Auto-created — stores uploaded images
│   │   ├── avatars/
│   │   └── products/
│   ├── .env
│   ├── package.json
│   └── server.js                  # Express app entry point
│
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── context/
│       │   ├── AuthContext.jsx    # Global user state (login/logout/register)
│       │   └── CartContext.jsx    # useReducer cart, persisted to localStorage
│       ├── hooks/
│       │   └── useFetch.js        # Generic Axios fetching hook
│       ├── services/
│       │   └── api.js             # Axios instance + all API call functions
│       ├── components/
│       │   ├── Navbar.jsx/.css    # Auth-aware nav with user dropdown + cart badge
│       │   ├── ProductCard.jsx    # Product grid card
│       │   └── Shared.jsx         # ProtectedRoute, Toast, Footer
│       ├── pages/
│       │   ├── Login.jsx          # Sign in form
│       │   ├── Register.jsx       # Account creation
│       │   ├── Profile.jsx        # Edit name, address, password, avatar upload
│       │   ├── ProductList.jsx    # Shop page with search, filters, sort
│       │   ├── ProductDetail.jsx  # Single product page + add to cart
│       │   ├── Cart.jsx           # Cart with qty controls + order summary
│       │   ├── Checkout.jsx       # 2-step: Shipping → Payment (Card/UPI/COD)
│       │   └── Orders.jsx         # Order history with expandable details
│       ├── App.jsx                # All routes + provider tree
│       └── index.css              # Design tokens + global styles
│
└── Veloria-API.postman_collection.json
```

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:5000
```

Seed accounts (pre-loaded):
| Role  | Email                  | Password    |
|-------|------------------------|-------------|
| User  | aryan@example.com      | password123 |
| Admin | admin@example.com      | admin123    |

### 2. Frontend

```bash
cd frontend
npm install
npm start          # starts on http://localhost:3000
```

---

## API Reference

### Base URL: `http://localhost:5000/api`

### 🔑 Auth
| Method | Endpoint              | Auth     | Description             |
|--------|-----------------------|----------|-------------------------|
| POST   | /auth/register        | Public   | Create new account      |
| POST   | /auth/login           | Public   | Login, returns JWT      |
| GET    | /auth/me              | Bearer   | Get logged-in user      |
| PUT    | /auth/profile         | Bearer   | Update name/address/password |
| POST   | /auth/avatar          | Bearer   | Upload avatar (multipart) |

### 📦 Products
| Method | Endpoint              | Auth     | Description             |
|--------|-----------------------|----------|-------------------------|
| GET    | /products             | Public   | List all (filter/sort/search via query) |
| GET    | /products/:id         | Public   | Single product          |
| GET    | /products/categories  | Public   | List all categories     |
| POST   | /products             | Admin    | Create product + image upload |
| PUT    | /products/:id         | Admin    | Update product          |
| DELETE | /products/:id         | Admin    | Delete product          |

Query params: `?category=Watches`, `?search=leather`, `?sort=price_asc|price_desc|rating|newest`

### 📋 Orders
| Method | Endpoint                  | Auth     | Description           |
|--------|---------------------------|----------|-----------------------|
| POST   | /orders                   | Bearer   | Place a new order     |
| GET    | /orders                   | Bearer   | Get my orders         |
| GET    | /orders/:id               | Bearer   | Single order          |
| GET    | /orders/all               | Admin    | All orders (admin)    |
| PUT    | /orders/:id/status        | Admin    | Update order status   |

### 💳 Payments
| Method | Endpoint              | Auth     | Description             |
|--------|-----------------------|----------|-------------------------|
| GET    | /payments/methods     | Public   | List available methods  |
| POST   | /payments/process     | Bearer   | Process payment         |

**Payment body examples:**

Card:
```json
{ "orderId": "uuid", "method": "card", "amount": 199.99,
  "cardDetails": { "number": "4111111111111111", "expiry": "12/27", "cvv": "123", "nameOnCard": "Jane" } }
```

UPI:
```json
{ "orderId": "uuid", "method": "upi", "amount": 199.99, "upiId": "alice@gpay" }
```

COD:
```json
{ "orderId": "uuid", "method": "cod", "amount": 199.99 }
```

### Mock test numbers
| Number                  | Result            |
|-------------------------|-------------------|
| Any valid card          | ✅ Success        |
| 4000000000000002        | ❌ Card declined  |
| 4000000000009995        | ❌ Insufficient funds |
| Any expiry in the past  | ❌ Card expired   |
| fail@upi                | ❌ UPI failed     |
| Any other UPI           | ✅ Success        |
| COD always              | ⏳ Pending (paid on delivery) |

---

## Postman Testing

1. Open Postman → Import → select `Veloria-API.postman_collection.json`
2. Run **"Login (User)"** or **"Login (Admin)"** — token is auto-saved to collection variable `{{token}}`
3. Run **"Create Order (Card)"** — order ID is auto-saved to `{{orderId}}`
4. Run **"Process — Card (Success)"** to complete payment

---

## JWT Flow

```
Client → POST /auth/login  →  Server returns JWT
Client stores JWT in localStorage
Client → GET /auth/me with Authorization: Bearer <jwt>  →  Server validates → returns user
```

Token expires in **7 days** (configurable in `.env` → `JWT_EXPIRES_IN`).

---

## Image Upload (Multer)

- **Avatar:** `POST /api/auth/avatar` — field name `avatar`, max 5MB
- **Product image:** `POST /api/products` — field name `image`, max 5MB
- Allowed types: jpeg, jpg, png, webp, gif
- Files saved to `backend/uploads/avatars/` and `backend/uploads/products/`
- Served statically at `http://localhost:5000/uploads/...`

---

## Replacing the In-Memory DB

`backend/config/db.js` exposes a simple CRUD interface. Replace the arrays with MongoDB/Mongoose or PostgreSQL/Prisma — the controllers don't need to change.

```js
// Example MongoDB swap in db.js
const getUserByEmail = async (email) => User.findOne({ email });
```

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, React Router v6, Axios, Context API |
| Backend   | Node.js, Express 4                      |
| Auth      | bcryptjs (hashing) + jsonwebtoken (JWT) |
| Upload    | Multer (disk storage)                   |
| Validation| express-validator                       |
| Payments  | Custom mock gateway (Card / UPI / COD)  |
| Testing   | Postman collection (30 requests)        |
