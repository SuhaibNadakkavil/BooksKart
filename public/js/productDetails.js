document.addEventListener("DOMContentLoaded", () => {

// Image Swap

const thumbnails = document.querySelectorAll(".thumbnail")
const mainImage = document.getElementById("mainImage")

thumbnails[0]?.classList.add("border-black");

thumbnails.forEach((img)=>{

  img.addEventListener("click",()=>{

    mainImage.src = img.src;

    thumbnails.forEach(t => t.classList.remove("border-black"));
    img.classList.add("border-black");

  });

});



// Zoom Effect

const container = document.getElementById("imageContainer");

container.addEventListener("mousemove",(e)=>{

const rect = container.getBoundingClientRect();

const x = ((e.clientX - rect.left) / rect.width) * 100;
const y = ((e.clientY - rect.top) / rect.height) * 100;

mainImage.style.transformOrigin = `${x}% ${y}%`;
mainImage.style.transform = "scale(1.8)";

});

container.addEventListener("mouseleave",()=>{
mainImage.style.transform = "scale(1)";
});




// Tabs

const descTab = document.getElementById("descTab")
const reviewTab = document.getElementById("reviewTab")

const descContent = document.getElementById("descContent")
const reviewContent = document.getElementById("reviewContent")

descTab.addEventListener("click",()=>{

descContent.classList.remove("hidden")
reviewContent.classList.add("hidden")

descTab.classList.add("font-medium")
reviewTab.classList.remove("font-medium")

})

reviewTab.addEventListener("click",()=>{

reviewContent.classList.remove("hidden")
descContent.classList.add("hidden")

reviewTab.classList.add("font-medium")
descTab.classList.remove("font-medium")

})


  /* =========================
     ELEMENTS
  ========================= */

  const variantButtons = document.querySelectorAll(".variant-btn");
  const salePriceEl = document.getElementById("salePrice");
  const regularPriceEl = document.getElementById("regularPrice");
  const cartButton = document.getElementById("cartButton");
  const wishlistBtn = document.getElementById("wishlistBtn");

  if (!variantButtons.length) return;

  /* =========================
     DEFAULT VARIANT
  ========================= */

  let selectedVariant =
    document.querySelector(".variant-btn.bg-black")?.dataset.type;

  const firstEnabled = [...variantButtons].find(btn => !btn.disabled);

  if (!selectedVariant && firstEnabled) {
    selectedVariant = firstEnabled.dataset.type;
    firstEnabled.classList.add("bg-black", "text-white");
  }

  /* =========================
     WISHLIST STATE UPDATE
  ========================= */

  const updateWishlistState = async () => {

    if (!wishlistBtn) return;

    const productId = wishlistBtn.dataset.product;

    if (!productId || !selectedVariant) return;

    try {

      const res = await fetch(`/wishlist/check/${productId}/${selectedVariant}`);
      const data = await res.json();

      const icon = wishlistBtn.querySelector(".wishlistIcon");

      if (!icon) return;

      if (data.exists) {
        icon.setAttribute("fill", "currentColor");
      } else {
        icon.setAttribute("fill", "none");
      }

    } catch (err) {
      console.error(err);
    }

  };

  /* =========================
     VARIANT CLICK
  ========================= */

  variantButtons.forEach(btn => {

    if (btn.disabled) return;

    btn.addEventListener("click", async () => {

      selectedVariant = btn.dataset.type;

      const price = btn.dataset.price;
      const sale = btn.dataset.sale;
      const stock = parseInt(btn.dataset.stock);

      /* PRICE UPDATE */

      if (sale && sale !== price) {

        if (salePriceEl) salePriceEl.textContent = `₹${sale}`;

        if (regularPriceEl) {
          regularPriceEl.textContent = `₹${price}`;
          regularPriceEl.classList.add("line-through", "opacity-50");
        }

      } else {

        if (regularPriceEl) {
          regularPriceEl.textContent = `₹${price}`;
          regularPriceEl.classList.remove("line-through", "opacity-50");
        }

        if (salePriceEl) salePriceEl.textContent = "";

      }

      /* CART BUTTON UPDATE */

      if (stock > 0) {

        cartButton.textContent = "ADD TO CART";
        cartButton.classList.remove("bg-red-500", "cursor-not-allowed");
        cartButton.classList.add("bg-black");

      } else {

        cartButton.textContent = "OUT OF STOCK";
        cartButton.classList.remove("bg-black");
        cartButton.classList.add("bg-red-500", "cursor-not-allowed");

      }

      /* ACTIVE STYLE */

      variantButtons.forEach(v =>
        v.classList.remove("bg-black", "text-white")
      );

      btn.classList.add("bg-black", "text-white");

      /* UPDATE WISHLIST STATE */

      await updateWishlistState();

    });

  });

  /* =========================
     WISHLIST CLICK
  ========================= */

  if (wishlistBtn) {

    wishlistBtn.addEventListener("click", async () => {

      const productId = wishlistBtn.dataset.product;

      if (!productId || !selectedVariant) return;

      try {

        const res = await fetch("/wishlist/toggle", {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            productId,
            variantType: selectedVariant
          })

        });

        const data = await res.json();

        if (!data.success) {
          showToast(data.message, "error");
          return;
        }

        showToast(data.message, "success");

        const icon = wishlistBtn.querySelector(".wishlistIcon");

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

  }

  /* =========================
     INITIAL LOAD
  ========================= */

  updateWishlistState();

});