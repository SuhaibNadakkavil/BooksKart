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

        btn.closest(".group").remove();

      } catch (err) {
        console.error(err);
      }

    });

  });

  /* =========================
     MOVE TO CART
  ========================= */

  cartButtons.forEach(btn => {

    btn.addEventListener("click", async () => {

      const productId = btn.dataset.product;
      const variantType = btn.dataset.variant;

      try {

        const res = await fetch("/wishlist/move-to-cart", {
          method: "POST",
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

        // remove from UI
        btn.closest(".group").remove();

      } catch (err) {
        console.error(err);
      }

    });

  });

});