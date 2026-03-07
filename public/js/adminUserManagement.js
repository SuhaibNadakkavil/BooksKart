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
      }).then((result) => {

        if(result.isConfirmed){
          window.location.href = `/admin/users/block/${id}`;
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
      }).then((result) => {

        if(result.isConfirmed){
          window.location.href = `/admin/users/unblock/${id}`;
        }

      });

    });

  });

});