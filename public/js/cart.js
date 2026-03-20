document.addEventListener("DOMContentLoaded", () => {
    
  const increaseBtns = document.querySelectorAll(".qty-increase");
  const decreaseBtns = document.querySelectorAll(".qty-decrease");
  const removeBtns = document.querySelectorAll(".removeCartBtn");

  /* =========================
     UPDATE QUANTITY
  ========================= */

  const updateQuantity = async (btn, quantity) => {

  const productId = btn.dataset.product;
  const variantType = btn.dataset.variant;

  try {

    const res = await fetch("/cart/quantity", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, variantType, quantity })
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message, "error");
      return;
    }

    showToast(data.message, "success");

    /* 🔥 UPDATE UI */

    const item = btn.closest(".cart-item");
    const qtyEl = item.querySelector(".qty-value");

    qtyEl.textContent = quantity;

    updateSummary();

  } catch (err) {
    console.error(err);
  }

};

  increaseBtns.forEach(btn => {

  if (btn.classList.contains("cursor-not-allowed")) return;

  btn.addEventListener("click", () => {

    const item = btn.closest(".cart-item");
    const qtyEl = item.querySelector(".qty-value");

    const quantity = parseInt(qtyEl.textContent) + 1;

    if (quantity > 5) return;

    updateQuantity(btn, quantity);

  });

});


decreaseBtns.forEach(btn => {

  btn.addEventListener("click", () => {

    const item = btn.closest(".cart-item");
    const qtyEl = item.querySelector(".qty-value");

    const quantity = parseInt(qtyEl.textContent) - 1;

    if (quantity < 1) return;

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

});