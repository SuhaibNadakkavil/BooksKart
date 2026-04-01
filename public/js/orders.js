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

});