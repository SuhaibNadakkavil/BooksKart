document.addEventListener("DOMContentLoaded", () => {

    // =============================
  // SIDEBAR (MOBILE)
  // =============================
  const toggleBtn = document.getElementById("sidebarToggle");
  const mobileSidebar = document.getElementById("mobileSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const panel = document.getElementById("sidebarPanel");
  const closeBtn = document.getElementById("closeSidebar");

  if (toggleBtn) {

    function openSidebar() {
      mobileSidebar.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");

      setTimeout(() => {
        overlay.classList.remove("opacity-0");
        panel.classList.remove("-translate-x-full");
      }, 10);
    }

    function closeSidebar() {
      overlay.classList.add("opacity-0");
      panel.classList.add("-translate-x-full");

      setTimeout(() => {
        mobileSidebar.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
      }, 300);
    }

    toggleBtn.addEventListener("click", openSidebar);
    closeBtn?.addEventListener("click", closeSidebar);
    overlay?.addEventListener("click", closeSidebar);
  }


  const statusFilter = document.getElementById("statusFilter");
  const sortSelect = document.getElementById("sortSelect");

  if (statusFilter) {
    statusFilter.addEventListener("change", () => {
      statusFilter.form.submit();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      sortSelect.form.submit();
    });
  }

  const addMoneyBtn = document.getElementById("addMoneyBtn");
  const walletModal = document.getElementById("walletModal");
  const closeWalletModal = document.getElementById("closeWalletModal");
  const cancelWalletBtn = document.getElementById("cancelWalletBtn");

  const amountInput = document.getElementById("walletAmount");
  const proceedBtn = document.getElementById("proceedWalletPaymentBtn");

  const quickAmountBtns = document.querySelectorAll(".quickWalletAmount");

  if (!addMoneyBtn) return;

  // ===============================
  // OPEN MODAL
  // ===============================
  addMoneyBtn.addEventListener("click", () => {
    walletModal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    amountInput.focus();
  });


  // ===============================
  // CLOSE MODAL
  // ===============================
  function closeModal() {
    walletModal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");

    amountInput.value = "";
    proceedBtn.disabled = false;
    proceedBtn.innerText = "Proceed to Pay";
  }

  closeWalletModal?.addEventListener("click", closeModal);
  cancelWalletBtn?.addEventListener("click", closeModal);

  walletModal?.addEventListener("click", (e) => {
    if (e.target === walletModal) {
      closeModal();
    }
  });


  // ===============================
  // QUICK SELECT BUTTONS
  // ===============================
  quickAmountBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      amountInput.value = btn.dataset.amount;
    });
  });


  // ===============================
  // PROCEED PAYMENT
  // ===============================
  proceedBtn?.addEventListener("click", async () => {

    const amount = Number(amountInput.value);

    if (!amount || amount < 1) {
      showToast("Enter valid amount");
      return;
    }

    try {

      proceedBtn.disabled = true;
      proceedBtn.innerText = "Processing...";

      const res = await fetch("/wallet/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ amount })
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Unable to continue");
        proceedBtn.disabled = false;
        proceedBtn.innerText = "Proceed to Pay";
        return;
      }

      openWalletRazorpay(data);

    } catch (error) {
      console.error(error);

      showToast("Something went wrong");

      proceedBtn.disabled = false;
      proceedBtn.innerText = "Proceed to Pay";
    }

  });


  // ===============================
  // RAZORPAY
  // ===============================
  function openWalletRazorpay(data) {

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,

      name: "BooksKart",
      description: "Wallet Top-up",

      order_id: data.razorpayOrderId,

      handler: async function (response) {

        try {

          const verifyRes = await fetch("/wallet/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              walletAmount: data.walletAmount,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok) {
            showToast(verifyData.message || "Payment failed");
            return;
          }

          showToast("Money added successfully", "success");

          setTimeout(() => {
            window.location.reload();
          }, 900);

        } catch (error) {
          showToast("Payment verification failed");
        }
      },

      modal: {
        ondismiss: function () {
          showToast("Payment cancelled");
          proceedBtn.disabled = false;
          proceedBtn.innerText = "Proceed to Pay";
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