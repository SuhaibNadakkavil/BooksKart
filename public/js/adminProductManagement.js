document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
    FILTER + SORT
    ================================ */

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

const overlay = document.getElementById("productModalOverlay");

const addProductOfferModal = document.getElementById("addProductOfferModal");
const editProductOfferModal = document.getElementById("editProductOfferModal");

function openModal(modal){

  overlay.classList.remove("hidden");
  modal.classList.remove("hidden");

}

function closeModals(){

  overlay.classList.add("hidden");
  addProductOfferModal?.classList.add("hidden");
  editProductOfferModal?.classList.add("hidden");

}

overlay?.addEventListener("click", closeModals);

document.querySelectorAll(".closeProductModal").forEach(btn=>{
  btn.addEventListener("click", closeModals);
});

/* =========================================================
OPEN ADD PRODUCT OFFER MODAL
========================================================= */

const addProductOfferBtns = document.querySelectorAll(".addProductOfferBtn");

addProductOfferBtns.forEach(btn => {

  btn.addEventListener("click", () => {

    const productId = btn.dataset.id;

    document.getElementById("addProductOfferProductId").value = productId;

    openModal(addProductOfferModal);

  });

});

/* =========================================================
OPEN EDIT PRODUCT OFFER MODAL
========================================================= */


const editProductOfferBtns = document.querySelectorAll(".editProductOfferBtn");

editProductOfferBtns.forEach(btn => {

  btn.addEventListener("click", () => {

    const productId = btn.dataset.id;
    const type = btn.dataset.type;
    const value = btn.dataset.value;
    const expiry = btn.dataset.expiry;

    document.getElementById("editProductOfferProductId").value = productId;
    document.getElementById("editProductOfferType").value = type;
    document.getElementById("editProductOfferValue").value = value;
    document.getElementById("editProductOfferExpiry").value = expiry;

    openModal(editProductOfferModal);

  });

});

/* =========================================================
ADD PRODUCT OFFER VALIDATION
========================================================= */

const addProductOfferForm = document.getElementById("addProductOfferForm");

addProductOfferForm?.addEventListener("submit", async(e)=>{

  e.preventDefault();

  const type = addProductOfferForm.type.value;
  const value = addProductOfferForm.value.value;
  const expiry = addProductOfferForm.expiry.value;

  const typeError = document.getElementById("addProductOfferTypeError");
  const valueError = document.getElementById("addProductOfferValueError");
  const expiryError = document.getElementById("addProductOfferExpiryError");

  let valid = true;

  typeError.classList.add("hidden");
  valueError.classList.add("hidden");
  expiryError.classList.add("hidden");

  if(!type){
    typeError.innerText="Offer type required";
    typeError.classList.remove("hidden");
    valid=false;
  }

  if(!value || value<=0){
    valueError.innerText="Enter valid offer value";
    valueError.classList.remove("hidden");
    valid=false;
  }

  if(!expiry){
    expiryError.innerText="Expiry date required";
    expiryError.classList.remove("hidden");
    valid=false;
  }

  if(!valid) return;

  const formData = new FormData(addProductOfferForm);
    const productId = formData.get("productId");

    formData.delete("productId");

    const res = await fetch(`/admin/products/${productId}/offer`, {
    method: "POST",
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
EDIT PRODUCT OFFER VALIDATION
========================================================= */

const editProductOfferForm = document.getElementById("editProductOfferForm");

editProductOfferForm?.addEventListener("submit", async (e) => {

  e.preventDefault();

  const type = editProductOfferForm.type.value;
  const value = editProductOfferForm.value.value;
  const expiry = editProductOfferForm.expiry.value;

  const typeError = document.getElementById("editProductOfferTypeError");
  const valueError = document.getElementById("editProductOfferValueError");
  const expiryError = document.getElementById("editProductOfferExpiryError");

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

  const formData = new FormData(editProductOfferForm);

  const productId = formData.get("productId");

  formData.delete("productId");

  const res = await fetch(`/admin/products/${productId}/offer`, {
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

    /* ===============================
    ACTIVATE PRODUCT
    ================================ */

    document.querySelectorAll(".activateProductBtn")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                const id = btn.dataset.id;

                Swal.fire({
                    title: "Activate this product?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Activate"
                }).then(result => {

                    if (result.isConfirmed) {

                        fetch(`/admin/products/${id}/activate`, {
                            method: "PATCH"
                        })
                            .then(res => res.json())
                            .then(data => {

                                if (data.success) {
                                    showToast(data.message, "success")
                                    setTimeout(() => location.reload(), 700)
                                } else {
                                    showToast(data.message, "error")
                                }

                            })

                    }

                })

            })

        })



    /* ===============================
    DEACTIVATE PRODUCT
    ================================ */

    document.querySelectorAll(".deactivateProductBtn")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                const id = btn.dataset.id;

                Swal.fire({
                    title: "Deactivate this product?",
                    text: "Product will not appear in store",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Unlist"
                }).then(result => {

                    if (result.isConfirmed) {

                        fetch(`/admin/products/${id}/deactivate`, {
                            method: "PATCH"
                        })
                            .then(res => res.json())
                            .then(data => {

                                if (data.success) {
                                    showToast(data.message, "success")
                                    setTimeout(() => location.reload(), 700)
                                } else {
                                    showToast(data.message, "error")
                                }

                            })

                    }

                })

            })

        })


        /* =========================================================
DELETE PRODUCT OFFER
========================================================= */

const deleteProductOfferBtns = document.querySelectorAll(".deleteProductOfferBtn");

deleteProductOfferBtns.forEach(btn => {

  btn.addEventListener("click", () => {

    const productId = btn.dataset.id;

    Swal.fire({
      title: "Delete this offer?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete"
    }).then(async (result) => {

      if (result.isConfirmed) {

        const res = await fetch(`/admin/products/${productId}/offer`, {
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

});

