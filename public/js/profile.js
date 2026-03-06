document.addEventListener("DOMContentLoaded", () => {

  // Sidebar Logic
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
    closeBtn.addEventListener("click", closeSidebar);
    overlay.addEventListener("click", closeSidebar);
  }

  // Logout Confirmation
  document.querySelectorAll(".logoutBtn").forEach((btn) => {
    btn.addEventListener("click", function () {

      const form = this.closest("form");

      Swal.fire({
        title: "Logout Confirmation",
        text: "Are you sure you want to logout?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Logout",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#121212",
        cancelButtonColor: "#999",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          form.submit();
        }
      });

    });
  });

  document.querySelectorAll(".deleteAddressBtn").forEach(btn => {

    btn.addEventListener("click", async function () {

      const id = this.dataset.id;

      const result = await Swal.fire({
        title: "Delete Address?",
        text: "This address will be removed from your profile.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#121212",
        cancelButtonColor: "#999"
      });

      if (!result.isConfirmed) return;

      try {

        const res = await fetch(`/profile/address/delete/${id}`, {
          method: "DELETE"
        });

        const data = await res.json();

        if (data.success) {

          await Swal.fire({
            icon: "success",
            title: "Deleted",
            text: data.message,
            confirmButtonColor: "#121212"
          });

          location.reload();

        } else {

          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.message
          });

        }

      } catch (error) {

        Swal.fire({
          icon: "error",
          title: "Something went wrong"
        });

      }

    });

  });

});