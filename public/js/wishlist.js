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

      btn.closest(".group").remove();

      updateCartCount()

    } catch (err) {
      console.error(err);
    }

  });

});
});