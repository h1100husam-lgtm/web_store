// Navigation & Menu toggles
let category_nav_list = document.querySelector(".category_nav_list");

function Open_Categ_list() {
    if (category_nav_list) {
        category_nav_list.classList.toggle("active");
    }
}

let nav_links = document.querySelector(".nav_links");

function open_Menu() {
    if (nav_links) {
        nav_links.classList.toggle("active");
    }
}

var cart = document.querySelector('.cart');

function open_close_cart() {
    if (cart) {
        cart.classList.toggle("active");
    }
}

// Global products store
let allProductsData = [];

fetch('products.json')
    .then(response => response.json())
    .then(data => {
        allProductsData = data;
    })
    .catch(error => {
        console.error("Error loading products.json:", error);
    });

// Event Delegation for "Add to Cart" buttons
document.addEventListener("click", (event) => {
    const btn = event.target.closest(".btn_add_cart");
    if (!btn) return;

    const productId = btn.getAttribute("data-id");
    if (productId === null) return;

    const selectedProduct = allProductsData.find(product => product.id == productId);
    if (selectedProduct) {
        addToCart(selectedProduct);

        const allMatchingButtons = document.querySelectorAll(`.btn_add_cart[data-id="${productId}"]`);
        allMatchingButtons.forEach(b => {
            b.classList.add("active");
            b.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Item in cart`;
        });
    }
});

function addToCart(product) {
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.id == product.id);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

function updateCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById("cart_items");

    let total_Price = 0;
    let total_count = 0;

    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = "";
    }

    cart.forEach((item, index) => {
        let total_Price_item = item.price * item.quantity;
        total_Price += total_Price_item;
        total_count += item.quantity;

        if (cartItemsContainer) {
            cartItemsContainer.innerHTML += `
                <div class="item_cart">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="content">
                        <h4>${item.name}</h4>
                        <p class="price_cart">$${total_Price_item}</p>
                        <div class="quantity_control">
                            <button class="decrease_quantity" data-index="${index}" type="button">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="Increase_quantity" data-index="${index}" type="button">+</button>
                        </div>
                    </div>
                    <button class="delete_item" data-index="${index}" type="button"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
        }
    });

    const price_cart_total = document.querySelector('.price_cart_toral');
    const count_item_cart = document.querySelector('.Count_item_cart');
    const count_item_header = document.querySelector('.count_item_header');

    if (price_cart_total) price_cart_total.innerHTML = `$ ${total_Price}`;
    if (count_item_cart) count_item_cart.innerHTML = total_count;
    if (count_item_header) count_item_header.innerHTML = total_count;

    // Update checkout page summary if present
    updateCheckoutSummary(cart, total_Price);
}

function updateCheckoutSummary(cart, total_Price) {
    const checkoutItems = document.getElementById("checkout_items");
    const subtotalEl = document.querySelector(".subtotal_checkout");
    const shippingEl = document.querySelector(".shipping_checkout");
    const totalEl = document.querySelector(".total_checkout");

    if (!checkoutItems) return;

    if (!cart || cart.length === 0) {
        checkoutItems.innerHTML = `
            <div class="empty_cart_msg">
                <i class="fa-solid fa-cart-shopping" style="font-size: 36px; color: var(--p_color); margin-bottom: 12px; display: block;"></i>
                <p>Your cart is empty.</p>
                <a href="index.html">Continue Shopping</a>
            </div>
        `;
        if (subtotalEl) subtotalEl.textContent = "$0.00";
        if (shippingEl) shippingEl.textContent = "$0.00";
        if (totalEl) totalEl.textContent = "$0.00";
        return;
    }

    const shipping = 20;
    const grandTotal = total_Price + shipping;

    checkoutItems.innerHTML = "";
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        checkoutItems.innerHTML += `
            <div class="item_cart">
                <div class="image_name">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="content">
                        <h4>${item.name}</h4>
                        <p class="price_cart">$${itemTotal}</p>
                        <div class="quantity_control">
                            <button class="decrease_quantity" data-index="${index}" type="button">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="Increase_quantity" data-index="${index}" type="button">+</button>
                        </div>
                    </div>
                </div>
                <button class="delete_item" data-index="${index}" type="button"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
    });

    if (subtotalEl) subtotalEl.textContent = `$${total_Price}.00`;
    if (shippingEl) shippingEl.textContent = `$${shipping}.00`;
    if (totalEl) totalEl.textContent = `$${grandTotal}.00`;
}

// Event Delegation for Quantity & Delete controls in both Side Cart & Checkout
document.addEventListener("click", (event) => {
    // Increase quantity
    const incBtn = event.target.closest(".Increase_quantity") || event.target.closest(".increase_quantity");
    if (incBtn) {
        event.preventDefault();
        const index = incBtn.getAttribute("data-index");
        if (index !== null) increaseQuantity(Number(index));
        return;
    }

    // Decrease quantity
    const decBtn = event.target.closest(".decrease_quantity");
    if (decBtn) {
        event.preventDefault();
        const index = decBtn.getAttribute("data-index");
        if (index !== null) decreaseQuantity(Number(index));
        return;
    }

    // Delete item
    const delBtn = event.target.closest(".delete_item");
    if (delBtn) {
        event.preventDefault();
        const index = delBtn.getAttribute("data-index") || delBtn.getAttribute("data-inex");
        if (index !== null) removeFromCart(Number(index));
        return;
    }
});

function increaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart[index]) {
        cart[index].quantity += 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    }
}

function decreaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart[index]) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    }
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart[index]) {
        const removeProduct = cart.splice(index, 1)[0];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        if (removeProduct) {
            updateButoonsState(removeProduct.id);
        }
    }
}

function updateButoonsState(productId) {
    const allMatchingButtons = document.querySelectorAll(`.btn_add_cart[data-id="${productId}"]`);
    allMatchingButtons.forEach(button => {
        button.classList.remove('active');
        button.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> add to cart`;
    });
}

// Checkout Form Submission
const checkoutForm = document.getElementById("checkout_form");
if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (!cart || cart.length === 0) {
            alert("Your cart is empty! Please add products before placing an order.");
            return;
        }

        const firstName = document.getElementById("first_name") ? document.getElementById("first_name").value : "";
        const lastName = document.getElementById("last_name") ? document.getElementById("last_name").value : "";
        const email = document.getElementById("email") ? document.getElementById("email").value : "";
        const phone = document.getElementById("phone") ? document.getElementById("phone").value : "";
        const address = document.getElementById("address") ? document.getElementById("address").value : "";
        const city = document.getElementById("city") ? document.getElementById("city").value : "";

        const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);
        let totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) + 20;

        // Show Order Success Modal
        const orderModal = document.getElementById("orderModal");
        const orderModalDetails = document.getElementById("orderModalDetails");

        if (orderModal && orderModalDetails) {
            orderModalDetails.innerHTML = `
                <p><strong>Order ID:</strong> ${orderNumber}</p>
                <p><strong>Recipient:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Shipping Address:</strong> ${address}, ${city}</p>
                <p><strong>Total Paid:</strong> $${totalAmount}.00 (Includes $20 Shipping)</p>
            `;
            orderModal.classList.add("active");
        } else {
            alert(`Order ${orderNumber} placed successfully! Total: $${totalAmount}`);
        }

        // Clear cart after order placed
        localStorage.removeItem('cart');
        updateCart();

        // Reset add to cart buttons
        const allButtons = document.querySelectorAll(".btn_add_cart");
        allButtons.forEach(btn => {
            btn.classList.remove("active");
            btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> add to cart`;
        });
    });
}

// Initial cart sync on page load
updateCart();