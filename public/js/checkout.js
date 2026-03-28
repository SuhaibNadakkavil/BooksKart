document.addEventListener("DOMContentLoaded", () => {

  const placeOrderBtn = document.getElementById("placeOrderBtn");

  if (!placeOrderBtn) return;

  placeOrderBtn.addEventListener("click", () => {

    const selectedAddress = document.querySelector('input[name="selectedAddress"]:checked');
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');

    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    const payload = {
      addressId: selectedAddress.value,
      paymentMethod: paymentMethod.value
    };

    // 👉 For now just log (later integrate POST /orders)
    console.log("Order Payload:", payload);

    // Example future:
    // fetch('/orders', { method: 'POST', body: JSON.stringify(payload) })

  });

});