document.addEventListener("DOMContentLoaded", () => {

  const overlay = document.getElementById("modalOverlay");

  let currentItemId = null;

  const orderId = document
  .getElementById("orderMeta")
  ?.dataset.orderId;

  // =============================
  // MODAL CONTROL
  // =============================
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

  // =============================
  // OPEN MODALS
  // =============================
  document.querySelectorAll(".cancelItemBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentItemId = btn.dataset.id;
      openModal(document.getElementById("cancelItemModal"));
    });
  });

  document.querySelectorAll(".returnItemBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentItemId = btn.dataset.id;
      
      openModal(document.getElementById("returnItemModal"));
    });
  });

  document.getElementById("cancelOrderBtn")?.addEventListener("click", () => {
    openModal(document.getElementById("cancelOrderModal"));
  });

  document.getElementById("returnOrderBtn")?.addEventListener("click", () => {
    openModal(document.getElementById("returnOrderModal"));
  });

  // =============================
  // API HELPER
  // =============================
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

  // =============================
  // CANCEL ITEM
  // =============================
  document.getElementById("confirmCancelItem")?.addEventListener("click", async () => {

    const reason = document.getElementById("cancelItemReason").value.trim();
    const errorEl = document.getElementById("cancelItemError");

    if (!reason) {
      errorEl.innerText = "Reason is required";
      return;
    }

    const confirm = await Swal.fire({
      title: "Cancel this item?",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    const success = await sendRequest("/orders/item/cancel", {
      orderId,
      itemId: currentItemId,
      reason
    });

    if (success) {
      showToast("Item cancelled");
      location.reload();
    }

  });

  // =============================
  // RETURN ITEM
  // =============================
  document.getElementById("confirmReturnItem")?.addEventListener("click", async () => {

    const reason = document.getElementById("returnItemReason").value.trim();
    const errorEl = document.getElementById("returnItemError");

    if (!reason) {
      errorEl.innerText = "Reason is required";
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
      itemId: currentItemId,
      reason
    });

    if (success) {
      showToast("Item returned");
      location.reload();
    }

  });

  // =============================
  // CANCEL ORDER
  // =============================
  document.getElementById("confirmCancelOrder")?.addEventListener("click", async () => {

    const reason = document.getElementById("cancelOrderReason").value.trim();
    const errorEl = document.getElementById("cancelOrderError");

    if (!reason) {
      errorEl.innerText = "Reason is required";
      return;
    }

    const confirm = await Swal.fire({
      title: "Cancel entire order?",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    const success = await sendRequest("/orders/cancel", { orderId, reason });

    if (success) {
      showToast("Order cancelled");
      location.reload();
    }

  });

  // =============================
  // RETURN ORDER
  // =============================
  document.getElementById("confirmReturnOrder")?.addEventListener("click", async () => {

    const reason = document.getElementById("returnOrderReason").value.trim();
    const errorEl = document.getElementById("returnOrderError");

    if (!reason) {
      errorEl.innerText = "Reason is required";
      return;
    }

    const confirm = await Swal.fire({
      title: "Return entire order?",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    const success = await sendRequest("/orders/return", { orderId, reason });

    if (success) {
      showToast("Order returned");
      location.reload();
    }

  });

});