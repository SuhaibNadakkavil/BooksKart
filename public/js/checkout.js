document.addEventListener("DOMContentLoaded", () => {

  const placeOrderBtn = document.getElementById("placeOrderBtn");

  if (!placeOrderBtn) return;

  placeOrderBtn.addEventListener("click", async() => {

    const selectedAddress = document.querySelector('input[name="selectedAddress"]:checked');
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');

  if (!selectedAddress) {
    showToast("Select address");
    return;
  }

  const payload = {
    addressId: selectedAddress.value,
    paymentMethod: paymentMethod.value
  };

  try {
    const res = await fetch("/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message);
      return;
    }

    if (data.paymentMethod === "cod") {
      window.location.href = `/order/success?orderId=${data.orderId}`;
      return;
    }

    if (data.paymentMethod === "wallet") {
      window.location.href =`/order/success?orderId=${data.orderId}`;
      return;
    }

    if (data.paymentMethod === "razorpay") {
      openRazorpayCheckout(data);
    }

  } catch (err) {
    console.error(err);
    showToast("Something went wrong");
  }

  });

  function openRazorpayCheckout(data) {
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "BooksKart",
      description: "Book Purchase",
      order_id: data.razorpayOrderId,

      modal: {
        ondismiss: async function () {

          await fetch("/orders/payment-failed", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              orderId: data.orderId
            })
          });

          window.location.href = `/order/failed?orderId=${data.orderId}`;
        }
      },

      handler: async function (response) {
        try {
          const verifyRes = await fetch("/orders/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              orderId: data.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok) {
            showToast(verifyData.message);

            window.location.href = `/order/failed?orderId=${data.orderId}`;
            return;
          }

          window.location.href = `/order/success?orderId=${data.orderId}`;

        } catch (error) {
          showToast("Payment verification failed");
        }
      },

      theme: {
        color: "#121212"
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }

    // =============================
  // MODAL HANDLING
  // =============================
  const modal = document.getElementById("addAddressModal");
  const openBtn = document.getElementById("openAddressModal"); // set this id on ADD ADDRESS btn
  const closeBtn = document.getElementById("closeAddressModal");

  if (openBtn) {
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    });
  }

  // close on outside click
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });

  // =============================
  // FORM + VALIDATION
  // =============================
  const form = document.getElementById("addAddressForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitAddressBtn");

  const name = document.getElementById("name");
  const street = document.getElementById("street");
  const city = document.getElementById("city");
  const state = document.getElementById("state");
  const pincode = document.getElementById("pincode");
  const phone = document.getElementById("phone");
  const isDefault = document.getElementById("isDefault");

  function setError(id, message) {
    const el = document.getElementById(id);
    if (el) el.innerText = message || "";
  }

  function validateName() {
    return !name.value.trim() ? "Name is required" : "";
  }

  function validateStreet() {
    return !street.value.trim() ? "Address is required" : "";
  }

  function validateCity() {
    return !city.value.trim() ? "City is required" : "";
  }

  function validateState() {
    return !state.value.trim() ? "State is required" : "";
  }

  function validatePincode() {
    const value = pincode.value.trim();
    if (!value) return "Pincode is required";
    if (!/^[0-9]{5,6}$/.test(value)) return "Enter valid pincode";
    return "";
  }

  function validatePhone() {
    const value = phone.value.trim();
    if (!value) return "Phone number is required";
    if (!/^[6-9]\d{9}$/.test(value)) return "Enter valid phone number";
    return "";
  }

  function validateForm() {

    const errors = {
      name: validateName(),
      street: validateStreet(),
      city: validateCity(),
      state: validateState(),
      pincode: validatePincode(),
      phone: validatePhone()
    };

    setError("nameError", errors.name);
    setError("streetError", errors.street);
    setError("cityError", errors.city);
    setError("stateError", errors.state);
    setError("pincodeError", errors.pincode);
    setError("phoneError", errors.phone);

    return !Object.values(errors).some(e => e);
  }

  [name, street, city, state, pincode, phone].forEach(input => {
    input.addEventListener("input", validateForm);
  });

  // =============================
