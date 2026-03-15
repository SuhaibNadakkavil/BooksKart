document.addEventListener("DOMContentLoaded", () => {

const cartButtons = document.querySelectorAll(".addCartBtn");
const wishlistButtons = document.querySelectorAll(".wishlistBtn");

cartButtons.forEach(btn => {

btn.addEventListener("click", () => {

const productId = btn.dataset.product;

console.log("Add to cart:", productId);

});

});

wishlistButtons.forEach(btn => {

btn.addEventListener("click", () => {

const productId = btn.dataset.product;

console.log("Wishlist toggle:", productId);

});

});

});