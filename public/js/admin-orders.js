document.addEventListener("DOMContentLoaded", () => {

// =============================
// AUTO SUBMIT FILTER + SORT
// =============================
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