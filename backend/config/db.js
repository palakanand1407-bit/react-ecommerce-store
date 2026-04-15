// ============================================================
//  backend/config/db.js  —  In-memory data store
// ============================================================

const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const users = [
  {
    id: "u-seed-1", name: "Aryan Sharma", email: "aryan@example.com",
    password: bcrypt.hashSync("password123", 10), avatar: null, role: "user",
    address: { street: "42 MG Road", city: "Bengaluru", state: "Karnataka", zip: "560001", country: "IN" },
    createdAt: new Date().toISOString(),
  },
  {
    id: "u-seed-2", name: "Admin User", email: "admin@example.com",
    password: bcrypt.hashSync("admin123", 10), avatar: null, role: "admin",
    address: {}, createdAt: new Date().toISOString(),
  },
];

const products = [
  { id:"p-1",  name:"Meridian Chronograph",     category:"Watches",  price:28500, stock:12, rating:4.8, image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",  description:"Swiss-movement chronograph with sapphire crystal glass and stainless steel bracelet. Water resistant to 100m." },
  { id:"p-2",  name:"Obsidian Field Watch",      category:"Watches",  price:19900, stock:8,  rating:4.6, image:"https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&q=80",  description:"Minimalist military-inspired field watch with anti-reflective sapphire crystal and 42mm stainless case." },
  { id:"p-3",  name:"Rose Gold Slim Watch",      category:"Watches",  price:15500, stock:20, rating:4.4, image:"https://images.unsplash.com/photo-1586495777744-4e6232bf2176?w=400&q=80",  description:"Ultra-thin 6mm profile rose gold watch with genuine leather strap and Japanese quartz movement." },
  { id:"p-4",  name:"Nomad Leather Duffel",      category:"Bags",     price:18200, stock:7,  rating:4.7, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",  description:"Full-grain Italian leather weekender bag with brass fittings. Fits 15-inch laptop and weekend essentials." },
  { id:"p-5",  name:"Canvas Backpack Pro",        category:"Bags",     price:6500,  stock:30, rating:4.5, image:"https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400&q=80",  description:"Heavy-duty waxed canvas backpack with padded laptop compartment and water-resistant exterior." },
  { id:"p-6",  name:"Crossbody Sling Bag",        category:"Bags",     price:4200,  stock:25, rating:4.3, image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",  description:"Compact RFID-blocking crossbody bag in pebbled leather with adjustable strap and YKK zippers." },
  { id:"p-7",  name:"Arctic Sound Pro",            category:"Audio",    price:14900, stock:23, rating:4.9, image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",  description:"Studio-grade wireless headphones with 40-hour battery, active noise cancellation and custom-tuned drivers." },
  { id:"p-8",  name:"Bass Drop Earbuds",           category:"Audio",    price:5999,  stock:40, rating:4.6, image:"https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&q=80",  description:"True wireless earbuds with 8mm dynamic drivers, 28-hour total battery and IPX5 water resistance." },
  { id:"p-9",  name:"Studio Monitor Speaker",      category:"Audio",    price:22000, stock:10, rating:4.8, image:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",  description:"Compact nearfield studio monitor with 5-inch woofer, 1-inch tweeter and balanced XLR/TRS inputs." },
  { id:"p-10", name:"Obsidian Polarised Shades",   category:"Eyewear",  price:12500, stock:15, rating:4.5, image:"https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80",  description:"Polarized mineral glass lenses in handcrafted acetate frame. UV400 protection with spring-hinged temples." },
  { id:"p-11", name:"Classic Aviator Gold",         category:"Eyewear",  price:8900,  stock:18, rating:4.4, image:"https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80",  description:"Iconic aviator silhouette with gold-plated metal frame and photochromic green glass lenses." },
  { id:"p-12", name:"Retro Round Tortoise",         category:"Eyewear",  price:6700,  stock:22, rating:4.3, image:"https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=400&q=80",  description:"Vintage round acetate frames in warm tortoiseshell with gradient brown polarised lenses." },
  { id:"p-13", name:"Ember Smart Mug",              category:"Home",     price:4999,  stock:44, rating:4.7, image:"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80",  description:"Temperature-controlled ceramic mug. Keeps your coffee at exactly 55 degrees for up to 3 hours." },
  { id:"p-14", name:"Walnut Desk Organiser",        category:"Home",     price:3200,  stock:35, rating:4.5, image:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",  description:"Hand-turned solid walnut desktop organiser with slots for pen, phone, cards and cable management." },
  { id:"p-15", name:"Linen Throw Blanket",          category:"Home",     price:2800,  stock:50, rating:4.6, image:"https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=400&q=80",  description:"100% European stonewashed linen throw blanket. Pre-washed for instant softness. Size 130x180cm." },
  { id:"p-16", name:"Terrain Trail Runner",         category:"Footwear", price:15800, stock:18, rating:4.6, image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",  description:"All-terrain trail runner with carbon-infused foam midsole, Vibram outsole and Gore-Tex waterproof upper." },
  { id:"p-17", name:"Urban Leather Sneaker",        category:"Footwear", price:9900,  stock:24, rating:4.5, image:"https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80",  description:"Hand-stitched full-grain leather sneaker with memory foam insole and natural rubber outsole." },
  { id:"p-18", name:"Minimal Canvas Low-Top",       category:"Footwear", price:4500,  stock:32, rating:4.3, image:"https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=400&q=80",  description:"Organic cotton canvas low-top with vulcanised rubber sole and reinforced toe cap. Available all sizes." },
  { id:"p-19", name:"MagSafe Desk Charger",         category:"Tech",     price:5500,  stock:28, rating:4.7, image:"https://images.unsplash.com/photo-1625772452859-1c03d884dcd7?w=400&q=80",  description:"15W fast wireless charging pad with MagSafe alignment ring, USB-C PD 65W pass-through and LED indicator." },
  { id:"p-20", name:"Mechanical Keyboard TKL",      category:"Tech",     price:11200, stock:14, rating:4.8, image:"https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&q=80",  description:"Tenkeyless mechanical keyboard with Cherry MX Brown switches, PBT double-shot keycaps and detachable USB-C cable." },
];

const orders = [];

const db = {
  getUsers:       ()      => users,
  getUserById:    (id)    => users.find((u) => u.id === id),
  getUserByEmail: (email) => users.find((u) => u.email === email.toLowerCase()),
  createUser: (data) => {
    const user = { id: uuidv4(), createdAt: new Date().toISOString(), role:"user", avatar:null, address:{}, ...data };
    users.push(user); return user;
  },
  updateUser: (id, data) => {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data, id }; return users[idx];
  },
  getProducts:    ()    => products,
  getProductById: (id)  => products.find((p) => p.id === id),
  createProduct: (data) => {
    const p = { id: uuidv4(), rating:0, createdAt: new Date().toISOString(), ...data };
    products.push(p); return p;
  },
  updateProduct: (id, data) => {
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...data, id }; return products[idx];
  },
  deleteProduct: (id) => {
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    products.splice(idx, 1); return true;
  },
  getOrders:         ()       => orders,
  getOrdersByUser:   (userId) => orders.filter((o) => o.userId === userId),
  getOrderById:      (id)     => orders.find((o) => o.id === id),
  createOrder: (data) => {
    const order = { id: uuidv4(), createdAt: new Date().toISOString(), ...data };
    orders.push(order); return order;
  },
  updateOrderStatus: (id, status) => {
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    orders[idx].status = status; orders[idx].updatedAt = new Date().toISOString(); return orders[idx];
  },
};

module.exports = db;
