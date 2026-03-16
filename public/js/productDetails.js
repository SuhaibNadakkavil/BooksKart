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




const variantButtons = document.querySelectorAll(".variant-btn");

const salePriceEl = document.getElementById("salePrice");
const regularPriceEl = document.getElementById("regularPrice");
const cartButton = document.getElementById("cartButton");

const firstEnabled = [...variantButtons].find(btn => !btn.disabled);
firstEnabled?.classList.add("bg-black","text-white");

variantButtons.forEach(btn => {

    if (btn.disabled) return;

  btn.addEventListener("click", () => {

    const price = btn.dataset.price;
    const sale = btn.dataset.sale;
    const stock = parseInt(btn.dataset.stock);

    /* PRICE UPDATE */

    if (sale && sale !== price) {

      if (salePriceEl) salePriceEl.textContent = `₹${sale}`;

      if (regularPriceEl) {
        regularPriceEl.textContent = `₹${price}`;
        regularPriceEl.classList.add("line-through","opacity-50");
      }

    } else {

      if (regularPriceEl) {
        regularPriceEl.textContent = `₹${price}`;
        regularPriceEl.classList.remove("line-through","opacity-50");
      }

      if (salePriceEl) salePriceEl.textContent = "";

    }

    /* CART BUTTON UPDATE */

    if (stock > 0) {

      cartButton.textContent = "ADD TO CART";
      cartButton.classList.remove("bg-red-500","cursor-not-allowed");
      cartButton.classList.add("bg-black");

    } else {

      cartButton.textContent = "OUT OF STOCK";
      cartButton.classList.remove("bg-black");
      cartButton.classList.add("bg-red-500","cursor-not-allowed");

    }

    /* ACTIVE BUTTON STYLE */

    variantButtons.forEach(v => v.classList.remove("bg-black","text-white"));
    btn.classList.add("bg-black","text-white");

  });

});

});