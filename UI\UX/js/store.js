/* =====================================================================
   store.js  -  the "fake backend"
   Everything (products, users, cart, orders...) is saved in localStorage.
   When you build the real backend, replace the body of each function
   below with a fetch() call to your API. The pages do not need to change.
   ===================================================================== */

const DB = {
  read(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  },
  write(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
  remove(key) { localStorage.removeItem(key); }
};

const COUPONS = { TECH10: 10 };   // coupon code -> percent discount
const TAX_RATE = 0.08;
const CATEGORIES = [
  { name: "Laptops",   icon: "💻" },
  { name: "Phones",    icon: "📱" },
  { name: "Audio",     icon: "🎧" },
  { name: "Wearables", icon: "⌚" },
  { name: "Cameras",   icon: "📷" }
];

/* ---------- small helpers ---------- */
function esc(s) {   // protects the page from HTML injection
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
function fmtDate(iso) { return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }

/* ---------- seed data (first run only) ---------- */
function lap(cpu, ram, ssd, disp, bat) { return { Processor: cpu, Memory: ram, Storage: ssd, Display: disp, Battery: bat }; }
function phn(screen, camera, sto, bat) { return { Screen: screen, Camera: camera, Storage: sto, Battery: bat }; }
function aud(type, bat, anc) { return { Type: type, Battery: bat, "Noise cancelling": anc }; }
function wea(disp, bat, water) { return { Display: disp, Battery: bat, "Water resistance": water }; }

const SEED_PRODUCTS = [
  { id: 1,  name: "Aero Laptop 14",    brand: "Voltix",   cat: "Laptops",   price: 1299, old: 1449, icon: "💻", stock: 42,  badge: "FEATURED", desc: "Ultra-light 14-inch laptop with a 2.8K display, all-day battery and a quiet cooling system.", specs: lap("8-core 3.2 GHz", "16 GB", "512 GB SSD", "14-inch 2.8K OLED", "Up to 18 h") },
  { id: 2,  name: "Pulse Phone X",     brand: "Novalink", cat: "Phones",    price: 899,  old: 999,  icon: "📱", stock: 30,  badge: "-10%",     desc: "Flagship phone with a bright OLED screen and a 50 MP camera.", specs: phn("6.5-inch OLED", "50 MP", "256 GB", "5000 mAh") },
  { id: 3,  name: "Air Book 13",       brand: "Novalink", cat: "Laptops",   price: 999,  old: 0,    icon: "💻", stock: 0,   badge: "",         desc: "Thin and light 13-inch laptop for work and study.", specs: lap("6-core 2.9 GHz", "16 GB", "512 GB SSD", "13-inch IPS", "Up to 14 h") },
  { id: 4,  name: "Studio Headphones", brand: "Sonar",    cat: "Audio",     price: 249,  old: 0,    icon: "🎧", stock: 60,  badge: "NEW",      desc: "Over-ear headphones with deep bass and active noise cancelling.", specs: aud("Over-ear", "40 h", "Yes") },
  { id: 5,  name: "Fit Watch 5",       brand: "Pulse",    cat: "Wearables", price: 329,  old: 0,    icon: "⌚", stock: 3,   badge: "",         desc: "Smart watch with GPS, heart-rate tracking and a week of battery.", specs: wea("1.4-inch AMOLED", "7 days", "5 ATM") },
  { id: 6,  name: "Creator 17",        brand: "Voltix",   cat: "Laptops",   price: 2199, old: 0,    icon: "💻", stock: 2,   badge: "",         desc: "Powerful 17-inch laptop built for editing and 3D work.", specs: lap("12-core 3.6 GHz", "32 GB", "1 TB SSD", "17-inch 4K", "Up to 10 h") },
  { id: 7,  name: "Lite Book 12",      brand: "Sonar",    cat: "Laptops",   price: 699,  old: 0,    icon: "💻", stock: 25,  badge: "NEW",      desc: "Affordable 12-inch laptop for everyday tasks.", specs: lap("4-core 2.4 GHz", "8 GB", "256 GB SSD", "12-inch IPS", "Up to 10 h") },
  { id: 8,  name: "Mirror Cam",        brand: "Lenzo",    cat: "Cameras",   price: 749,  old: 0,    icon: "📷", stock: 3,   badge: "",         desc: "Compact mirrorless camera with 4K video.", specs: { Sensor: "24 MP APS-C", Video: "4K 60fps", Lens: "Interchangeable" } },
  { id: 9,  name: "Aero Laptop 16",    brand: "Voltix",   cat: "Laptops",   price: 1599, old: 1799, icon: "💻", stock: 15,  badge: "-11%",     desc: "Big-screen 16-inch laptop with a 3.2K OLED display.", specs: lap("10-core 3.4 GHz", "32 GB", "1 TB SSD", "16-inch 3.2K OLED", "Up to 16 h") },
  { id: 10, name: "Pro Station 15",    brand: "Voltix",   cat: "Laptops",   price: 1899, old: 0,    icon: "💻", stock: 12,  badge: "",         desc: "Workstation-class 15-inch laptop.", specs: lap("12-core 3.8 GHz", "32 GB", "1 TB SSD", "15-inch 4K", "Up to 9 h") },
  { id: 11, name: "Pulse Phone Mini",  brand: "Novalink", cat: "Phones",    price: 599,  old: 0,    icon: "📱", stock: 18,  badge: "",         desc: "Small phone, big performance.", specs: phn("5.8-inch OLED", "48 MP", "128 GB", "4000 mAh") },
  { id: 12, name: "Bass Buds",         brand: "Sonar",    cat: "Audio",     price: 129,  old: 0,    icon: "🎧", stock: 80,  badge: "",         desc: "True wireless earbuds with punchy bass.", specs: aud("In-ear", "24 h", "No") },
  { id: 13, name: "Fit Band 3",        brand: "Pulse",    cat: "Wearables", price: 99,   old: 0,    icon: "⌚", stock: 120, badge: "",         desc: "Slim fitness band with two weeks of battery.", specs: wea("1.1-inch AMOLED", "14 days", "5 ATM") }
];

const SEED_USERS = [
  { name: "Admin",          email: "admin@techxpress.com", password: "admin123", role: "admin",    phone: "", addresses: [] },
  { name: "Youssef Farouk", email: "user@techxpress.com",  password: "123456",   role: "customer", phone: "01000000000", addresses: [{ id: 1, label: "Home", street: "12 Nile St", city: "Cairo, Egypt", phone: "01000000000", isDefault: true }] },
  { name: "Sara Ali",       email: "sara@example.com",     password: "123456",   role: "customer", phone: "01111111111", addresses: [] },
  { name: "Omar Hassan",    email: "omar@example.com",     password: "123456",   role: "customer", phone: "01222222222", addresses: [] }
];

function daysAgo(n) { return new Date(Date.now() - n * 86400000).toISOString(); }

function seedOrder(no, email, items, status, days, payment) {
  const lines = items.map(function (i) {
    const p = SEED_PRODUCTS.find(function (x) { return x.id === i[0]; });
    return { id: p.id, name: p.name, icon: p.icon, price: p.price, qty: i[1] };
  });
  const sub = lines.reduce(function (s, l) { return s + l.price * l.qty; }, 0);
  const t = calcTotals(lines, "", 15);
  return { id: "TX-" + no, email: email, items: lines, subtotal: sub, discount: 0, shipping: 15, tax: t.tax, total: t.total,
           status: status, date: daysAgo(days), payment: payment, delivery: "express",
           address: { name: "Customer", phone: "01000000000", street: "12 Nile St", city: "Cairo, Egypt" } };
}

function initDB() {
  if (DB.read("tx_seeded_v1", false)) return;
  DB.write("tx_products", SEED_PRODUCTS);
  DB.write("tx_users", SEED_USERS);
  DB.write("tx_orders", [
    seedOrder(1042, "user@techxpress.com", [[1, 1], [4, 2]], "Shipped", 11, "card"),
    seedOrder(1031, "user@techxpress.com", [[4, 1]], "Delivered", 29, "card"),
    seedOrder(1019, "user@techxpress.com", [[5, 1]], "Cancelled", 50, "cash"),
    seedOrder(1040, "sara@example.com", [[2, 1]], "Processing", 2, "card"),
    seedOrder(1035, "omar@example.com", [[7, 1], [12, 2]], "Delivered", 20, "cash"),
    seedOrder(1030, "omar@example.com", [[9, 1]], "Delivered", 55, "card"),
    seedOrder(1025, "sara@example.com", [[10, 1]], "Delivered", 85, "card"),
    seedOrder(1020, "sara@example.com", [[6, 1], [13, 1]], "Delivered", 120, "card")
  ]);
  DB.write("tx_seeded_v1", true);
}

/* ---------- products ---------- */
function getProducts() { return DB.read("tx_products", []); }
function getProduct(id) { return getProducts().find(function (p) { return p.id === Number(id); }) || null; }
function stockStatus(p) { return p.stock <= 0 ? "out" : (p.stock <= 5 ? "low" : "in"); }

function saveProduct(p) {          // add (no id) or update (has id)
  const list = getProducts();
  if (p.id) {
    const i = list.findIndex(function (x) { return x.id === p.id; });
    if (i >= 0) list[i] = p;
  } else {
    p.id = list.reduce(function (m, x) { return Math.max(m, x.id); }, 0) + 1;
    list.push(p);
  }
  DB.write("tx_products", list);
  return p;
}
function deleteProduct(id) {
  DB.write("tx_products", getProducts().filter(function (p) { return p.id !== Number(id); }));
}

/* ---------- users / auth ---------- */
function getUsers() { return DB.read("tx_users", []); }
function currentUser() {
  const s = DB.read("tx_session", null);
  if (!s) return null;
  return getUsers().find(function (u) { return u.email === s.email; }) || null;
}
function login(email, password) {
  const u = getUsers().find(function (x) { return x.email.toLowerCase() === email.toLowerCase() && x.password === password; });
  if (!u) return null;
  const guestCart = DB.read("tx_cart_guest", []);
  DB.write("tx_session", { email: u.email });
  guestCart.forEach(function (i) { addToCart(i.id, i.qty); });   // keep what the guest added
  DB.remove("tx_cart_guest");
  return u;
}
function register(name, email, password) {
  const users = getUsers();
  if (users.some(function (u) { return u.email.toLowerCase() === email.toLowerCase(); })) return { error: "This email is already registered" };
  users.push({ name: name, email: email, password: password, role: "customer", phone: "", addresses: [] });
  DB.write("tx_users", users);
  return { user: login(email, password) };
}
function logout() { DB.remove("tx_session"); }
function updateUser(email, changes) {
  const users = getUsers();
  const u = users.find(function (x) { return x.email === email; });
  if (!u) return null;
  Object.assign(u, changes);
  DB.write("tx_users", users);
  return u;
}

/* ---------- cart (one per user, guests have their own) ---------- */
function cartKey() { const u = currentUser(); return "tx_cart_" + (u ? u.email : "guest"); }
function getCart() { return DB.read(cartKey(), []); }
function saveCart(c) { DB.write(cartKey(), c); }

function addToCart(id, qty) {
  const p = getProduct(id);
  if (!p || p.stock <= 0) return false;
  const cart = getCart();
  const item = cart.find(function (i) { return i.id === p.id; });
  if (item) item.qty = Math.min(item.qty + qty, p.stock);
  else cart.push({ id: p.id, qty: Math.min(qty, p.stock) });
  saveCart(cart);
  return true;
}
function setCartQty(id, qty) {
  const p = getProduct(id);
  const cart = getCart();
  const item = cart.find(function (i) { return i.id === Number(id); });
  if (item && p) item.qty = Math.max(1, Math.min(qty, Math.max(p.stock, 1)));
  saveCart(cart);
}
function removeFromCart(id) { saveCart(getCart().filter(function (i) { return i.id !== Number(id); })); }
function clearCart() { saveCart([]); }
function cartCount() { return getCart().reduce(function (s, i) { return s + i.qty; }, 0); }
function cartLines() {   // cart items + full product, "out" = no stock left
  return getCart().map(function (i) {
    const p = getProduct(i.id);
    return p ? { product: p, qty: i.qty, out: p.stock <= 0 } : null;
  }).filter(Boolean);
}

/* ---------- coupon + totals ---------- */
function getCoupon() { return DB.read("tx_coupon", ""); }
function applyCoupon(code) {
  code = String(code).trim().toUpperCase();
  if (!COUPONS[code]) return false;
  DB.write("tx_coupon", code);
  return true;
}
function removeCoupon() { DB.remove("tx_coupon"); }

function shippingFor(subtotal, delivery) {
  if (subtotal <= 0) return 0;
  if (delivery === "express") return 15;
  return subtotal >= 100 ? 0 : 9;     // free standard delivery over $100
}
function calcTotals(items, couponCode, shipping) {   // items: [{price, qty}]
  const subtotal = items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  const percent = COUPONS[couponCode] || 0;
  const discount = Math.round(subtotal * percent / 100);
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const total = subtotal - discount + shipping + tax;
  return { subtotal: subtotal, discount: discount, shipping: shipping, tax: tax, total: total };
}

/* ---------- wishlist (needs a signed-in user) ---------- */
function wishKey() { const u = currentUser(); return u ? "tx_wish_" + u.email : null; }
function getWishlist() { const k = wishKey(); return k ? DB.read(k, []) : []; }
function inWishlist(id) { return getWishlist().includes(Number(id)); }
function toggleWishlist(id) {   // returns true if now in wishlist
  const k = wishKey();
  if (!k) return false;
  id = Number(id);
  let list = getWishlist();
  const on = !list.includes(id);
  list = on ? list.concat([id]) : list.filter(function (x) { return x !== id; });
  DB.write(k, list);
  return on;
}

/* ---------- compare (max 3 products) ---------- */
function getCompare() { return DB.read("tx_compare", []); }
function toggleCompare(id) {    // returns {on, full}
  id = Number(id);
  let list = getCompare();
  if (list.includes(id)) { list = list.filter(function (x) { return x !== id; }); DB.write("tx_compare", list); return { on: false, full: false }; }
  if (list.length >= 3) return { on: false, full: true };
  list.push(id);
  DB.write("tx_compare", list);
  return { on: true, full: false };
}
function clearCompare() { DB.write("tx_compare", []); }

/* ---------- orders ---------- */
function getAllOrders() { return DB.read("tx_orders", []).sort(function (a, b) { return new Date(b.date) - new Date(a.date); }); }
function getOrders(email) { return getAllOrders().filter(function (o) { return o.email === email; }); }
function getOrder(id) { return getAllOrders().find(function (o) { return o.id === id; }) || null; }

function createOrder(data) {    // data: {address, delivery, payment}  -> builds the order from the cart
  const user = currentUser();
  const lines = cartLines().filter(function (l) { return !l.out; });
  if (!user || lines.length === 0) return null;

  const items = lines.map(function (l) {
    return { id: l.product.id, name: l.product.name, icon: l.product.icon, price: l.product.price, qty: Math.min(l.qty, l.product.stock) };
  });
  const sub = items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  const code = getCoupon();
  const t = calcTotals(items, code, shippingFor(sub, data.delivery));

  const orders = DB.read("tx_orders", []);
  const nextNo = orders.reduce(function (m, o) { return Math.max(m, Number(o.id.replace("TX-", ""))); }, 1000) + 1;
  const order = { id: "TX-" + nextNo, email: user.email, items: items, subtotal: t.subtotal, discount: t.discount, coupon: code,
                  shipping: t.shipping, tax: t.tax, total: t.total, status: "Processing", date: new Date().toISOString(),
                  payment: data.payment, delivery: data.delivery, address: data.address };
  orders.push(order);
  DB.write("tx_orders", orders);
  changeStock(order, -1);
  clearCart();
  removeCoupon();
  return order;
}
function changeStock(order, direction) {   // -1 = take from stock, +1 = give back
  const list = getProducts();
  order.items.forEach(function (i) {
    const p = list.find(function (x) { return x.id === i.id; });
    if (p) p.stock = Math.max(0, p.stock + direction * i.qty);
  });
  DB.write("tx_products", list);
}
function updateOrderStatus(id, status) {
  const orders = DB.read("tx_orders", []);
  const o = orders.find(function (x) { return x.id === id; });
  if (!o || o.status === status) return;
  if (status === "Cancelled") changeStock(o, +1);
  if (o.status === "Cancelled") changeStock(o, -1);
  o.status = status;
  DB.write("tx_orders", orders);
}

initDB();
