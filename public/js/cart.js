document.addEventListener("DOMContentLoaded", () => {
    
  const increaseBtns = document.querySelectorAll(".qty-increase");
  const decreaseBtns = document.querySelectorAll(".qty-decrease");
  const removeBtns = document.querySelectorAll(".removeCartBtn");

  /* =========================
     UPDATE QUANTITY
  ========================= */

const updateQtyButtonsState = (item) => {
  const qty = parseInt(item.querySelector(".qty-value").textContent);

  const incBtn = item.querySelector(".qty-increase");
  const decBtn = item.querySelector(".qty-decrease");

  const stock = parseInt(item.dataset.stock); // 🔥 IMPORTANT

  // RESET
  incBtn.classList.remove("opacity-40", "cursor-not-allowed");
  decBtn.classList.remove("opacity-40", "cursor-not-allowed");

  incBtn.disabled = false;
  decBtn.disabled = false;

  /* 🔥 MAX LIMIT */
  if (qty >= 5) {
    incBtn.disabled = true;
    incBtn.classList.add("opacity-40", "cursor-not-allowed");
  }

  /* 🔥 STOCK LIMIT (NEW FIX) */
  if (qty >= stock) {
    incBtn.disabled = true;
    incBtn.classList.add("opacity-40", "cursor-not-allowed");
  }

  /* 🔥 MIN LIMIT */
  if (qty <= 1) {
    decBtn.disabled = true;
    decBtn.classList.add("opacity-40", "cursor-not-allowed");
  }
};

  const updateQuantity = async (btn, quantity) => {

  const item = btn.closest(".cart-item");
  const incBtn = item.querySelector(".qty-increase");

  try {

    const res = await fetch("/cart/quantity", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: btn.dataset.product,
        variantType: btn.dataset.variant,
        quantity
      })
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message, "error");
      return;
    }

    showToast(data.message, "success");

    const qtyEl = item.querySelector(".qty-value");

    /* 🔥 IMPORTANT: take values from backend */
    const { quantity: newQty, maxReached, stockReached } = data.data;

    /* 🔥 UPDATE UI */
    qtyEl.textContent = newQty;

    /* 🔥 HANDLE + BUTTON (MAIN FIX) */
    if (maxReached || stockReached) {
      incBtn.disabled = true;
      incBtn.classList.add("opacity-40", "cursor-not-allowed");
    } else {
      incBtn.disabled = false;
      incBtn.classList.remove("opacity-40", "cursor-not-allowed");
    }

    /* 🔥 HANDLE - BUTTON */
    const decBtn = item.querySelector(".qty-decrease");

    if (newQty <= 1) {
      decBtn.disabled = true;
      decBtn.classList.add("opacity-40", "cursor-not-allowed");
    } else {
      decBtn.disabled = false;
      decBtn.classList.remove("opacity-40", "cursor-not-allowed");
    }

    updateSummary();

  } catch (err) {
    console.error(err);
  }
};

increaseBtns.forEach(btn => {
  btn.addEventListener("click", () => {

    if (btn.disabled) return;

    const item = btn.closest(".cart-item");
    const qtyEl = item.querySelector(".qty-value");

    const quantity = parseInt(qtyEl.textContent) + 1;

    updateQuantity(btn, quantity);

  });
});

decreaseBtns.forEach(btn => {
  btn.addEventListener("click", () => {

    if (btn.disabled) return;

    const item = btn.closest(".cart-item");
    const qtyEl = item.querySelector(".qty-value");

    const quantity = parseInt(qtyEl.textContent) - 1;

    updateQuantity(btn, quantity);

  });
});

  removeBtns.forEach(btn => {

  btn.addEventListener("click", async () => {

    const productId = btn.dataset.product;
    const variantType = btn.dataset.variant;

    try {

      const res = await fetch("/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantType })
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message, "error");
        return;
      }

      showToast(data.message, "success");

      const item = btn.closest(".cart-item");
      item.remove();

      updateSummary();
      updateCartCount();
      checkEmptyState();
      updateCheckoutState();

    } catch (err) {
      console.error(err);
    }

  });

});


function updateSummary() {

  const items = document.querySelectorAll(".cart-item");

  let subtotal = 0;
  let totalItems = 0;

  items.forEach(item => {

    const price = parseInt(item.dataset.price);
    const qty = parseInt(item.querySelector(".qty-value").textContent);

    subtotal += price * qty;
    totalItems += qty;

  });

  document.getElementById("subtotal").textContent = `₹${subtotal}`;
  document.getElementById("totalItems").textContent = totalItems;
  document.getElementById("totalAmount").textContent = `₹${subtotal}`;

}

function checkEmptyState() {

  const cartContainer = document.getElementById("cartContainer");
  const emptyState = document.getElementById("emptyState");

  if (!cartContainer || !emptyState) return; // 🔥 prevent crash

  const items = document.querySelectorAll(".cart-item");

  if (items.length === 0) {
    cartContainer.classList.add("hidden");
    emptyState.classList.remove("hidden");
  }

}

function updateCheckoutState() {

  const items = document.querySelectorAll(".cart-item");

  let hasInvalid = false;

  items.forEach(item => {

    if (
      item.dataset.outofstock === "true" ||
      item.dataset.unavailable === "true"
    ) {
      hasInvalid = true;
    }

  });

  const checkoutBtn = document.getElementById("checkoutBtn");

  if (!checkoutBtn) return;

  if (hasInvalid) {
    checkoutBtn.disabled = true;
    checkoutBtn.classList.add("cursor-not-allowed");
  } else {
    checkoutBtn.disabled = false;
    checkoutBtn.classList.remove("cursor-not-allowed");
  }
}

document.querySelectorAll(".cart-item").forEach(item => {
  updateQtyButtonsState(item);
});

updateCheckoutState();

});