// AJAX SUBMIT (WITH RELOAD)
// =============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  submitBtn.disabled = true;
  submitBtn.innerText = "Saving...";

  const payload = {
    name: name.value.trim(),
    street: street.value.trim(),
    city: city.value.trim(),
    state: state.value.trim(),
    pincode: pincode.value.trim(),
    phone: phone.value.trim(),
    isDefault: isDefault.checked
  };

  try {
    const res = await fetch("/checkout/address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    // =============================
    // BACKEND VALIDATION ERROR
    // =============================
    if (!res.ok) {

      if (data.errors) {
        setError("nameError", data.errors.name);
        setError("streetError", data.errors.street);
        setError("cityError", data.errors.city);
        setError("stateError", data.errors.state);
        setError("pincodeError", data.errors.pincode);
        setError("phoneError", data.errors.phone);
      }

      showToast(data.message || "Something went wrong", "error");
      return;
    }

    // =============================
    // SUCCESS → RELOAD
    // =============================
    showToast("Address added successfully", "success");

    // small delay for toast visibility (optional but better UX)
    setTimeout(() => {
      window.location.reload();
    }, 800);

  } catch (err) {
    console.error(err);
    showToast("Network error", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "SAVE";
  }
});

});



document.addEventListener("DOMContentLoaded", () => {


  // =============================
  // MODAL
  // =============================
  const modal = document.getElementById("editAddressModal");
  const closeBtn = document.getElementById("closeEditAddressModal");

  const form = document.getElementById("editAddressForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitEditAddressBtn");

  // inputs (match modal ids)
  const name = document.getElementById("edit_name");
  const street = document.getElementById("edit_street");
  const city = document.getElementById("edit_city");
  const state = document.getElementById("edit_state");
  const pincode = document.getElementById("edit_pincode");
  const phone = document.getElementById("edit_phone");
  const isDefault = document.getElementById("edit_isDefault");

  // =============================
  // OPEN MODAL + FILL DATA
  // =============================
  document.querySelectorAll(".editAddressBtn").forEach(btn => {
    btn.addEventListener("click", () => {

      const address = JSON.parse(btn.dataset.address); 
      // 👆 IMPORTANT: you must pass full address JSON in data-address

      form.dataset.id = address._id;

      name.value = address.name || "";
      street.value = address.street || "";
      city.value = address.city || "";
      state.value = address.state || "";
      pincode.value = address.pincode || "";
      phone.value = address.phone || "";
      isDefault.checked = address.isDefault || false;

      modal.classList.remove("hidden");
      modal.classList.add("flex");
    });
  });

  // close modal
  closeBtn?.addEventListener("click", () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  });

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });

  // =============================
  // VALIDATION
  // =============================
  function setError(id, message) {
    const el = document.getElementById(id);
    if (el) el.innerText = message || "";
  }

  function validateName() {
    return !name.value.trim() ? "Name is required" : "";
  }

  function validateStreet() {
    return !street.value.trim() ? "Address is required" : "";
  }

  function validateCity() {
    return !city.value.trim() ? "City is required" : "";
  }

  function validateState() {
    return !state.value.trim() ? "State is required" : "";
  }

  function validatePincode() {
    const value = pincode.value.trim();
    if (!value) return "Pincode is required";
    if (!/^[0-9]{5,6}$/.test(value)) return "Enter valid pincode";
    return "";
  }

  function validatePhone() {
    const value = phone.value.trim();
    if (!value) return "Phone number is required";
    if (!/^[6-9]\d{9}$/.test(value)) return "Enter valid phone number";
    return "";
  }

  function validateForm() {

    const errors = {
      name: validateName(),
      street: validateStreet(),
      city: validateCity(),
      state: validateState(),
      pincode: validatePincode(),
      phone: validatePhone()
    };

    setError("edit_nameError", errors.name);
    setError("edit_streetError", errors.street);
    setError("edit_cityError", errors.city);
    setError("edit_stateError", errors.state);
    setError("edit_pincodeError", errors.pincode);
    setError("edit_phoneError", errors.phone);

    return !Object.values(errors).some(e => e);
  }

  [name, street, city, state, pincode, phone].forEach(input => {
    input.addEventListener("input", validateForm);
  });

  // =============================
  // AJAX SUBMIT + RELOAD
  // =============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    submitBtn.disabled = true;
    submitBtn.innerText = "Updating...";

    const addressId = form.dataset.id;

    const payload = {
      name: name.value.trim(),
      street: street.value.trim(),
      city: city.value.trim(),
      state: state.value.trim(),
      pincode: pincode.value.trim(),
      phone: phone.value.trim(),
      isDefault: isDefault.checked
    };

    try {
      const res = await fetch(`/checkout/address/${addressId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      // backend validation error
      if (!res.ok) {

        if (data.errors) {
          setError("edit_nameError", data.errors.name);
          setError("edit_streetError", data.errors.street);
          setError("edit_cityError", data.errors.city);
          setError("edit_stateError", data.errors.state);
          setError("edit_pincodeError", data.errors.pincode);
          setError("edit_phoneError", data.errors.phone);
        }

        showToast(data.message || "Something went wrong", "error");
        return;
      }

      // success
      showToast("Address updated successfully", "success");

      setTimeout(() => {
        window.location.reload();
      }, 800);

    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = "UPDATE";
    }

  });

});


document.addEventListener(
  "DOMContentLoaded",
  () => {

    // =====================================
// COUPON
// =====================================
const couponInput =
  document.getElementById(
    "couponCodeInput"
  );

const applyBtn =
  document.getElementById(
    "applyCouponBtn"
  );

const removeBtn =
  document.getElementById(
    "removeCouponBtn"
  );

const inputRow =
  document.getElementById(
    "couponInputRow"
  );

const appliedBox =
  document.getElementById(
    "appliedCouponBox"
  );

const appliedCode =
  document.getElementById(
    "appliedCouponCode"
  );

const discountText =
  document.getElementById(
    "discountText"
  );

const totalText =
  document.getElementById(
    "totalText"
  );

const modal =
  document.getElementById(
    "couponModal"
  );

const openModalBtn =
  document.getElementById(
    "openCouponModalBtn"
  );

const closeModalBtn =
  document.getElementById(
    "closeCouponModalBtn"
  );

function renderCoupon(data = {}) {

  const code =
    data.code || "";

  const discount =
    data.discount || 0;

  const total =
    data.total || 0;

  discountText.innerText =
    `₹${discount}`;

  totalText.innerText =
    `₹${total}`;

  if (code) {

    inputRow.classList.add(
      "hidden"
    );

    appliedBox.classList.remove(
      "hidden"
    );

    appliedCode.innerText =
      code;

  } else {

    inputRow.classList.remove(
      "hidden"
    );

    appliedBox.classList.add(
      "hidden"
    );

    couponInput.value = "";
  }
}


// =====================================
// APPLY
// =====================================
async function applyCoupon(code) {

  try {

    const res = await fetch(
      "/checkout/apply-coupon",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          code
        })
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

    renderCoupon(
      data.data
    );

    modal?.classList.add(
      "hidden"
    );

    showToast(
      "Coupon applied", "success"
    );

  } catch {
    showToast(
      "Unable to apply coupon"
    );
  }
}


// =====================================
// REMOVE
// =====================================
async function removeCoupon() {

  try {

    const res = await fetch(
      "/checkout/remove-coupon",
      {
        method: "DELETE"
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

    renderCoupon({
      code: "",
      discount: 0,
      total: data.data.total
    });

    showToast(
      "Coupon removed", "success"
    );

  } catch {
    showToast(
      "Unable to remove coupon"
    );
  }
}


// =====================================
// EVENTS
// =====================================
applyBtn?.addEventListener(
  "click",
  () => {

    const code =
      couponInput.value.trim();

    if (!code) {
      showToast(
        "Enter coupon code"
      );
      return;
    }

    applyCoupon(code);
  }
);

couponInput?.addEventListener(
  "keydown",
  (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyBtn.click();
    }
  }
);

removeBtn?.addEventListener(
  "click",
  removeCoupon
);

openModalBtn?.addEventListener(
  "click",
  () => {
    modal?.classList.remove(
      "hidden"
    );
  }
);

closeModalBtn?.addEventListener(
  "click",
  () => {
    modal?.classList.add(
      "hidden"
    );
  }
);

// Quick Apply Buttons
document
  .querySelectorAll(
    ".couponApplyQuickBtn"
  )
  .forEach(btn => {

    btn.addEventListener(
      "click",
      () => {
        applyCoupon(
          btn.dataset.code
        );
      }
    );

  });

  }
);