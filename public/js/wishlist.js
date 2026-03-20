document.addEventListener("DOMContentLoaded", () => {

  const removeButtons = document.querySelectorAll(".removeWishlistBtn");
  const cartButtons = document.querySelectorAll(".addCartBtn");

  /* =========================
     REMOVE FROM WISHLIST
  ========================= */

  removeButtons.forEach(btn => {

    btn.addEventListener("click", async () => {

      const productId = btn.dataset.product;
      const variantType = btn.dataset.variant;

      try {

        const res = await fetch("/wishlist", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ productId, variantType })
        });

        const data = await res.json();

        if (!data.success) {
          showToast(data.message, "error");
          return;
        }

        showToast(data.message, "success");

        btn.closest(".wishlist-item").remove();

        checkEmptyState()

      } catch (err) {
        console.error(err);
      }

    });

  });

  cartButtons.forEach(btn => {

  btn.addEventListener("click", async () => {

    const productId = btn.dataset.product;
    const variantType = btn.dataset.variant;

    try {

      /* =========================
         ADD TO CART
      ========================= */

      const cartRes = await fetch("/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId, variantType })
      });

      const cartData = await cartRes.json();

      if (!cartData.success) {
        showToast(cartData.message, "error");
        return;
      }

      /* =========================
         REMOVE FROM WISHLIST
      ========================= */

      await fetch("/wishlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId, variantType })
      });

      showToast(cartData.message, "success");

      btn.closest(".wishlist-item").remove();

      updateCartCount()
      checkEmptyState()

    } catch (err) {
      console.error(err);
    }

  });

});

function checkEmptyState() {

  const wishlistContainer = document.getElementById("wishlistContainer");
  const emptyState = document.getElementById("emptyState");

  if (!wishlistContainer || !emptyState) return; // 🔥 prevent crash

  const items = document.querySelectorAll(".wishlist-item");

  if (items.length === 0) {
    wishlistContainer.classList.add("hidden");
    emptyState.classList.remove("hidden");
  }

}

});