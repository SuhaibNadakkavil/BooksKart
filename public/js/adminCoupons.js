document.addEventListener("DOMContentLoaded", () => {

  // =====================================
  // ELEMENTS
  // =====================================
  const modal = document.getElementById("couponModal");
  const openBtn = document.getElementById("openCouponModalBtn");
  const closeBtn = document.getElementById("closeCouponModalBtn");
  const cancelBtn = document.getElementById("cancelCouponBtn");

  const form = document.getElementById("couponForm");
  const modalTitle =
    document.getElementById("couponModalTitle");

  const couponId =
    document.getElementById("couponId");

  const name =
    document.getElementById("name");

  const code =
    document.getElementById("code");

  const discountPercent =
    document.getElementById("discountPercent");

  const minCartValue =
    document.getElementById("minCartValue");

  const maxDiscountAmount =
    document.getElementById("maxDiscountAmount");

  const maxUsageCount =
    document.getElementById("maxUsageCount");

  const expiryDate =
    document.getElementById("expiryDate");


  if (!modal || !form) return;


  // =====================================
  // MODAL HELPERS
  // =====================================
  function openModal() {
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }

  function closeModal() {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    resetForm();
  }

  function resetForm() {
    form.reset();
    couponId.value = "";
    modalTitle.innerText = "Add Coupon";
  }


  // =====================================
  // OPEN ADD MODAL
  // =====================================
  openBtn?.addEventListener("click", () => {
    resetForm();
    openModal();
  });


  // =====================================
  // CLOSE MODAL
  // =====================================
  closeBtn?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });


  // =====================================
  // INPUT HELPERS
  // =====================================
  code.addEventListener("input", () => {
    code.value = code.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  });


  // =====================================
  // VALIDATION
  // =====================================
  function validateForm() {

    const couponName = name.value.trim();
    const couponCode = code.value.trim();

    const discount =
      Number(discountPercent.value);

    const minCart =
      Number(minCartValue.value);

    const maxDiscount =
      maxDiscountAmount.value.trim();

    const maxUsage =
      maxUsageCount.value.trim();

    const expiry =
      expiryDate.value;

    if (!couponName) {
      showToast("Coupon name required");
      return false;
    }

    if (couponName.length < 2) {
      showToast("Coupon name too short");
      return false;
    }

    if (!couponCode) {
      showToast("Coupon code required");
      return false;
    }

    if (couponCode.length < 3) {
      showToast("Coupon code too short");
      return false;
    }

    if (!discount || discount < 1 || discount > 90) {
      showToast(
        "Discount must be between 1 and 90"
      );
      return false;
    }

    if (minCart < 0) {
      showToast(
        "Minimum cart value invalid"
      );
      return false;
    }

    if (
      maxDiscount &&
      Number(maxDiscount) < 0
    ) {
      showToast(
        "Max discount invalid"
      );
      return false;
    }

    if (
      maxUsage &&
      Number(maxUsage) < 0
    ) {
      showToast(
        "Max usage invalid"
      );
      return false;
    }

    if (!expiry) {
      showToast("Expiry date required");
      return false;
    }

    const selectedDate =
      new Date(expiry);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      showToast(
        "Expiry must be future date"
      );
      return false;
    }

    return true;
  }


  // =====================================
  // SUBMIT FORM
  // =====================================
  form.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      if (!validateForm()) return;

      const id = couponId.value.trim();

      const payload = {
        name: name.value.trim(),
        code: code.value.trim(),
        discountPercent: Number(discountPercent.value),
        minCartValue: Number(minCartValue.value),
        maxDiscountAmount: maxDiscountAmount.value
          ? Number(maxDiscountAmount.value)
          : 0,
        maxUsageCount: maxUsageCount.value
          ? Number(maxUsageCount.value)
          : 0,
        expiryDate: expiryDate.value
      };

      const isEdit = !!id;

      const url = isEdit
        ? `/admin/coupons/${id}`
        : "/admin/coupons";

      const method = isEdit
        ? "PUT"
        : "POST";

      try {

        const submitBtn =
          form.querySelector(
            'button[type="submit"]'
          );

        submitBtn.disabled = true;
        submitBtn.innerText =
          "Saving...";

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        submitBtn.disabled = false;
        submitBtn.innerText =
          "Save Coupon";

        if (!res.ok) {
          showToast(data.message);
          return;
        }

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message,
          confirmButtonColor:
            "#121212"
        });

        location.reload();

      } catch (error) {

        Swal.fire({
          icon: "error",
          title: "Something went wrong"
        });

      }

    }
  );


  // =====================================
  // EDIT BUTTON
  // =====================================
  document
    .querySelectorAll(".editCouponBtn")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        function () {

          couponId.value =
            this.dataset.id;

          name.value =
            this.dataset.name;

          code.value =
            this.dataset.code;

          discountPercent.value =
            this.dataset.discount;

          minCartValue.value =
            this.dataset.min;

          maxDiscountAmount.value =
            this.dataset.maxdiscount === 0
              ? 0
              : this.dataset.maxdiscount;

          maxUsageCount.value =
            this.dataset.maxusage === 0
              ? 0
              : this.dataset.maxusage;

          expiryDate.value =
            this.dataset.expiry;

          modalTitle.innerText =
            "Edit Coupon";

          openModal();

        }
      );

    });


  // =====================================
  // TOGGLE STATUS
  // =====================================
  document
    .querySelectorAll(".toggleCouponBtn")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        async function () {

          const id =
            this.dataset.id;

          try {

            const res =
              await fetch(
                `/admin/coupons/${id}/toggle`,
                {
                  method: "PATCH"
                }
              );

            const data =
              await res.json();

            if (!res.ok) {
              showToast(
                data.message
              );
              return;
            }

            location.reload();

          } catch (error) {

            showToast(
              "Something went wrong"
            );

          }

        }
      );

    });


  // =====================================
  // DELETE
  // =====================================
  document
    .querySelectorAll(".deleteCouponBtn")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        async function () {

          const id =
            this.dataset.id;

          const result =
            await Swal.fire({
              title:
                "Delete Coupon?",
              text:
                "Coupon will be removed.",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText:
                "Yes, Delete",
              cancelButtonText:
                "Cancel",
              confirmButtonColor:
                "#121212",
              cancelButtonColor:
                "#999"
            });

          if (!result.isConfirmed)
            return;

          try {

            const res =
              await fetch(
                `/admin/coupons/${id}`,
                {
                  method: "DELETE"
                }
              );

            const data =
              await res.json();

            if (!res.ok) {
              Swal.fire({
                icon: "error",
                title: "Error",
                text:
                  data.message
              });
              return;
            }

            await Swal.fire({
              icon: "success",
              title: "Deleted",
              text:
                data.message,
              confirmButtonColor:
                "#121212"
            });

            location.reload();

          } catch (error) {

            Swal.fire({
              icon: "error",
              title:
                "Something went wrong"
            });

          }

        }
      );

    });

});