TechXpress - front-end (HTML + CSS + JavaScript + Bootstrap)
============================================================
Open index.html in the browser (or use VS Code Live Server).


## Live Demo
[Live Demo](https://techxpress-2.vercel.app/)


Pages
  index.html            Home
  catalog.html          Catalog (?cat=Laptops  ?q=search  ?deals=1)
  product-details.html  Product details (?id=1)
  cart.html             Shopping cart
  checkout.html         Checkout (4 steps)
  login.html / register.html / forgot-password.html
  account.html          Dashboard, profile, orders, addresses, password
  wishlist.html / compare.html
  admin.html            Admin panel (products, orders, customers, stock)

Demo accounts
  Customer: user@techxpress.com / 123456
  Admin:    admin@techxpress.com / admin123

Shared files
  css/style.css   colors and shared styles
  js/store.js     the FAKE BACKEND (localStorage). Replace each function with fetch() calls later.
  js/layout.js    navbar, footer, product card, toast, page guards

To reset all demo data: open the browser console and run  localStorage.clear()
