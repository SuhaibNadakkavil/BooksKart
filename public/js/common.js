async function updateCartCount() {

  try {

    const res = await fetch("/cart/count");
    const data = await res.json();

    const el = document.getElementById("cartCount");

    if (!el) return;

    if (data.count > 0) {
        if (data.count > 9) {
            el.textContent = "9+"
            el.classList.remove("hidden");
        }else{
            el.textContent = data.count;
            el.classList.remove("hidden");
        }
    } else {
      el.classList.add("hidden");
    }

  } catch (err) {
    console.error("Cart count error:", err);
  }

}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
});