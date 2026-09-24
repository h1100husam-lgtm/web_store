/* =========================================================================
   pages.js  |  per-page rendering + interactions
   -------------------------------------------------------------------------
   Each page calls a function from here. Every function reads its data from
   the shared `Store` object (JS/store.js), so all pages stay in sync.
   ========================================================================= */

(function () {
  "use strict";

  /* =====================================================================
     helpers used by several pages
     ===================================================================== */

  function qs(selector, root) { return (root || document).querySelector(selector); }
  function qsa(selector, root) { return Array.from((root || document).querySelectorAll(selector)); }

  /* one product card for the grid pages (shop / search / wishlist) */
  function gridCard(product) {
    const inCart = Store.cartHas(product.id);
    const inWish = Store.inWishlist(product.id);
    const percent = Store.discountPercent(product);
    const badge = percent
      ? '<span class="sale_present">%' + percent + "</span>"
      : (product.added <= 7 ? '<span class="badge_new">new</span>' : "");

    return (
      '<div class="product" data-id="' + product.id + '">' +
        badge +
        '<div class="img_product"><a href="product.html?id=' + product.id + '"><img src="' + product.img + '" alt="' + Store.escapeHTML(product.name) + '" loading="lazy"></a></div>' +
        '<div class="stars">' + Store.stars(product.rating) + "</div>" +
        '<p class="name_product"><a href="product.html?id=' + product.id + '">' + Store.escapeHTML(product.name) + "</a></p>" +
        '<div class="price"><p><span>' + Store.money(product.price) + "</span></p>" +
          (product.old_price ? '<p class="old_price">' + Store.money(product.old_price) + "</p>" : "") +
        "</div>" +
        '<div class="icons">' +
          '<span class="btn_add_cart ' + (inCart ? "active" : "") + '" data-id="' + product.id + '">' +
            '<i class="fa-solid fa-cart-shopping"></i> ' + (inCart ? "Item in cart" : "add to cart") +
          "</span>" +
          '<span class="icon_product ' + (inWish ? "active" : "") + '" data-wish="' + product.id + '" title="Add to wishlist">' +
            '<i class="fa-' + (inWish ? "solid" : "regular") + ' fa-heart"></i></span>' +
        "</div>" +
      "</div>"
    );
  }

  function emptyState(icon, title, text, linkText, href) {
    return (
      '<div class="empty_state"><i class="fa-solid ' + icon + '"></i>' +
      "<h3>" + title + "</h3><p>" + text + "</p>" +
      (linkText ? '<a href="' + href + '" class="btn btn_block">' + linkText + "</a>" : "") +
      "</div>"
    );
  }

  function statusLabel(status) {
    const map = { processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
    return '<span class="status ' + status + '">' + (map[status] || status) + "</span>";
  }

  function formatDate(value) {
    const d = new Date(value);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  /* =====================================================================
     HOME PAGE
     ===================================================================== */
  function initHome() {
    const sale  = Store.topSale();
    const news  = Store.newArrivals(10);

    fill("swiper_items_sale", sale);
    fill("swiper_elctronics", Store.byCategory("electronics"));
    fill("swiper_appliances", Store.byCategory("appliances"));
    fill("swiper_mobiles", Store.byCategory("mobiles"));
    fill("swiper_new_arrivals", news);

    /* the sliders are initialised only after the slides are in the DOM */
    if (typeof window.initSliders === "function") window.initSliders();
  }

  function fill(id, list) {
    const box = document.getElementById(id);
    if (box) box.innerHTML = list.map(Store.productCard).join("");
  }

  /* =====================================================================
     SHOP PAGE  (all products + filters)
     ===================================================================== */
  let shopState = { category: "all", sale: false, max: 900, sort: "featured", q: "" };

  function initShop() {
    const params = Store.query();
    shopState.category = params.get("category") || "all";
    shopState.sale = params.get("sale") === "1";
    shopState.q = params.get("q") || "";

    renderShopSidebar();
    renderShopGrid();
    wireShopControls();
    renderShopTitle();
  }

  /* the heading changes with the category / offer you opened the page with */
  function renderShopTitle() {
    const title = qs("#shop_title");
    const crumb = qs("#shop_crumb");
    if (!title) return;

    let text = "All Products";
    if (shopState.q) text = 'Results for "' + shopState.q + '"';
    else if (shopState.category !== "all") text = Store.categoryName(shopState.category);
    if (shopState.sale) text = (shopState.category === "all" && !shopState.q ? "Top 10 Offers" : text + " - On Sale");

    title.textContent = text;
    if (crumb) crumb.textContent = text;
  }

  function renderShopSidebar() {
    const box = qs("#shop_sidebar");
    if (!box) return;

    const maxPrice = Math.max.apply(null, Store.PRODUCTS.map(function (p) { return p.price; }));

    box.innerHTML =
      "<h4>Categories</h4>" +
      '<div class="filter_list">' +
        '<a href="shop.html" class="' + (shopState.category === "all" ? "active" : "") + '">All Products ' +
          '<span class="count">(' + Store.PRODUCTS.length + ")</span></a>" +
        Store.CATEGORIES.map(function (c) {
          const n = Store.byCategory(c.slug).length;
          return '<a href="shop.html?category=' + c.slug + '" class="' + (shopState.category === c.slug ? "active" : "") + '">' +
                 '<i class="fa-solid ' + c.icon + '"></i> ' + Store.escapeHTML(c.name) +
                 ' <span class="count">(' + n + ")</span></a>";
        }).join("") +
      "</div>" +

      "<h4>Offers</h4>" +
      '<div class="filter_list">' +
        '<label><input type="checkbox" id="filter_sale" ' + (shopState.sale ? "checked" : "") + "> On sale only " +
          '<span class="count">(' + Store.topSale().length + ")</span></label>" +
      "</div>" +

      "<h4>Max Price</h4>" +
      '<div class="price_range">' +
        '<input type="range" id="filter_price" min="50" max="' + maxPrice + '" step="10" value="' + shopState.max + '">' +
        '<div class="labels"><span>$50</span><span id="price_label">' + Store.money(shopState.max) + "</span></div>" +
      "</div>";

    qs("#filter_sale").addEventListener("change", function (e) {
      shopState.sale = e.target.checked;
      renderShopGrid();
    });

    qs("#filter_price").addEventListener("input", function (e) {
      shopState.max = Number(e.target.value);
      qs("#price_label").textContent = Store.money(shopState.max);
      renderShopGrid();
    });
  }

  function shopResults() {
    let list = Store.PRODUCTS.slice();

    if (shopState.category !== "all") {
      list = list.filter(function (p) { return p.category === shopState.category; });
    }
    if (shopState.sale) {
      list = list.filter(function (p) { return p.old_price; });
    }
    list = list.filter(function (p) { return p.price <= shopState.max; });
    if (shopState.q) {
      list = Store.search(shopState.q);
    }

    const sorters = {
      featured: function (a, b) { return a.id - b.id; },
      "price-asc": function (a, b) { return a.price - b.price; },
      "price-desc": function (a, b) { return b.price - a.price; },
      rating: function (a, b) { return b.rating - a.rating; },
      newest: function (a, b) { return a.added - b.added; },
      name: function (a, b) { return a.name.localeCompare(b.name); }
    };
    list.sort(sorters[shopState.sort] || sorters.featured);
    return list;
  }

  function renderShopGrid() {
    const grid = qs("#shop_grid");
    const count = qs("#shop_count");
    if (!grid) return;

    const list = shopResults();
    if (count) count.textContent = list.length + " products found";

    grid.innerHTML = list.length
      ? list.map(gridCard).join("")
      : emptyState("fa-magnifying-glass", "No products found", "Try a different filter or price range.", "Reset filters", "shop.html");
  }

  function wireShopControls() {
    const sort = qs("#shop_sort");
    if (sort) {
      sort.value = shopState.sort;
      sort.addEventListener("change", function (e) {
        shopState.sort = e.target.value;
        renderShopGrid();
      });
    }
  }

  /* =====================================================================
     SEARCH RESULTS PAGE
     ===================================================================== */
  function initSearch() {
    const q = Store.query().get("q") || "";
    const input = qs("#search_input");
    if (input) input.value = q;

    const title = qs("#search_title");
    if (title) title.innerHTML = "Search results for: <span>" + Store.escapeHTML(q) + "</span>";

    const results = Store.search(q);
    const count = qs("#search_count");
    if (count) count.textContent = results.length + (results.length === 1 ? " product" : " products") + " found";

    const grid = qs("#search_grid");
    if (!grid) return;

    grid.innerHTML = results.length
      ? results.map(gridCard).join("")
      : emptyState("fa-magnifying-glass", "Nothing matched your search", "Check the spelling or try a shorter word.", "Browse all products", "shop.html");
  }

  /* =====================================================================
     PRODUCT DETAILS PAGE
     ===================================================================== */
  function initProduct() {
    const product = Store.productById(Store.query().get("id"));
    const box = qs("#product_page");
    if (!box) return;

    if (!product) {
      box.innerHTML = emptyState("fa-triangle-exclamation", "Product not found", "This product no longer exists.", "Back to shop", "shop.html");
      return;
    }

    const percent = Store.discountPercent(product);
    const related = Store.PRODUCTS
      .filter(function (p) { return p.category === product.category && p.id !== product.id; })
      .slice(0, 4);

    document.title = product.name + " | Reda Store";

    box.innerHTML =
      '<div class="product_gallery">' +
        '<div class="main_img"><img id="main_img" src="' + product.img + '" alt="' + Store.escapeHTML(product.name) + '"></div>' +
        '<div class="thumbs">' +
          '<div class="thumb active" data-src="' + product.img + '"><img src="' + product.img + '" alt=""></div>' +
          '<div class="thumb" data-src="' + product.img + '"><img src="' + product.img + '" alt=""></div>' +
          '<div class="thumb" data-src="' + product.img + '"><img src="' + product.img + '" alt=""></div>' +
        "</div>" +
      "</div>" +

      '<div class="product_info">' +
        '<a class="cat_link" href="shop.html?category=' + product.category + '">' + Store.escapeHTML(Store.categoryName(product.category)) + "</a>" +
        "<h1>" + Store.escapeHTML(product.name) + "</h1>" +
        '<div class="rating_line">' + Store.stars(product.rating) +
          "<span>" + product.rating.toFixed(1) + " / 5</span>" +
          "<span>(" + product.reviews + " reviews)</span></div>" +

        '<div class="price_box">' +
          '<span class="now">' + Store.money(product.price) + "</span>" +
          (product.old_price ? '<span class="was">' + Store.money(product.old_price) + "</span>" : "") +
          (percent ? '<span class="off">Save ' + percent + "%</span>" : "") +
        "</div>" +

        '<p class="stock_line">Availability: <b>' + (product.stock > 0 ? "In Stock (" + product.stock + " left)" : "Out of stock") + "</b></p>" +
        '<p class="desc_short">' + Store.escapeHTML(product.description) + "</p>" +

        '<div class="buy_row">' +
          '<div class="qty">' +
            '<button type="button" id="qty_minus">-</button>' +
            '<span id="qty_value">1</span>' +
            '<button type="button" id="qty_plus">+</button>' +
          "</div>" +
          '<button type="button" class="btn" id="add_to_cart_btn"><i class="fa-solid fa-cart-shopping"></i> Add to Cart</button>' +
          '<button type="button" class="icon_btn ' + (Store.inWishlist(product.id) ? "active" : "") + '" data-wish="' + product.id + '" title="Add to wishlist">' +
            '<i class="fa-' + (Store.inWishlist(product.id) ? "solid" : "regular") + ' fa-heart"></i></button>' +
        "</div>" +

        '<div class="product_meta">' +
          "<p><span>Category:</span> " + Store.escapeHTML(Store.categoryName(product.category)) + "</p>" +
          "<p><span>Product code:</span> SKU-" + (1000 + product.id) + "</p>" +
          "<p><span>Tags:</span> " + (product.tags || []).join(", ") + "</p>" +
        "</div>" +
      "</div>";

    /* tabs */
    qs("#product_tabs").innerHTML =
      '<div class="tabs_head">' +
        '<button type="button" class="active" data-tab="desc">Description</button>' +
        '<button type="button" data-tab="specs">Specifications</button>' +
        '<button type="button" data-tab="reviews">Reviews (' + product.reviews + ")</button>" +
      "</div>" +
      '<div class="tabs_body">' +
        '<div class="tab_pane active" data-pane="desc"><p>' + Store.escapeHTML(product.description) + "</p></div>" +
        '<div class="tab_pane" data-pane="specs">' +
          '<table class="spec_table"><tbody>' +
            (product.specs || []).map(function (row) {
              return "<tr><th>" + Store.escapeHTML(row[0]) + "</th><td>" + Store.escapeHTML(row[1]) + "</td></tr>";
            }).join("") +
          "</tbody></table>" +
        "</div>" +
        '<div class="tab_pane" data-pane="reviews">' +
          '<div class="rating_summary"><span class="big">' + product.rating.toFixed(1) + "</span>" +
            '<div class="meta">' + Store.stars(product.rating) + "<p>Based on " + product.reviews + " customer reviews</p></div>" +
          "</div>" +
          '<div id="reviews_list">' + reviewList(product).join("") + "</div>" +
          '<form id="review_form" class="form_card" style="margin-top:25px">' +
            "<h4>Write a review</h4>" +
            '<div class="input_group"><label>Your rating</label><select id="review_rating">' +
              '<option value="5">5 - Excellent</option><option value="4">4 - Good</option>' +
              '<option value="3">3 - Average</option><option value="2">2 - Poor</option><option value="1">1 - Bad</option>' +
            "</select></div>" +
            '<div class="input_group"><label>Your review</label><textarea id="review_text" placeholder="Share your experience..."></textarea></div>' +
            '<button type="submit" class="btn">Submit review</button>' +
          "</form>" +
        "</div>" +
      "</div>";

    /* related products */
    const relatedBox = qs("#related_grid");
    if (relatedBox) {
      relatedBox.innerHTML = related.length
        ? related.map(gridCard).join("")
        : emptyState("fa-box-open", "No related products", "");
    }

    /* --- interactions --- */
    let qty = 1;

    const qtyValue = qs("#qty_value");
    qs("#qty_minus").addEventListener("click", function () {
      qty = Math.max(1, qty - 1);
      qtyValue.textContent = qty;
    });
    qs("#qty_plus").addEventListener("click", function () {
      qty = Math.min(product.stock || 10, qty + 1);
      qtyValue.textContent = qty;
    });

    qs("#add_to_cart_btn").addEventListener("click", function () {
      Store.addToCart(product.id, qty);
    });

    qsa(".thumb").forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        qsa(".thumb").forEach(function (t) { t.classList.remove("active"); });
        thumb.classList.add("active");
        qs("#main_img").src = thumb.getAttribute("data-src");
      });
    });

    qsa(".tabs_head button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        qsa(".tabs_head button").forEach(function (b) { b.classList.remove("active"); });
        qsa(".tab_pane").forEach(function (p) { p.classList.remove("active"); });
        btn.classList.add("active");
        qs('.tab_pane[data-pane="' + btn.getAttribute("data-tab") + '"]').classList.add("active");
      });
    });

    const reviewForm = qs("#review_form");
    if (reviewForm) {
      reviewForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const text = qs("#review_text").value.trim();
        if (!text) {
          Store.toast("Please write your review first", "error");
          return;
        }
        qs("#reviews_list").insertAdjacentHTML("afterbegin",
          '<div class="review"><div class="avatar">' + (Store.isLoggedIn() ? Store.escapeHTML(Store.currentUser().name[0]) : "G") + "</div>" +
          '<div class="body"><h5>' + (Store.isLoggedIn() ? Store.escapeHTML(Store.currentUser().name) : "Guest") + "</h5>" +
          '<div class="stars">' + Store.stars(Number(qs("#review_rating").value)) + "</div>" +
          "<p>" + Store.escapeHTML(text) + "</p></div></div>");
        reviewForm.reset();
        Store.toast("Thanks! Your review was added", "success");
      });
    }
  }

  function reviewList(product) {
    /* 3 fake reviews taken from the pool, chosen by product id */
    const pool = REVIEW_POOL || [];
    const picked = [0, 1, 2].map(function (i) { return pool[(product.id + i) % pool.length]; });
    return picked.map(function (r) {
      return (
        '<div class="review"><div class="avatar">' + Store.escapeHTML(r.name[0]) + "</div>" +
        '<div class="body"><h5>' + Store.escapeHTML(r.name) + '</h5><div class="stars">' +
        Store.stars(r.rating) + "</div><p>" + Store.escapeHTML(r.text) + "</p></div></div>"
      );
    });
  }

  /* =====================================================================
     WISHLIST PAGE
     ===================================================================== */
  function initWishlist() {
    const box = qs("#wishlist_grid");
    if (!box) return;

    const wish = Store.getWishlist().map(function (line) { return Store.productById(line.id); }).filter(Boolean);
    const count = qs("#wishlist_count");
    if (count) count.textContent = wish.length + (wish.length === 1 ? " item" : " items");

    box.innerHTML = wish.length
      ? wish.map(gridCard).join("")
      : emptyState("fa-heart", "Your wishlist is empty", "Tap the heart on any product to save it here.", "Browse products", "shop.html");
  }

  /* =====================================================================
     CART PAGE
     ===================================================================== */
  function initCart() {
    const box = qs("#cart_page_items");
    if (!box) return;

    const cart = Store.getCart();
    const total = Store.cartSubtotal();

    box.innerHTML = cart.length
      ? cart.map(function (item) {
          return (
            '<div class="checkout_item_row" data-id="' + item.id + '">' +
              '<img src="' + item.img + '" alt="' + Store.escapeHTML(item.name) + '">' +
              '<div class="info">' +
                "<h4>" + Store.escapeHTML(item.name) + "</h4>" +
                '<p class="qty_line">' + Store.money(item.price) + " each</p>" +
              "</div>" +
              '<div class="quantity_control">' +
                '<button type="button" class="decrease_quantity" data-id="' + item.id + '">-</button>' +
                '<span class="quantity">' + item.quantity + "</span>" +
                '<button type="button" class="Increase_quantity" data-id="' + item.id + '">+</button>' +
              "</div>" +
              '<span class="line_price">' + Store.money(item.price * item.quantity) + "</span>" +
              '<button class="delete_item" data-id="' + item.id + '" type="button"><i class="fa-solid fa-trash-can"></i></button>' +
            "</div>"
          );
        }).join("")
      : emptyState("fa-cart-shopping", "Your cart is empty", "Add some products and come back.", "Start shopping", "shop.html");

    setText("#cart_subtotal", Store.money(total));
    setText("#cart_shipping", Store.money(total > 0 ? 20 : 0));
    setText("#cart_total", Store.money(total > 0 ? total + 20 : 0));

    const checkoutBtn = qs("#cart_checkout_btn");
    if (checkoutBtn) checkoutBtn.classList.toggle("disabled", !cart.length);
  }

  function setText(selector, text) {
    const el = qs(selector);
    if (el) el.textContent = text;
  }

  /* =====================================================================
     CHECKOUT PAGE
     ===================================================================== */
  function initCheckout() {
    renderCheckoutItems();

    const form = qs("#checkout_form");
    if (form) form.addEventListener("submit", submitCheckout);

    const user = Store.currentUser();
    const prompt = qs("#checkout_login_prompt");

    if (user) {
      fillDeliveryForm(user);
    } else if (prompt) {
      prompt.innerHTML =
        '<div class="login_prompt">' +
          '<i class="fa-solid fa-circle-info"></i>' +
          "<span>You are checking out as a guest. <b>Login</b> to save your details and keep the order in your history.</span>" +
          '<a href="login.html?next=checkout.html" class="btn btn_sm">Login</a>' +
          '<a href="signup.html?next=checkout.html" class="btn btn_outline btn_sm">Sign UP</a>' +
        "</div>";
    }
  }

  function renderCheckoutItems() {
    const box = qs("#checkout_items");
    if (!box) return;

    const cart = Store.getCart();
    const subtotal = Store.cartSubtotal();
    const shipping = cart.length ? 20 : 0;

    if (!cart.length) {
      box.innerHTML = emptyState("fa-cart-shopping", "Your cart is empty", "You need products before you can check out.", "Go to shop", "shop.html");
      setText(".subtotal_checkout", Store.money(0));
      setText(".shipping_checkout", Store.money(0));
      setText(".total_checkout", Store.money(0));
      const btn = qs("#place_order_btn");
      if (btn) btn.disabled = true;
      return;
    }

    box.innerHTML = cart.map(function (item) {
      return (
        '<div class="checkout_item_row" data-id="' + item.id + '">' +
          '<img src="' + item.img + '" alt="' + Store.escapeHTML(item.name) + '">' +
          '<div class="info"><h4>' + Store.escapeHTML(item.name) + "</h4>" +
            '<p class="qty_line">Qty: ' + item.quantity + "</p></div>" +
          '<span class="line_price">' + Store.money(item.price * item.quantity) + "</span>" +
        "</div>"
      );
    }).join("");

    setText(".subtotal_checkout", Store.money(subtotal));
    setText(".shipping_checkout", Store.money(shipping));
    setText(".total_checkout", Store.money(subtotal + shipping));
  }

  function fillDeliveryForm(user) {
    const map = {
      "#first_name": user.name.split(" ")[0],
      "#last_name": user.name.split(" ").slice(1).join(" "),
      "#email": user.email,
      "#phone": user.phone,
      "#address": user.address,
      "#city": user.city,
      "#country": user.country
    };
    Object.keys(map).forEach(function (sel) {
      const el = qs(sel);
      if (el) el.value = map[sel];
    });
  }

  function submitCheckout(event) {
    event.preventDefault();

    if (!Store.getCart().length) {
      Store.toast("Your cart is empty", "error");
      return;
    }

    const value = function (sel) { const el = qs(sel); return el ? el.value.trim() : ""; };

    const customer = {
      firstName: value("#first_name"),
      lastName: value("#last_name"),
      email: value("#email"),
      phone: value("#phone"),
      address: value("#address"),
      city: value("#city"),
      country: value("#country"),
      notes: value("#notes")
    };

    for (const key of ["firstName", "lastName", "email", "phone", "address", "city", "country"]) {
      if (!customer[key]) {
        Store.toast("Please complete the delivery information", "error");
        const field = qs("#" + (key === "firstName" ? "first_name" : key === "lastName" ? "last_name" : key));
        if (field) field.focus();
        return;
      }
    }

    const payment = (qs('input[name="payment_method"]:checked') || {}).value || "Cash on Delivery";
    const result = Store.placeOrder(customer, payment);

    if (!result.ok) {
      Store.toast(result.message, "error");
      return;
    }

    /* success modal */
    const order = result.order;
    qs("#orderModalDetails").innerHTML =
      "<p><strong>Order ID:</strong> " + order.id + "</p>" +
      "<p><strong>Recipient:</strong> " + Store.escapeHTML(order.customer.firstName + " " + order.customer.lastName) + "</p>" +
      "<p><strong>Email:</strong> " + Store.escapeHTML(order.customer.email) + "</p>" +
      "<p><strong>Phone:</strong> " + Store.escapeHTML(order.customer.phone) + "</p>" +
      "<p><strong>Shipping Address:</strong> " + Store.escapeHTML(order.customer.address + ", " + order.customer.city) + "</p>" +
      "<p><strong>Payment:</strong> " + Store.escapeHTML(order.payment) + "</p>" +
      "<p><strong>Total Paid:</strong> " + Store.money(order.total) + " (includes " + Store.money(order.shipping) + " shipping)</p>";

    qs("#orderModal").classList.add("active");
    qs("#checkout_form").reset();
    Store.toast("Order placed successfully", "success");
  }

  /* =====================================================================
     LOGIN PAGE
     ===================================================================== */
  function initLogin() {
    const next = Store.query().get("next") || "account.html";
    if (Store.isLoggedIn()) { location.href = next; return; }

    const form = qs("#login_form");
    if (!form) return;

    /* demo helper: fills the demo account fields */
    const demoBtn = qs("#fill_demo");
    if (demoBtn) {
      demoBtn.addEventListener("click", function () {
        qs("#email").value = DEMO_USER.email;
        qs("#password").value = DEMO_USER.password;
        hideAlert();
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      hideAlert();

      const email = qs("#email").value.trim();
      const password = qs("#password").value;

      if (!email || !password) return showAlert("Please enter your email and password");

      const result = Store.login(email, password);
      if (!result.ok) return showAlert(result.message);

      Store.toast("Welcome back, " + result.user.name + "!", "success");
      setTimeout(function () { location.href = next; }, 600);
    });
  }

  function showAlert(message) {
    const box = qs("#auth_error");
    if (!box) { Store.toast(message, "error"); return; }
    box.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i><span>' + Store.escapeHTML(message) + "</span>";
    box.classList.add("show");
  }

  function hideAlert() {
    const box = qs("#auth_error");
    if (box) box.classList.remove("show");
  }

  /* =====================================================================
     SIGN UP PAGE
     ===================================================================== */
  function initSignup() {
    if (Store.isLoggedIn()) { location.href = "account.html"; return; }

    const form = qs("#signup_form");
    if (!form) return;

    const pass = qs("#password");
    const meter = qs("#strength_bar");
    const meterText = qs("#strength_text");

    if (pass && meter) {
      pass.addEventListener("input", function () {
        const v = pass.value;
        let score = 0;
        if (v.length >= 6) score++;
        if (v.length >= 10) score++;
        if (/[A-Z]/.test(v)) score++;
        if (/[0-9]/.test(v)) score++;
        if (/[^A-Za-z0-9]/.test(v)) score++;

        meter.className = score <= 1 ? "" : score < 4 ? "medium" : "strong";
        meter.style.width = Math.min(100, score * 25) + "%";
        meterText.textContent = v ? ["Very weak", "Weak", "Fair", "Good", "Strong"][Math.min(4, score)] : "";
      });
    }

    const toggle = qs("#toggle_pass");
    if (toggle) {
      toggle.addEventListener("click", function () {
        pass.type = pass.type === "password" ? "text" : "password";
        toggle.innerHTML = '<i class="fa-regular fa-eye' + (pass.type === "password" ? "" : "-slash") + '"></i>';
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      hideAlert();

      const name = qs("#name").value.trim();
      const email = qs("#email").value.trim();
      const phone = qs("#phone").value.trim();
      const password = qs("#password").value;
      const confirmPassword = qs("#confirm_password").value;

      if (!name || !email || !password) return showAlert("Please fill in all required fields");
      if (password.length < 6) return showAlert("Password must be at least 6 characters");
      if (password !== confirmPassword) return showAlert("The two passwords do not match");
      if (!qs("#terms").checked) return showAlert("Please accept the terms and conditions");

      const result = Store.signUp({ name: name, email: email, phone: phone, password: password });
      if (!result.ok) return showAlert(result.message);

      Store.toast("Account created successfully", "success");
      setTimeout(function () { location.href = "account.html"; }, 700);
    });
  }

  /* =====================================================================
     ACCOUNT PAGE
     ===================================================================== */
  function initAccount() {
    if (!Store.isLoggedIn()) { location.href = "login.html?next=account.html"; return; }

    const user = Store.currentUser();
    const orders = Store.ordersOf(user.email);

    /* side menu */
    qs("#account_menu").innerHTML =
      '<div class="profile_head"><div class="avatar">' + Store.escapeHTML(user.name[0].toUpperCase()) + "</div>" +
        "<h4>" + Store.escapeHTML(user.name) + "</h4><p>" + Store.escapeHTML(user.email) + "</p></div>" +
      '<div class="links">' +
        '<a href="account.html" class="active"><i class="fa-solid fa-user"></i> My Profile</a>' +
        '<a href="orders.html"><i class="fa-solid fa-box"></i> My Orders (' + orders.length + ")</a>" +
        '<a href="wishlist.html"><i class="fa-solid fa-heart"></i> Wishlist</a>' +
        '<a href="cart.html"><i class="fa-solid fa-cart-shopping"></i> Cart</a>' +
        '<a href="checkout.html"><i class="fa-solid fa-credit-card"></i> Checkout</a>' +
        '<a href="#" onclick="Store.logout(); setTimeout(function(){ location.href = \'index.html\'; }, 400); return false;"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>' +
      "</div>";

    /* stats */
    const spent = orders.reduce(function (sum, o) { return sum + o.total; }, 0);
    qs("#stat_orders").textContent = orders.length;
    qs("#stat_wish").textContent = Store.getWishlist().length;
    qs("#stat_spent").textContent = Store.money(spent);
    qs("#stat_cart").textContent = Store.cartCount();

    /* profile form */
    qs("#profile_name").value = user.name;
    qs("#profile_email").value = user.email;
    qs("#profile_phone").value = user.phone || "";
    qs("#profile_address").value = user.address || "";
    qs("#profile_city").value = user.city || "";
    qs("#profile_country").value = user.country || "";

    const form = qs("#profile_form");
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const users = Store.read(Store.keys.users, []);
      const index = users.findIndex(function (u) { return u.email === user.email; });
      if (index === -1) return;

      users[index].name = qs("#profile_name").value.trim();
      users[index].phone = qs("#profile_phone").value.trim();
      users[index].address = qs("#profile_address").value.trim();
      users[index].city = qs("#profile_city").value.trim();
      users[index].country = qs("#profile_country").value.trim();

      Store.write(Store.keys.users, users);
      Store.onChange();
      Store.toast("Profile updated", "success");
      setTimeout(function () { location.reload(); }, 600);
    });
  }

  /* =====================================================================
     ORDERS PAGE
     ===================================================================== */
  function initOrders() {
    const box = qs("#orders_list");
    if (!box) return;

    if (!Store.isLoggedIn()) {
      box.innerHTML = emptyState("fa-right-to-bracket", "Please login first", "Login to see your order history.", "Go to login", "login.html?next=orders.html");
      return;
    }

    const orders = Store.ordersOf(Store.currentUser().email);
    const count = qs("#orders_count");
    if (count) count.textContent = orders.length + (orders.length === 1 ? " order" : " orders");

    box.innerHTML = orders.length
      ? orders.map(orderCard).join("")
      : emptyState("fa-box", "No orders yet", "When you place an order it will appear here.", "Start shopping", "shop.html");
  }

  function orderCard(order) {
    return (
      '<div class="order_card">' +
        '<div class="head">' +
          '<span class="id">' + order.id + "</span>" +
          "<span>Placed on " + formatDate(order.date) + "</span>" +
          "<span>" + statusLabel(order.status) + "</span>" +
        "</div>" +
        '<div class="body">' +
          '<div class="mini_products">' +
            order.items.map(function (i) { return '<img src="' + i.img + '" alt="' + Store.escapeHTML(i.name) + '" title="' + Store.escapeHTML(i.name) + '">'; }).join("") +
          "</div>" +
          '<div class="lines">' +
            order.items.map(function (i) {
              return "<p>" + Store.escapeHTML(i.name) + " &times; " + i.quantity + "</p>";
            }).join("") +
            '<p style="margin-top:8px">Payment: <b>' + Store.escapeHTML(order.payment) + "</b></p>" +
          "</div>" +
        "</div>" +
        '<div class="foot">' +
          "<span>Subtotal " + Store.money(order.subtotal) + " + Shipping " + Store.money(order.shipping) + "</span>" +
          '<span class="total_price">Total: ' + Store.money(order.total) + "</span>" +
          '<button type="button" class="btn btn_outline btn_sm" data-reorder="' + order.id + '"><i class="fa-solid fa-rotate-right"></i> Re-order</button>' +
        "</div>" +
      "</div>"
    );
  }

  /* "Re-order" puts the same products back in the cart */
  document.addEventListener("click", function (event) {
    const btn = event.target.closest("[data-reorder]");
    if (!btn) return;

    const order = Store.getOrders().find(function (o) { return o.id === btn.getAttribute("data-reorder"); });
    if (!order) return;

    order.items.forEach(function (item) { Store.addToCart(item.id, item.quantity); });
    Store.toast("Products added to your cart", "success");
    setTimeout(function () { location.href = "cart.html"; }, 700);
  });

  /* =====================================================================
     CONTACT PAGE
     ===================================================================== */
  function initContact() {
    const form = qs("#contact_form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = qs("#c_name").value.trim();
      const email = qs("#c_email").value.trim();
      const message = qs("#c_message").value.trim();

      if (!name || !email || !message) {
        Store.toast("Please fill in all fields", "error");
        return;
      }
      Store.toast("Thanks " + name + "! Your message was sent", "success");
      form.reset();
    });
  }

  /* =====================================================================
     router
     ===================================================================== */
  const pages = {
    "index.html": initHome,
    "shop.html": initShop,
    "search.html": initSearch,
    "product.html": initProduct,
    "wishlist.html": initWishlist,
    "cart.html": initCart,
    "checkout.html": initCheckout,
    "login.html": initLogin,
    "signup.html": initSignup,
    "account.html": initAccount,
    "orders.html": initOrders,
    "contact.html": initContact
  };

  function boot() {
    const file = location.pathname.split("/").pop() || "index.html";
    const handler = pages[file];
    if (handler) handler();
  }

  document.addEventListener("DOMContentLoaded", boot);

  /* expose the small helpers other inline handlers may need */
  window.gridCard = gridCard;
  window.emptyState = emptyState;
})();
