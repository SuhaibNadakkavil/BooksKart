document.addEventListener("DOMContentLoaded", () => {

  const overlay = document.getElementById("modalOverlay");

  const orderId = document
    .getElementById("orderMeta")
    ?.dataset.orderId;

  function openModal(modal) {
    overlay.classList.remove("hidden");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  function closeAllModals() {
    document.querySelectorAll("[id$='Modal']").forEach(m => {
      m.classList.add("hidden");
      m.classList.remove("flex");
    });
    overlay.classList.add("hidden");
  }

  document.querySelectorAll(".closeModal").forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });

  overlay.addEventListener("click", closeAllModals);

  // ================= OPEN MODALS =================
  document.addEventListener("click", (e) => {

  // CANCEL ITEM
  if (e.target.closest(".cancelItemBtn")) {
    const btn = e.target.closest(".cancelItemBtn");
    const modal = document.getElementById("cancelItemModal");

    modal.dataset.itemId = btn.dataset.id;
    openModal(modal);
  }

  // RETURN ITEM
  if (e.target.closest(".returnItemBtn")) {
    const btn = e.target.closest(".returnItemBtn");
    const modal = document.getElementById("returnItemModal");

    modal.dataset.itemId = btn.dataset.id;
    openModal(modal);
  }

});

  document.getElementById("cancelOrderBtn")?.addEventListener("click", () => {
    openModal(document.getElementById("cancelOrderModal"));
  });

  document.getElementById("returnOrderBtn")?.addEventListener("click", () => {
    openModal(document.getElementById("returnOrderModal"));
  });

  // ================= API =================
  async function sendRequest(url, payload) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Error", "error");
      return false;
    }

    return true;
  }

  // ================= CANCEL ITEM =================
  document.getElementById("confirmCancelItem")?.addEventListener("click", async () => {

    const modal = document.getElementById("cancelItemModal");
    const itemId = modal.dataset.itemId;

    const reason = document.getElementById("cancelItemReason").value;

    const confirm = await Swal.fire({
      title: "Cancel this item?",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    const success = await sendRequest("/orders/item/cancel", {
      orderId,
      itemId,
      reason
    });

    if (success) {
      showToast("Item cancelled", "success");
      location.reload();
    }

  });

  // ================= RETURN ITEM =================
  document.getElementById("confirmReturnItem")?.addEventListener("click", async () => {

    const modal = document.getElementById("returnItemModal");
    const itemId = modal.dataset.itemId;

    const reason = document.getElementById("returnItemReason").value;
    const errorEl = document.getElementById("returnItemError");

    if (!reason) {
      errorEl.innerText = "Please select a reason";
      return;
    }

    const confirm = await Swal.fire({
      title: "Return this item?",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    const success = await sendRequest("/orders/item/return", {
      orderId,
      itemId,
      reason
    });

    if (success) {
      showToast("Item return requested", "success");
      location.reload();
    }

  });

  // ================= CANCEL ORDER =================
  document.getElementById("confirmCancelOrder")?.addEventListener("click", async () => {

    const reason = document.getElementById("cancelOrderReason").value;

    const confirm = await Swal.fire({
      title: "Cancel entire order?",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    const success = await sendRequest("/orders/cancel", {
      orderId,
      reason // optional
    });

    if (success) {
      showToast("Order cancelled", "success");
      location.reload();
    }

  });

  // ================= RETURN ORDER =================
  document.getElementById("confirmReturnOrder")?.addEventListener("click", async () => {

    const reason = document.getElementById("returnOrderReason").value;
    const errorEl = document.getElementById("returnOrderError");

    if (!reason) {
      errorEl.innerText = "Please select a reason";
      return;
    }

    const confirm = await Swal.fire({
      title: "Return entire order?",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    const success = await sendRequest("/orders/return", {
      orderId,
      reason
    });

    if (success) {
      showToast("Order return requested", "success");
      location.reload();
    }

  });

});