/* =====================================================================
   layout.js - navbar, footer, product card, toast and page guards
   Every page calls initPage() first.
   ===================================================================== */

function applyTheme() {
  const dark = DB.read("tx_dark", false);
  document.body.classList.toggle("dark", dark);
  document.documentElement.setAttribute("data-bs-theme", dark ? "dark" : "light");
  const btn = document.getElementById("themeBtn");
  if (btn) btn.textContent = dark ? "☀️" : "🌙";
}
function toggleTheme() { DB.write("tx_dark", !DB.read("tx_dark", false)); applyTheme(); }

function doLogout() { logout(); location.href = "login.html"; }

/* ---------- guards ---------- */
function currentPageUrl() { return location.pathname.split("/").pop() + location.search + location.hash; }
function requireLogin() {
  if (currentUser()) return true;
  location.href = "login.html?next=" + encodeURIComponent(currentPageUrl());
  return false;
}
function requireAdmin() {
  const u = currentUser();
  if (u && u.role === "admin") return true;
  location.href = "login.html?next=admin.html";
  return false;
}
function safeNext(fallback) {   // only allow redirects to our own .html pages
  const n = new URLSearchParams(location.search).get("next");
  return n && /^[A-Za-z0-9_\-]+\.html([?#].*)?$/.test(n) ? n : fallback;
}

/* ---------- navbar ---------- */
function renderNavbar(targetId) {
  const user = currentUser();
  let right = "";
  if (!user) {
    right =
      '<a href="cart.html" class="nav-link">Cart (<span class="cart-count">' + cartCount() + '</span>)</a>' +
      '<a href="login.html" class="nav-link">Sign In</a>' +
      '<a href="register.html" class="btn btn-primary ms-2">Create Account</a>';
  } else if (user.role === "admin") {
    right =
      '<a href="admin.html" class="nav-link">Admin Panel</a>' +
      '<span class="badge rounded-pill text-bg-primary mx-2">ADMIN</span>' +
      '<a href="#" class="nav-link" onclick="doLogout(); return false;">Sign Out</a>';
  } else {
    right =
      '<a href="wishlist.html" class="nav-link">Wishlist (<span class="wish-count">' + getWishlist().length + '</span>)</a>' +
      '<a href="cart.html" class="nav-link">Cart (<span class="cart-count">' + cartCount() + '</span>)</a>' +
      '<div class="dropdown">' +
        '<a class="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" data-bs-toggle="dropdown"><span class="user-avatar"></span>' + esc(user.name.split(" ")[0]) + '</a>' +
        '<ul class="dropdown-menu dropdown-menu-end">' +
          '<li><a class="dropdown-item" href="account.html">Dashboard</a></li>' +
          '<li><a class="dropdown-item" href="account.html#orders">My Orders</a></li>' +
          '<li><a class="dropdown-item" href="wishlist.html">Wishlist</a></li>' +
          '<li><hr class="dropdown-divider"></li>' +
          '<li><button class="dropdown-item" onclick="doLogout()">Sign Out</button></li>' +
        '</ul>' +
      '</div>';
  }

  const catLinks = CATEGORIES.filter(function (c) { return c.name !== "Cameras"; }).map(function (c) {
    return '<li><a class="nav-link" href="catalog.html?cat=' + c.name + '">' + c.name + '</a></li>';
  }).join("");

  document.getElementById(targetId).innerHTML =
    '<nav class="navbar navbar-expand-lg tx-navbar"><div class="container">' +
      '<a class="brand me-4" href="index.html">Tech<span>Xpress</span></a>' +
      '<button class="navbar-toggler bg-light" data-bs-toggle="collapse" data-bs-target="#mainMenu"><span class="navbar-toggler-icon"></span></button>' +
      '<div class="collapse navbar-collapse gap-3" id="mainMenu">' +
        '<ul class="navbar-nav gap-lg-2">' + catLinks + '</ul>' +
        '<form id="searchForm" class="search-box">' +
          '<input id="searchInput" type="search" class="form-control" placeholder="Search products, brands..." autocomplete="off">' +
          '<ul id="searchSuggestions" class="suggestions"></ul>' +
        '</form>' +
        '<div class="ms-lg-auto d-flex align-items-center gap-1">' + right +
          '<button id="themeBtn" class="btn btn-sm btn-outline-light ms-2" title="Dark / light theme">🌙</button>' +
        '</div>' +
      '</div>' +
    '</div></nav>';

  document.getElementById("themeBtn").addEventListener("click", toggleTheme);
  applyTheme();
  setupSearch();
}

function setupSearch() {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  const list = document.getElementById("searchSuggestions");

  input.addEventListener("input", function () {
    const text = input.value.trim().toLowerCase();
    if (text === "") { list.style.display = "none"; return; }
    const found = getProducts().filter(function (p) {
      return (p.name + " " + p.brand).toLowerCase().includes(text);
    }).slice(0, 5);
    list.innerHTML = found.map(function (p) {
      return '<li data-id="' + p.id + '"><span>' + esc(p.name) + '</span><small class="text-muted">' + esc(p.cat) + '</small></li>';
    }).join("");
    list.style.display = found.length ? "block" : "none";
  });
  list.addEventListener("mousedown", function (e) {
    const li = e.target.closest("li");
    if (li) location.href = "product-details.html?id=" + li.dataset.id;
  });
  input.addEventListener("blur", function () { setTimeout(function () { list.style.display = "none"; }, 150); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const q = input.value.trim();
    if (q) location.href = "catalog.html?q=" + encodeURIComponent(q);
  });
}

function refreshCounts() {   // update (3) and (2) in the navbar without re-drawing it
  document.querySelectorAll(".cart-count").forEach(function (el) { el.textContent = cartCount(); });
  document.querySelectorAll(".wish-count").forEach(function (el) { el.textContent = getWishlist().length; });
}

/* ---------- footer ---------- */
function renderFooter(targetId) {
  document.getElementById(targetId).innerHTML =
    '<footer class="footer-tx"><div class="container"><div class="row">' +
      '<div class="col-md-4 mb-3"><h5 class="text-white">Tech<span style="color:#4f8cff">Xpress</span></h5><small>Premium electronics, delivered.</small></div>' +
      '<div class="col-6 col-md-2"><h6>Shop</h6><a href="catalog.html?cat=Laptops">Laptops</a><a href="catalog.html?cat=Phones">Phones</a><a href="catalog.html?cat=Audio">Audio</a></div>' +
      '<div class="col-6 col-md-2"><h6>Support</h6><a href="#">Shipping</a><a href="#">Returns</a><a href="#">Contact</a></div>' +
      '<div class="col-6 col-md-2"><h6>Account</h6><a href="account.html#orders">Orders</a><a href="wishlist.html">Wishlist</a><a href="compare.html">Compare</a></div>' +
    '</div><hr><small>© 2026 TechXpress</small></div></footer>';
}

/* ---------- toast ---------- */
function showToast(message, type) {   // type: success | danger | warning | info
  type = type || "success";
  let box = document.getElementById("toastBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "toastBox";
    box.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:2000";
    document.body.appendChild(box);
  }
  const t = document.createElement("div");
  t.className = "alert alert-" + type + " shadow-sm mb-2 py-2";
  t.textContent = message;
  box.appendChild(t);
  setTimeout(function () { t.remove(); }, 2500);
}

/* ---------- product card ---------- */
function stockBadge(p) {
  const s = stockStatus(p);
  if (s === "out") return '<span class="badge text-bg-danger">Out of stock</span>';
  if (s === "low") return '<span class="badge text-bg-warning">Only ' + p.stock + ' left</span>';
  return '<span class="badge text-bg-success">In stock</span>';
}

function productCard(p) {
  const badge = p.badge ? '<span class="badge text-bg-dark position-absolute top-0 start-0 m-2">' + esc(p.badge) + '</span>' : "";
  const oldPrice = p.old ? ' <small class="text-muted text-decoration-line-through">' + money(p.old) + '</small>' : "";
  const wished = inWishlist(p.id);
  const compared = getCompare().includes(p.id);
  const buy = p.stock <= 0
    ? '<button class="btn btn-outline-secondary btn-sm flex-fill notify-btn">Notify me</button>'
    : '<button class="btn btn-primary btn-sm flex-fill add-btn" data-id="' + p.id + '">Add to Cart</button>';

  return (
    '<div class="tx-card product-card h-100">' +
      '<a href="product-details.html?id=' + p.id + '" class="text-decoration-none text-reset"><div class="product-img">' + badge + p.icon + '</div></a>' +
      '<button class="wish-btn" data-id="' + p.id + '" style="position:absolute;top:24px;right:24px">' + (wished ? "♥" : "♡") + '</button>' +
      '<small class="text-muted">' + esc(p.brand) + '</small>' +
      '<div class="fw-semibold">' + esc(p.name) + '</div>' +
      '<div class="d-flex justify-content-between align-items-center my-2"><span><strong>' + money(p.price) + '</strong>' + oldPrice + '</span>' + stockBadge(p) + '</div>' +
      '<div class="d-flex gap-2">' + buy +
        '<a class="btn btn-outline-primary btn-sm" href="product-details.html?id=' + p.id + '">Details</a>' +
        '<button class="btn btn-outline-secondary btn-sm compare-btn ' + (compared ? "active" : "") + '" data-id="' + p.id + '" title="Compare">⇄</button>' +
      '</div>' +
    '</div>'
  );
}

function renderProducts(list, targetId, colClass) {
  colClass = colClass || "col-6 col-md-3";
  document.getElementById(targetId).innerHTML = list.map(function (p) {
    return '<div class="' + colClass + '" style="position:relative">' + productCard(p) + '</div>';
  }).join("");
}

/* buttons that exist inside any product card */
document.addEventListener("click", function (e) {
  const add = e.target.closest(".add-btn");
  if (add) {
    if (addToCart(Number(add.dataset.id), 1)) { showToast("✓ Added to cart"); refreshCounts(); }
    else showToast("Sorry, this product is out of stock", "danger");
    return;
  }
  if (e.target.closest(".notify-btn")) { showToast("We will notify you when it is back", "info"); return; }

  const wish = e.target.closest(".wish-btn");
  if (wish) {
    if (!currentUser()) { showToast("Please sign in to use your wishlist", "info"); setTimeout(requireLogin, 900); return; }
    const on = toggleWishlist(wish.dataset.id);
    wish.textContent = on ? "♥" : "♡";
    refreshCounts();
    showToast(on ? "Added to wishlist" : "Removed from wishlist", "info");
    if (typeof onWishlistChange === "function") onWishlistChange();
    return;
  }

  const cmp = e.target.closest(".compare-btn");
  if (cmp) {
    const r = toggleCompare(cmp.dataset.id);
    if (r.full) { showToast("You can compare up to 3 products", "warning"); return; }
    cmp.classList.toggle("active", r.on);
    showToast(r.on ? "Added to compare" : "Removed from compare", "info");
  }
});

/* ---------- order helpers (used by account + admin + checkout) ---------- */
function statusBadge(status) {
  const colors = { Processing: "primary", Shipped: "warning", Delivered: "success", Cancelled: "danger" };
  return '<span class="badge text-bg-' + (colors[status] || "secondary") + '">' + esc(status) + '</span>';
}
function timelineHtml(status) {
  if (status === "Cancelled") return '<div class="alert alert-danger py-2">This order was cancelled</div>';
  const steps = ["Processing", "Shipped", "Delivered"];
  const idx = steps.indexOf(status);
  return '<div class="d-flex text-center my-3">' + steps.map(function (s, i) {
    return '<div class="flex-fill"><span class="badge rounded-pill text-bg-' + (i <= idx ? "primary" : "secondary") + '">' + (i + 1) + '</span><br><small>' + s + '</small></div>';
  }).join("") + '</div>';
}
function orderDetailsHtml(o) {
  const rows = o.items.map(function (i) {
    return '<tr><td>' + i.icon + ' ' + esc(i.name) + '</td><td>x' + i.qty + '</td><td class="text-end">' + money(i.price * i.qty) + '</td></tr>';
  }).join("");
  const a = o.address || {};
  return (
    '<div class="d-flex justify-content-between"><strong>#' + esc(o.id) + '</strong>' + statusBadge(o.status) + '</div>' +
    '<small class="text-muted">' + fmtDate(o.date) + ' · ' + (o.payment === "cash" ? "Cash on delivery" : "Card") + ' · ' + (o.delivery === "express" ? "Express" : "Standard") + ' delivery</small>' +
    timelineHtml(o.status) +
    '<table class="table table-sm"><tbody>' + rows + '</tbody></table>' +
    '<div class="d-flex justify-content-between"><span>Subtotal</span><span>' + money(o.subtotal) + '</span></div>' +
    (o.discount ? '<div class="d-flex justify-content-between text-success"><span>Discount</span><span>-' + money(o.discount) + '</span></div>' : '') +
    '<div class="d-flex justify-content-between"><span>Shipping</span><span>' + money(o.shipping) + '</span></div>' +
    '<div class="d-flex justify-content-between"><span>Tax</span><span>' + money(o.tax) + '</span></div>' +
    '<div class="d-flex justify-content-between fw-bold fs-5 mt-1"><span>Total</span><span>' + money(o.total) + '</span></div>' +
    '<hr><small class="text-muted">Ship to: ' + esc(a.name) + ', ' + esc(a.street) + ', ' + esc(a.city) + ' · ' + esc(a.phone) + '</small>'
  );
}

function setInvalid(input, bad) { input.classList.toggle("is-invalid", bad); return bad; }
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

/* ---------- start of every page ---------- */
function initPage() {
  initDB();
  applyTheme();
  if (document.getElementById("navbar")) renderNavbar("navbar");
  if (document.getElementById("footer")) renderFooter("footer");
}
