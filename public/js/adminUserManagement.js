document.addEventListener("DOMContentLoaded", () => {


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

  const blockBtns = document.querySelectorAll(".blockUserBtn");
  const unblockBtns = document.querySelectorAll(".unblockUserBtn");

  blockBtns.forEach(btn => {

    btn.addEventListener("click", () => {

      const id = btn.dataset.id;

      Swal.fire({
        title: "Block this user?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Block",
      }).then(async (result) => {

        if (result.isConfirmed) {

          const res = await fetch(`/admin/users/${id}/block`, {
            method: "PATCH"
          });

          const data = await res.json();

          if (data.success) {

            showToast(data.message, "success");

            setTimeout(() => {
              location.reload();
            }, 800);

          } else {
            showToast(data.message, "error");
          }

        }

      });

    });

  });


  unblockBtns.forEach(btn => {

    btn.addEventListener("click", () => {

      const id = btn.dataset.id;

      Swal.fire({
        title: "Unblock this user?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Unblock",
      }).then(async (result) => {

        if (result.isConfirmed) {

          const res = await fetch(`/admin/users/${id}/unblock`, {
            method: "PATCH"
          });

          const data = await res.json();

          if (data.success) {

            showToast(data.message, "success");

            setTimeout(() => {
              location.reload();
            }, 800);

          } else {
            showToast(data.message, "error");
          }

        }

      });

    });

  });

});