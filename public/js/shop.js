document.addEventListener("DOMContentLoaded", async () => {

  const wishlistButtons = document.querySelectorAll(".wishlistBtn");

  /* =========================
     INITIAL LOAD (SET STATE)
  ========================= */

  for (const btn of wishlistButtons) {

    const productId = btn.dataset.product;
    const variantType = btn.dataset.variant;

    if (!productId || !variantType) continue;

    try {

      const res = await fetch(`/wishlist/check/${productId}/${variantType}`);
      const data = await res.json();

      const icon = btn.querySelector(".wishlistIcon");

      if (data.exists && icon) {
        icon.setAttribute("fill", "currentColor");
      }

    } catch (err) {
      console.error(err);
    }

  }

  /* =========================
     CLICK HANDLER
  ========================= */

  wishlistButtons.forEach(btn => {

    btn.addEventListener("click", async () => {

      const productId = btn.dataset.product;
      const variantType = btn.dataset.variant;

      if (!productId || !variantType) return;

      try {

        const res = await fetch("/wishlist/toggle", {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            productId,
            variantType
          })

        });

        const data = await res.json();

        if (!data.success) {
          showToast(data.message, "error");
          return;
        }

        /* SUCCESS MESSAGE */
        showToast(data.message, "success");

        /* HEART TOGGLE */
        const icon = btn.querySelector(".wishlistIcon");

        if (!icon) return;

        if (data.action === "added") {
          icon.setAttribute("fill", "currentColor");
        } else {
          icon.setAttribute("fill", "none");
        }

      } catch (err) {
        console.error(err);
      }

    });

  });

  /* =========================
   ADD TO CART
========================= */

  const cartButtons = document.querySelectorAll(".addCartBtn");

  cartButtons.forEach(btn => {

    btn.addEventListener("click", async () => {

      const productId = btn.dataset.product;
      const variantType = btn.dataset.variant?.toLowerCase();

      if (!productId || !variantType) return;

      try {

        const res = await fetch("/cart/add", {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            productId,
            variantType
          })

        });

        const data = await res.json();

        if (!data.success) {
          showToast(data.message, "error");
          return;
        }

        /* 🔥 DYNAMIC MESSAGE */
        showToast(data.message, "success");

        /* 🔥 OPTIONAL: update wishlist icon */
        const wishlistBtn = document.querySelector(
          `.wishlistBtn[data-product="${productId}"][data-variant="${variantType}"]`
        );

        if (wishlistBtn) {
          const icon = wishlistBtn.querySelector(".wishlistIcon");
          if (icon) icon.setAttribute("fill", "none");
        }

        updateCartCount();

      } catch (err) {
        console.error(err);
      }

    });

  });

});