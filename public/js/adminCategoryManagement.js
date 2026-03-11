document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
  FILTER + SORT
  ========================================================= */

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



  /* =========================================================
  MODAL CONTROLS
  ========================================================= */

  const overlay = document.getElementById("categoryModalOverlay");

  const addCategoryModal = document.getElementById("addCategoryModal");
  const editCategoryModal = document.getElementById("editCategoryModal");
  const addOfferModal = document.getElementById("addOfferModal");
  const editOfferModal = document.getElementById("editOfferModal");

  const openAddCategoryBtn = document.getElementById("openAddCategoryModal");



  function openModal(modal) {
    overlay.classList.remove("hidden");
    modal.classList.remove("hidden");
  }

  function closeModals() {
    overlay.classList.add("hidden");

    addCategoryModal?.classList.add("hidden");
    editCategoryModal?.classList.add("hidden");
    addOfferModal?.classList.add("hidden");
    editOfferModal?.classList.add("hidden");
  }

  overlay?.addEventListener("click", closeModals);

  document.querySelectorAll(".closeCategoryModal").forEach(btn => {
    btn.addEventListener("click", closeModals);
  });



  /* =========================================================
  OPEN ADD CATEGORY MODAL
  ========================================================= */

  openAddCategoryBtn?.addEventListener("click", () => {
    openModal(addCategoryModal);
  });



  /* =========================================================
  OPEN EDIT CATEGORY MODAL
  ========================================================= */

  const editCategoryBtns = document.querySelectorAll(".editCategoryBtn");

    editCategoryBtns.forEach(btn => {

    btn.addEventListener("click", () => {

        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const description = btn.dataset.description;
        const status = btn.dataset.status;

        const form = document.getElementById("editCategoryForm");

        form.action = `/admin/categories/${id}`;

        document.getElementById("editCategoryName").value = name;
        document.getElementById("editCategoryDescription").value = description;

        const toggle = document.getElementById("editCategoryStatus");
        toggle.checked = status === "true";

        openModal(editCategoryModal);

    });

 });


  /* =========================================================
  OPEN ADD OFFER MODAL
  ========================================================= */

  const addOfferBtns = document.querySelectorAll(".addOfferBtn");

  addOfferBtns.forEach(btn => {

    btn.addEventListener("click", () => {

      const id = btn.dataset.id;

      document.getElementById("addOfferCategoryId").value = id;

      openModal(addOfferModal);

    });

  });


/* =========================================================
OPEN EDIT OFFER MODAL
========================================================= */

const editOfferBtns = document.querySelectorAll(".editOfferBtn");

editOfferBtns.forEach(btn => {

  btn.addEventListener("click", () => {

    const categoryId = btn.dataset.id;
    const type = btn.dataset.type;
    const value = btn.dataset.value;
    const expiry = btn.dataset.expiry;

    document.getElementById("editOfferCategoryId").value = categoryId;
    document.getElementById("editOfferType").value = type;
    document.getElementById("editOfferValue").value = value;
    document.getElementById("editOfferExpiry").value = expiry;

    openModal(editOfferModal);

  });

});


  /* =========================================================
  ADD CATEGORY VALIDATION
  ========================================================= */

const addCategoryForm = document.getElementById("addCategoryForm");

 addCategoryForm?.addEventListener("submit", async (e) => {

  e.preventDefault();

  const name = addCategoryForm.name.value.trim();
  const description = addCategoryForm.description.value.trim();

  const nameError = document.getElementById("addCategoryNameError");
  const descriptionError = document.getElementById("addCategoryDescriptionError");

  let valid = true;

  nameError.classList.add("hidden");
  descriptionError.classList.add("hidden");

  if (!name) {
    nameError.innerText = "Category name is required";
    nameError.classList.remove("hidden");
    valid = false;
  }

  if (!description) {
    descriptionError.innerText = "Description is required";
    descriptionError.classList.remove("hidden");
    valid = false;
  }

  if (!valid) return;

  const formData = new FormData(addCategoryForm);

  const res = await fetch(addCategoryForm.action, {
    method: "POST",
    body: new URLSearchParams(formData)
  });

  const data = await res.json();

  if (data.success) {

    // success shown on main page
    location.reload();

  } else {

    nameError.innerText = data.message;
    nameError.classList.remove("hidden");

  }

});



  /* =========================================================
  EDIT CATEGORY VALIDATION
  ========================================================= */

  const editCategoryForm = document.getElementById("editCategoryForm");

  editCategoryForm?.addEventListener("submit", async (e) => {

  e.preventDefault();

  const name = editCategoryForm.name.value.trim();
  const description = editCategoryForm.description.value.trim();

  const nameError = document.getElementById("editCategoryNameError");
  const descriptionError = document.getElementById("editCategoryDescriptionError");

  let valid = true;

  nameError.classList.add("hidden");
  descriptionError.classList.add("hidden");

  if (!name) {
    nameError.innerText = "Category name is required";
    nameError.classList.remove("hidden");
    valid = false;
  }

  if (!description) {
    descriptionError.innerText = "Description is required";
    descriptionError.classList.remove("hidden");
    valid = false;
  }

  if (!valid) return;

  const formData = new FormData(editCategoryForm);

  const res = await fetch(editCategoryForm.action, {
    method: "POST",
    body: new URLSearchParams(formData)
  });

  const data = await res.json();

  if (data.success) {

      location.reload();

  } else {

    nameError.innerText = data.message;
    nameError.classList.remove("hidden");

  }

});




  /* =========================================================
  ADD OFFER VALIDATION
  ========================================================= */

  const addOfferForm = document.getElementById("addOfferForm");

  addOfferForm?.addEventListener("submit", async (e) => {

  e.preventDefault();

    const type = addOfferForm.type.value;
    const value = addOfferForm.value.value;
    const expiry = addOfferForm.expiry.value;

    const typeError = document.getElementById("addOfferTypeError");
    const valueError = document.getElementById("addOfferValueError");
    const expiryError = document.getElementById("addOfferExpiryError");

    let valid = true;

    typeError.classList.add("hidden");
    valueError.classList.add("hidden");
    expiryError.classList.add("hidden");

    if (!type) {
      typeError.innerText = "Offer type required";
      typeError.classList.remove("hidden");
      valid = false;
    }

    if (!value || value <= 0) {
      valueError.innerText = "Enter valid offer value";
      valueError.classList.remove("hidden");
      valid = false;
    }

    if (!expiry) {
      expiryError.innerText = "Expiry date required";
      expiryError.classList.remove("hidden");
      valid = false;
    }

    if (!valid) return

    const formData = new FormData(addOfferForm);
    const categoryId = formData.get("categoryId");

    formData.delete("categoryId");

    const res = await fetch(`/admin/categories/${categoryId}/offer`, {
    method: "POST",
    body: new URLSearchParams(formData)
    });

    const data = await res.json();

    if (data.success) {

        location.reload();

    } else {

        const errorElement = document.getElementById("addOfferTypeError");

        errorElement.innerText = data.message;
        errorElement.classList.remove("hidden");

    }

  });



