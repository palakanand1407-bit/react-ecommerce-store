// ============================================================
//  backend/controllers/productController.js
//  CRUD for products (admin write, public read) + image upload
// ============================================================

const { success, error } = require("../utils/response");
const db = require("../config/db");

// ── GET /api/products ─────────────────────────────────────────
const getAllProducts = (req, res) => {
  let products = db.getProducts();

  // ?category=Watches
  if (req.query.category) {
    products = products.filter(
      (p) => p.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }

  // ?search=running
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
  }

  // ?sort=price_asc | price_desc | rating
  if (req.query.sort) {
    switch (req.query.sort) {
      case "price_asc":  products.sort((a, b) => a.price - b.price);          break;
      case "price_desc": products.sort((a, b) => b.price - a.price);          break;
      case "rating":     products.sort((a, b) => b.rating - a.rating);        break;
      case "newest":     products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    }
  }

  return success(res, { count: products.length, products });
};

// ── GET /api/products/:id ─────────────────────────────────────
const getProduct = (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return error(res, "Product not found.", 404);
  return success(res, { product });
};

// ── POST /api/products (admin) ────────────────────────────────
const createProduct = (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

    const product = db.createProduct({
      name,
      description,
      price:    parseFloat(price),
      category: category || "Uncategorised",
      stock:    parseInt(stock) || 0,
      image:    imageUrl,
    });

    return success(res, { product }, "Product created", 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ── PUT /api/products/:id (admin) ─────────────────────────────
const updateProduct = (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) return error(res, "Product not found.", 404);

    const { name, description, price, category, stock } = req.body;

    const updates = {};
    if (name)        updates.name        = name;
    if (description) updates.description = description;
    if (price)       updates.price       = parseFloat(price);
    if (category)    updates.category    = category;
    if (stock !== undefined) updates.stock = parseInt(stock);
    if (req.file)    updates.image       = `/uploads/products/${req.file.filename}`;

    const updated = db.updateProduct(req.params.id, updates);
    return success(res, { product: updated }, "Product updated");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ── DELETE /api/products/:id (admin) ─────────────────────────
const deleteProduct = (req, res) => {
  const ok = db.deleteProduct(req.params.id);
  if (!ok) return error(res, "Product not found.", 404);
  return success(res, {}, "Product deleted");
};

// ── GET /api/products/categories ─────────────────────────────
const getCategories = (req, res) => {
  const cats = [...new Set(db.getProducts().map((p) => p.category))];
  return success(res, { categories: cats });
};

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
