/* =========================================================================
   store.js  |  Front-end store engine (shared by every page)
   -------------------------------------------------------------------------
   Everything in this project is a *front-end demo*:
     - users, cart, wishlist and orders are stored in localStorage only
     - passwords are NOT hashed on purpose (this is not a real backend)
     - product prices always come from JS/data.js and are re-read from
       there on every order, so the UI can never be tricked into a bad price

   Load order on every page:
       JS/data.js  ->  JS/store.js  ->  the page script (if any)
   ========================================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------------- keys */
  const K = {
    users:   "reda_users",
    session: "reda_session",
    cart:    "reda_cart",
    wish:    "reda_wishlist",
    orders:  "reda_orders",
    addresses: "reda_addresses"
  };

  /* ------------------------------------------------------ tiny helpers  */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.warn("store.js: bad data in", key, err);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn("store.js: cannot save", key, err);
    }
    return value;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function money(amount) {
    const value = Number(amount) || 0;
    return "$" + value.toFixed(2).replace(/\.00$/, "");
  }

  function toUrl(text) {
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function query() {
    return new URLSearchParams(location.search);
  }

  function categoryName(slug) {
    const found = CATEGORIES.find(function (c) { return c.slug === slug; });
    return found ? found.name : slug;
  }

  function productById(id) {
    return PRODUCTS.find(function (p) { return String(p.id) === String(id); });
  }

  function discountPercent(product) {
    if (!product || !product.old_price || product.old_price <= product.price) return 0;
    return Math.floor(((product.old_price - product.price) / product.old_price) * 100);
  }

  function stars(rating) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      html += '<i class="fa-solid fa-star' + (i <= Math.round(rating) ? "" : " half") + '"></i>';
    }
    return html;
  }

  function productCard(product) {
    const inCart  = Store.cartHas(product.id);
    const inWish  = Store.inWishlist(product.id);
    const percent = discountPercent(product);
    const badge   = percent
      ? '<span class="sale_present">%' + percent + "</span>"
      : (product.added <= 7 ? '<span class="badge_new">new</span>' : "");

    const oldPrice = product.old_price ? '<p class="old_price">' + money(product.old_price) + "</p>" : "";

    return (
      '<div class="swiper-slide product" data-id="' + product.id + '">' +
        badge +
        '<div class="img_product"><a href="product.html?id=' + product.id + '"><img src="' + product.img + '" alt="' + escapeHTML(product.name) + '" loading="lazy"></a></div>' +
        '<div class="stars">' + stars(product.rating) + "</div>" +
        '<p class="name_product"><a href="product.html?id=' + product.id + '">' + escapeHTML(product.name) + "</a></p>" +
        '<div class="price"><p><span>' + money(product.price) + "</span></p>" + oldPrice + "</div>" +
        '<div class="icons">' +
          '<span class="btn_add_cart ' + (inCart ? "active" : "") + '" data-id="' + product.id + '">' +
            '<i class="fa-solid fa-cart-shopping"></i> ' + (inCart ? "Item in cart" : "add to cart") +
          "</span>" +
          '<span class="icon_product ' + (inWish ? "active" : "") + '" data-wish="' + product.id + '" title="Add to wishlist"><i class="fa-' + (inWish ? "solid" : "regular") + " fa-heart\"></i></span>" +
        "</div>" +
      "</div>"
    );
  }

  /* ------------------------------------------------------------- users  */
  function loadUsers()  { return read(K.users, []); }

  function findUser(email) {
    return loadUsers().find(function (u) { return u.email.toLowerCase() === String(email).toLowerCase(); }) || null;
  }

  function saveUser(user) {
    const users = loadUsers();
    users.push(user);
    write(K.users, users);
    return user;
  }

  function currentUser() {
    const session = read(K.session, null);
    if (!session) return null;
    return findUser(session.email);
  }

  function orderNumber() {
    return "ORD-" + Math.floor(100000 + Math.random() * 900000);
  }

  /* ---------------------------------------------------------- demo data */
  function seedDemoData() {
    if (!findUser(DEMO_USER.email)) {
      saveUser({
        name: DEMO_USER.name,
        email: DEMO_USER.email,
        password: DEMO_USER.password,
        phone: DEMO_USER.phone,
        address: DEMO_USER.address,
        city: DEMO_USER.city,
        country: DEMO_USER.country,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40
      });
    }
    if (read(K.orders, null) === null) {
      const demo = [
        {
          id: "ORD-482913", userId: DEMO_USER.email, date: Date.now() - 1000 * 60 * 60 * 24 * 9,
          items: [{ id: 1, name: "Redmi 13C Dual SIM with 6GB RAM", img: "img/product/1.png", price: 280, quantity: 1 }],
          subtotal: 280, shipping: 20, total: 300, payment: "Cash on Delivery", status: "delivered",
          customer: { firstName: "Demo", lastName: "User", email: DEMO_USER.email, phone: DEMO_USER.phone, address: DEMO_USER.address, city: DEMO_USER.city, country: DEMO_USER.country }
        },
        {
          id: "ORD-715204", userId: DEMO_USER.email, date: Date.now() - 1000 * 60 * 60 * 24 * 2,
          items: [
            { id: 17, name: "HIKVISION PTZ Camera 4K Outdoor", img: "img/product/17.png", price: 185, quantity: 1 },
            { id: 19, name: "VIVAX Kettle WH-175L with a capacity of 1.7L", img: "img/product/19.png", price: 140, quantity: 2 }
          ],
          subtotal: 465, shipping: 20, total: 485, payment: "Credit Card", status: "shipped",
          customer: { firstName: "Demo", lastName: "User", email: DEMO_USER.email, phone: DEMO_USER.phone, address: DEMO_USER.address, city: DEMO_USER.city, country: DEMO_USER.country }
        }
      ];
      write(K.orders, demo);
    }
  }

  /* -------------------------------------------------------------- cart  */
  function getCart()  { return read(K.cart, []); }

  function cartHas(id) { return getCart().some(function (i) { return String(i.id) === String(id); }); }

  function cartCount() {
    return getCart().reduce(function (sum, i) { return sum + i.quantity; }, 0);
  }

  function cartSubtotal() {
    return getCart().reduce(function (sum, i) { return sum + i.price * i.quantity; }, 0);
  }

  function addToCart(id, quantity) {
    const product = productById(id);
    if (!product) return;

    let cart = getCart();
    const index = cart.findIndex(function (i) { return String(i.id) === String(id); });

    if (index > -1) {
      cart[index].quantity += quantity || 1;
    } else {
      cart.push({
        id: product.id, name: product.name, img: product.img,
        price: product.price, quantity: quantity || 1
      });
    }
    write(K.cart, cart);
    Store.onChange();
    Store.toast(product.name + " added to cart", "success");
  }

  function setQuantity(id, quantity) {
    let cart = getCart();
    const index = cart.findIndex(function (i) { return String(i.id) === String(id); });
    if (index === -1) return;

    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      const product = productById(cart[index].id);
      if (product && quantity > product.stock) quantity = product.stock;
      cart[index].quantity = quantity;
    }
    write(K.cart, cart);
    Store.onChange();
  }

  function removeFromCart(id) {
    const cart = getCart().filter(function (i) { return String(i.id) !== String(id); });
    write(K.cart, cart);
    Store.onChange();
  }

  function clearCart() {
    write(K.cart, []);
    Store.onChange();
  }

  /* ---------------------------------------------------------- wishlist  */
  function getWishlist() { return read(K.wish, []); }

  function inWishlist(id) { return getWishlist().some(function (i) { return String(i.id) === String(id); }); }

  function toggleWishlist(id) {
    const product = productById(id);
    if (!product) return false;

    let wish = getWishlist();
    const exists = inWishlist(id);

    wish = exists
      ? wish.filter(function (i) { return String(i.id) !== String(id); })
      : wish.concat([{ id: product.id, name: product.name, img: product.img, price: product.price }]);

    write(K.wish, wish);
    Store.onChange();
    Store.toast(exists ? "Removed from wishlist" : "Added to wishlist", exists ? "info" : "success");
    return !exists;
  }

  /* ------------------------------------------------------------ orders  */
  function getOrders() { return read(K.orders, []); }

  function placeOrder(customer, payment) {
    const cart = getCart();
    if (!cart.length) return { ok: false, message: "Your cart is empty" };

    /* Re-read every price from the catalog so the total can never be
       tampered with from the browser.                                    */
    let subtotal = 0;
    const items = cart.map(function (line) {
      const product = productById(line.id);
      const price = product ? product.price : line.price;
      subtotal += price * line.quantity;
      return { id: line.id, name: line.name, img: line.img, price: price, quantity: line.quantity };
    });

    const shipping = subtotal > 0 ? 20 : 0;
    const order = {
      id: orderNumber(),
      userId: currentUser() ? currentUser().email : null,
      date: Date.now(),
      items: items,
      subtotal: subtotal,
      shipping: shipping,
      total: subtotal + shipping,
      payment: payment || "Cash on Delivery",
      status: "processing",
      customer: customer
    };

    const orders = getOrders();
    orders.unshift(order);
    write(K.orders, orders);

    clearCart();
    return { ok: true, order: order };
  }

  /* -------------------------------------------------------- addresses  */
  function getAddresses() { return read(K.addresses, []); }

  function saveAddress(address) {
    const list = getAddresses().filter(function (a) { return a.id !== address.id; });
    list.unshift(address);
    write(K.addresses, list);
    return address;
  }

  function removeAddress(id) {
    write(K.addresses, getAddresses().filter(function (a) { return a.id !== id; }));
  }

  /* -------------------------------------------------------------- auth  */
  function signUp(data) {
    if (!data.name || !data.email || !data.password) return { ok: false, message: "Please fill in all fields" };
    if (findUser(data.email)) return { ok: false, message: "This email is already registered" };
    if (String(data.password).length < 6) return { ok: false, message: "Password must be at least 6 characters" };

    const user = {
      name: data.name,
      email: String(data.email).toLowerCase(),
      password: data.password,          /* demo only - never do this in production */
      phone: data.phone || "",
      address: data.address || "",
      city: data.city || "",
      country: data.country || "",
      createdAt: Date.now()
    };
    saveUser(user);
    write(K.session, { email: user.email, at: Date.now() });
    Store.onChange();                       /* refresh the header immediately */
    return { ok: true, user: user };
  }

  function login(email, password) {
    const user = findUser(email);
    if (!user || user.password !== password) return { ok: false, message: "Wrong email or password" };
    write(K.session, { email: user.email, at: Date.now() });
    Store.onChange();                       /* refresh the header immediately */
    return { ok: true, user: user };
  }

  function logout() {
    localStorage.removeItem(K.session);
    Store.onChange();
  }

  /* ------------------------------------------------------------- toast */
  function toast(message, type) {
    let box = document.getElementById("toast_box");
    if (!box) {
      box = document.createElement("div");
      box.id = "toast_box";
      box.className = "toast_box";
      document.body.appendChild(box);
    }
    const el = document.createElement("div");
    el.className = "toast " + (type || "info");
    const icon = type === "success" ? "fa-circle-check" : type === "error" ? "fa-circle-exclamation" : "fa-circle-info";
    el.innerHTML = '<i class="fa-solid ' + icon + '"></i><span>' + escapeHTML(message) + "</span>";
    box.appendChild(el);
    setTimeout(function () { el.classList.add("show"); }, 10);
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 300);
    }, 2600);
  }

  /* -------------------------------------------------------- public API */
  const Store = {
    keys: K,
    PRODUCTS: PRODUCTS,
    CATEGORIES: CATEGORIES,

    /* helpers */
    read: read, write: write, escapeHTML: escapeHTML, money: money,
    toUrl: toUrl, query: query, categoryName: categoryName,
    productById: productById, discountPercent: discountPercent, stars: stars,

    /* products */
    newArrivals: function (limit) {
      return PRODUCTS.slice().sort(function (a, b) { return a.added - b.added; }).slice(0, limit || 8);
    },
    topSale: function () {
      return PRODUCTS.filter(function (p) { return p.old_price; });
    },
    byCategory: function (slug) {
      return PRODUCTS.filter(function (p) { return p.category === slug; });
    },
    search: function (text) {
      const q = String(text || "").trim().toLowerCase();
      if (!q) return [];
      const words = q.split(/\s+/);
      return PRODUCTS.filter(function (p) {
        const hay = [p.name, p.description, p.category, (p.tags || []).join(" ")].join(" ").toLowerCase();
        return words.every(function (w) { return hay.indexOf(w) > -1; });
      });
    },

    /* cart / wishlist */
    getCart: getCart, cartHas: cartHas, cartCount: cartCount, cartSubtotal: cartSubtotal,
    addToCart: addToCart, setQuantity: setQuantity, removeFromCart: removeFromCart, clearCart: clearCart,
    getWishlist: getWishlist, inWishlist: inWishlist, toggleWishlist: toggleWishlist,

    /* orders */
    getOrders: getOrders, placeOrder: placeOrder,
    ordersOf: function (email) { return getOrders().filter(function (o) { return o.userId === email; }); },

    /* addresses */
    getAddresses: getAddresses, saveAddress: saveAddress, removeAddress: removeAddress,

    /* auth */
    signUp: signUp, login: login, logout: logout,
    currentUser: currentUser, isLoggedIn: function () { return !!currentUser(); },
    seedDemoData: seedDemoData,

    /* ui */
    toast: toast,
    productCard: productCard,

    onChange: function () {
      document.dispatchEvent(new CustomEvent("store:change"));
      renderHeaderCounts();
      if (typeof window.onStoreChange === "function") window.onStoreChange();
    }
  };

  /* ---------------------------------------------- header counters + UI */
  function renderHeaderCounts() {
    const cartEls = document.querySelectorAll(".count_item_header, .Count_item_cart");
    cartEls.forEach(function (el) { el.textContent = cartCount(); });

    const wishEl = document.querySelector(".count_favourite");
    if (wishEl) wishEl.textContent = getWishlist().length;

    renderAccountArea();
  }

  function renderAccountArea() {
    const box = document.querySelector(".login_signup");
    if (!box) return;

    const user = currentUser();
    if (user) {
      box.innerHTML =
        '<div class="user_menu">' +
          '<button type="button" class="user_btn"><i class="fa-regular fa-circle-user"></i><span class="user_name">' +
            escapeHTML(user.name.split(" ")[0]) + '</span><i class="fa-solid fa-angle-down"></i></button>' +
          '<div class="user_dropdown">' +
            '<a href="account.html">My Account</a>' +
            '<a href="orders.html">My Orders</a>' +
            '<a href="wishlist.html">Wishlist</a>' +
            '<hr>' +
            '<button type="button" class="logout_btn" onclick="Store.logout(); Store.toast(\'You are logged out\', \'info\'); setTimeout(function(){ location.href = \'index.html\'; }, 500);">Logout</button>' +
          "</div>" +
        "</div>";
    } else {
      box.innerHTML =
        '<a href="login.html" class="btn">Login <i class="fa-solid fa-right-to-bracket"></i></a>' +
        '<a href="signup.html" class="btn">Sign UP <i class="fa-solid fa-user-plus"></i></a>';
    }
  }

  /* Search box -> results page */
  function wireSearch() {
    document.querySelectorAll(".search_box").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const input = form.querySelector("input[name='search']");
        const text = input ? input.value.trim() : "";
        location.href = text ? "search.html?q=" + encodeURIComponent(text) : "shop.html";
      });
    });
  }

  /* "Browse Category" list is generated from the data */
  function wireCategoryMenu() {
    const list = document.querySelector(".category_nav_list");
    if (!list || !CATEGORIES.length) return;
    const user = currentUser();
    list.innerHTML =
      '<a href="shop.html?sale=1">Top 10 Offers</a>' +
      CATEGORIES.map(function (c) {
        return '<a href="shop.html?category=' + c.slug + '">' + escapeHTML(c.name) + "</a>";
      }).join("") +
      '<a href="orders.html">' + (user ? "My Orders" : "Login / Sign Up") + "</a>";
  }

  /* Cart drawer contents */
  function renderCartDrawer() {
    const container = document.getElementById("cart_items");
    if (!container) return;

    const cart = getCart();
    if (!cart.length) {
      container.innerHTML =
        '<div class="empty_cart_msg"><i class="fa-solid fa-cart-shopping"></i>' +
        "<p>Your cart is empty.</p><a href=\"shop.html\">Start Shopping</a></div>";
      return;
    }

    container.innerHTML = cart.map(function (item) {
      const line = item.price * item.quantity;
      return (
        '<div class="item_cart" data-id="' + item.id + '">' +
          '<img src="' + item.img + '" alt="' + escapeHTML(item.name) + '">' +
          '<div class="content">' +
            '<h4>' + escapeHTML(item.name) + "</h4>" +
            '<p class="price_cart">' + money(line) + "</p>" +
            '<div class="quantity_control">' +
              '<button type="button" class="decrease_quantity" data-id="' + item.id + '">-</button>' +
              '<span class="quantity">' + item.quantity + "</span>" +
              '<button type="button" class="Increase_quantity" data-id="' + item.id + '">+</button>' +
            "</div>" +
          "</div>" +
          '<button class="delete_item" data-id="' + item.id + '" type="button"><i class="fa-solid fa-trash-can"></i></button>' +
        "</div>"
      );
    }).join("");

    const total = document.querySelector(".cart_total");
    if (total) total.textContent = money(cartSubtotal());
  }

  /* Global click handling: add to cart, wishlist, quantity, delete */
  function wireGlobalClicks() {
    document.addEventListener("click", function (event) {

      /* add to cart */
      const addBtn = event.target.closest(".btn_add_cart");
      if (addBtn) {
        Store.addToCart(addBtn.getAttribute("data-id"), 1);
        refreshAddButtons();
        return;
      }

      /* wishlist heart */
      const wishBtn = event.target.closest("[data-wish]");
      if (wishBtn) {
        Store.toggleWishlist(wishBtn.getAttribute("data-wish"));
        refreshWishButtons();
        return;
      }

      /* quantity + */
      const inc = event.target.closest(".Increase_quantity");
      if (inc) {
        const id = inc.getAttribute("data-id");
        const line = getCart().find(function (i) { return String(i.id) === String(id); });
        if (line) Store.setQuantity(id, line.quantity + 1);
        return;
      }

      /* quantity - */
      const dec = event.target.closest(".decrease_quantity");
      if (dec) {
        const id = dec.getAttribute("data-id");
        const line = getCart().find(function (i) { return String(i.id) === String(id); });
        if (line) Store.setQuantity(id, line.quantity - 1);
        return;
      }

      /* delete line */
      const del = event.target.closest(".delete_item");
      if (del) {
        Store.removeFromCart(del.getAttribute("data-id"));
        return;
      }

      /* header user dropdown */
      const userBtn = event.target.closest(".user_btn");
      const menu = document.querySelector(".user_menu");
      if (userBtn && menu) menu.classList.toggle("active");
      else if (menu && !event.target.closest(".user_dropdown")) menu.classList.remove("active");
    });
  }

  function refreshAddButtons() {
    document.querySelectorAll(".btn_add_cart").forEach(function (btn) {
      const inCart = Store.cartHas(btn.getAttribute("data-id"));
      btn.classList.toggle("active", inCart);
      btn.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> ' + (inCart ? "Item in cart" : "add to cart");
    });
  }

  function refreshWishButtons() {
    document.querySelectorAll("[data-wish]").forEach(function (btn) {
      const inWish = Store.inWishlist(btn.getAttribute("data-wish"));
      btn.classList.toggle("active", inWish);
      btn.innerHTML = '<i class="fa-' + (inWish ? "solid" : "regular") + ' fa-heart"></i>';
    });
  }

  /* Cart drawer open/close (kept for the old inline onclick handlers) */
  window.open_close_cart = function () {
    const cart = document.querySelector(".cart");
    if (cart) cart.classList.toggle("active");
  };

  window.Open_Categ_list = function () {
    const list = document.querySelector(".category_nav_list");
    if (list) list.classList.toggle("active");
  };

  window.open_Menu = function () {
    const links = document.querySelector(".nav_links");
    if (links) links.classList.toggle("active");
  };

  /* ---------------------------------------------------------- bootstrap */
  document.addEventListener("DOMContentLoaded", function () {
    seedDemoData();
    wireGlobalClicks();
    wireSearch();
    wireCategoryMenu();
    renderHeaderCounts();
    renderCartDrawer();
    refreshAddButtons();
    refreshWishButtons();

    document.addEventListener("store:change", function () {
      renderCartDrawer();
      refreshAddButtons();
      refreshWishButtons();
    });
  });

  /* expose */
  window.Store = Store;
  window.escapeHTML = escapeHTML;
  window.money = money;
})();
