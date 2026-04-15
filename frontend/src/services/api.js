// ============================================================
//  src/services/api.js  —  Axios instance + all API calls
// ============================================================

import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE, timeout: 15000 });

// ── Attach JWT from localStorage automatically ────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Normalise error messages ──────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.message || err.message || "Unexpected error";
    return Promise.reject(new Error(msg));
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const registerUser  = (data)        => api.post("/auth/register", data);
export const loginUser     = (data)        => api.post("/auth/login", data);
export const fetchMe       = ()            => api.get("/auth/me");
export const updateProfile = (data)        => api.put("/auth/profile", data);
export const uploadAvatar  = (formData)    => api.post("/auth/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });

// ── Products ──────────────────────────────────────────────────
export const fetchProducts    = (params)   => api.get("/products", { params });
export const fetchProductById = (id)       => api.get(`/products/${id}`);
export const fetchCategories  = ()         => api.get("/products/categories");
export const createProduct    = (formData) => api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateProduct    = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct    = (id)       => api.delete(`/products/${id}`);

// ── Orders ────────────────────────────────────────────────────
export const createOrder      = (data)     => api.post("/orders", data);
export const fetchMyOrders    = ()         => api.get("/orders");
export const fetchOrderById   = (id)       => api.get(`/orders/${id}`);
export const fetchAllOrders   = ()         => api.get("/orders/all");

// ── Payments ──────────────────────────────────────────────────
export const fetchPaymentMethods = ()      => api.get("/payments/methods");
export const processPayment      = (data)  => api.post("/payments/process", data);

export default api;
