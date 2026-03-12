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
                    title: "Unlist this product?",
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

});