/* =========================================================
EDIT OFFER VALIDATION
========================================================= */

const editOfferForm = document.getElementById("editOfferForm");

editOfferForm?.addEventListener("submit", async (e) => {

  e.preventDefault();

  const type = editOfferForm.type.value;
  const value = editOfferForm.value.value;
  const expiry = editOfferForm.expiry.value;

  const typeError = document.getElementById("editOfferTypeError");
  const valueError = document.getElementById("editOfferValueError");
  const expiryError = document.getElementById("editOfferExpiryError");

  let valid = true;

  typeError.classList.add("hidden");
  valueError.classList.add("hidden");
  expiryError.classList.add("hidden");

  if (!type) {
    typeError.innerText = "Offer type required";
    typeError.classList.remove("hidden");
    valid = false;
  }

  if (!value || value <= 0) {
    valueError.innerText = "Enter valid offer value";
    valueError.classList.remove("hidden");
    valid = false;
  }

  if (!expiry) {
    expiryError.innerText = "Expiry date required";
    expiryError.classList.remove("hidden");
    valid = false;
  }

  if (!valid) return;

  const formData = new FormData(editOfferForm);

  const categoryId = formData.get("categoryId");

  formData.delete("categoryId");

  const res = await fetch(`/admin/categories/${categoryId}/offer`, {
    method: "PATCH",
    body: new URLSearchParams(formData)
  });

  const data = await res.json();

  if (data.success) {

    location.reload();

  } else {

    typeError.innerText = data.message;
    typeError.classList.remove("hidden");

  }

});



  /* =========================================================
  ACTIVATE CATEGORY
  ========================================================= */

  const activateBtns = document.querySelectorAll(".activateCategoryBtn");

  activateBtns.forEach(btn => {

    btn.addEventListener("click", () => {

      const id = btn.dataset.id;

      Swal.fire({
        title: "Activate this category?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Activate"
      }).then(async (result) => {

        if (result.isConfirmed) {

          const res = await fetch(`/admin/categories/${id}/activate`, {
            method: "PATCH"
          });

          const data = await res.json();

          if (data.success) {

            showToast(data.message, "success");

            setTimeout(() => {
              location.reload();
            }, 700);

          } else {
            showToast(data.message, "error");
          }

        }

      });

    });

  });



  /* =========================================================
  DEACTIVATE CATEGORY
  ========================================================= */

  const deactivateBtns = document.querySelectorAll(".deactivateCategoryBtn");

  deactivateBtns.forEach(btn => {

    btn.addEventListener("click", () => {

      const id = btn.dataset.id;

      Swal.fire({
        title: "Deactivate this category?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Deactivate"
      }).then(async (result) => {

        if (result.isConfirmed) {

          const res = await fetch(`/admin/categories/${id}/deactivate`, {
            method: "PATCH"
          });

          const data = await res.json();

          if (data.success) {

            showToast(data.message, "success");

            setTimeout(() => {
              location.reload();
            }, 700);

          } else {
            showToast(data.message, "error");
          }

        }

      });

    });

  });

});


/* =========================================================
DELETE OFFER
========================================================= */

const deleteOfferBtns = document.querySelectorAll(".deleteOfferBtn");

deleteOfferBtns.forEach(btn => {

  btn.addEventListener("click", () => {

    const categoryId = btn.dataset.id;

    Swal.fire({
      title: "Delete this offer?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete"
    }).then(async (result) => {

      if (result.isConfirmed) {

        const res = await fetch(`/admin/categories/${categoryId}/offer`, {
          method: "DELETE"
        });

        const data = await res.json();

        if (data.success) {

          showToast(data.message, "success");

          setTimeout(() => {
            location.reload();
          }, 700);

        } else {

          showToast(data.message, "error");

        }

      }

    });

  });

});