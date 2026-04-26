document.addEventListener("DOMContentLoaded", () => {

  const retryPaymentBtn = document.getElementById("retryPaymentBtn");

  if (!retryPaymentBtn) return;

  retryPaymentBtn.addEventListener("click", async () => {

    const orderId = retryPaymentBtn.dataset.orderId;

    if (!orderId) {
      showToast("Invalid order");
      return;
    }

    const originalText = retryPaymentBtn.innerText;

    try {

      retryPaymentBtn.disabled = true;
      retryPaymentBtn.innerText = "Processing...";

      const res = await fetch("/orders/retry-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ orderId })
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Unable to retry payment");
        retryPaymentBtn.disabled = false;
        retryPaymentBtn.innerText = originalText;
        return;
      }

      openRazorpayCheckout(data);

    } catch (error) {

      console.error(error);
      showToast("Something went wrong");

      retryPaymentBtn.disabled = false;
      retryPaymentBtn.innerText = originalText;
    }

  });


  function openRazorpayCheckout(data) {

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "BooksKart",
      description: "Retry Payment",
      order_id: data.razorpayOrderId,

      handler: async function (response) {

        try {

          const verifyRes = await fetch("/orders/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              orderId: data.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok) {
            showToast(verifyData.message || "Payment verification failed");

            window.location.href =
              `/order/failed?orderId=${data.orderId}`;

            return;
          }

          window.location.href =
            `/order/success?orderId=${data.orderId}`;

        } catch (error) {

          showToast("Payment verification failed");

          window.location.href =
            `/order/failed?orderId=${data.orderId}`;
        }
      },

      modal: {
        ondismiss: async function () {

          try {
            await fetch("/orders/payment-failed", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                orderId: data.orderId
              })
            });
          } catch (error) {
            console.error(error);
          }

          window.location.href =
            `/order/failed?orderId=${data.orderId}`;
        }
      },

      theme: {
        color: "#121212"
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }

});