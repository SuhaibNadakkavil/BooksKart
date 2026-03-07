document.addEventListener("DOMContentLoaded", () => {

  const menuBtn = document.getElementById("adminMenuBtn");
  const sidebar = document.getElementById("adminSidebar");
  const overlay = document.getElementById("adminSidebarOverlay");
  const panel = document.getElementById("adminSidebarPanel");
  const closeBtn = document.getElementById("closeAdminSidebar");

  if (!menuBtn || !sidebar) return;

  function openSidebar() {
    sidebar.classList.remove("hidden");

    setTimeout(() => {
      overlay.classList.remove("opacity-0");
      panel.classList.remove("-translate-x-full");
    }, 10);
  }

  function closeSidebar() {
    overlay.classList.add("opacity-0");
    panel.classList.add("-translate-x-full");

    setTimeout(() => {
      sidebar.classList.add("hidden");
    }, 300);
  }

  menuBtn.addEventListener("click", openSidebar);
  closeBtn?.addEventListener("click", closeSidebar);
  overlay?.addEventListener("click", closeSidebar);


  const logoutBtn = document.getElementById("adminLogoutBtn");
  const logoutForm = document.getElementById("adminLogoutForm");

  if (logoutBtn && logoutForm) {

    logoutBtn.addEventListener("click", () => {

      Swal.fire({
        title: "Logout from admin panel?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Logout",
        cancelButtonText: "Cancel"
      }).then((result) => {

        if (result.isConfirmed) {
          logoutForm.submit();
        }

      });

    });

  }

});