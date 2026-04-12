document.addEventListener("DOMContentLoaded", () => {

  // =============================
  // HELPERS
  // =============================
  const getOrderId = () => {
    const path = window.location.pathname;
    return path.split("/").pop();
  };

  const confirmAction = async (message) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
      reverseButtons: true
    });

    return result.isConfirmed;
  };


  // =============================
  // ORDER STATUS UPDATE
  // =============================
  const statusDropdown = document.getElementById("orderStatus");

  if (statusDropdown) {

    statusDropdown.addEventListener("change", async (e) => {

      const newStatus = e.target.value;
      const orderId = getOrderId();

      const confirmed = await confirmAction(
        `Change status to "${newStatus.replace(/_/g, " ")}"?`
      );

      if (!confirmed) {
        location.reload(); // revert UI
        return;
      }

      try {

        statusDropdown.disabled = true;

        const res = await fetch(`/admin/orders/${orderId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: newStatus })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to update status");
        }

        showToast(data.message, "success");
        location.reload();

      } catch (err) {
        showToast(err.message, "error");
        location.reload();
      } finally {
        statusDropdown.disabled = false;
      }

    });

  }


  // =============================
  // APPROVE RETURN
  // =============================
  document.querySelectorAll(".approveReturnBtn").forEach(btn => {

    btn.addEventListener("click", async () => {

      const orderId = getOrderId();
      const itemId = btn.dataset.id;

      const confirmed = await confirmAction("Approve this return request?");

      if (!confirmed) return;

      try {

        btn.disabled = true;

        const res = await fetch(`/admin/orders/${orderId}/items/${itemId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: "returned",
            reason: "Approved by admin"
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to approve return");
        }

        showToast(data.message, "success");
        location.reload();

      } catch (err) {
        showToast(err.message, "error");
        btn.disabled = false;
      }

    });

  });


  // =============================
  // REJECT RETURN
  // =============================
  document.querySelectorAll(".rejectReturnBtn").forEach(btn => {

    btn.addEventListener("click", async () => {

      const orderId = getOrderId();
      const itemId = btn.dataset.id;

      const confirmed = await confirmAction("Reject this return request?");

      if (!confirmed) return;

      try {

        btn.disabled = true;

        const res = await fetch(`/admin/orders/${orderId}/items/${itemId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: "delivered",
            reason: "Rejected by admin"
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to reject return");
        }

        showToast(data.message, "success");
        location.reload();

      } catch (err) {
        showToast(err.message, "error");
        btn.disabled = false;
      }

    });

  });

});