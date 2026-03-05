document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("addAddressForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");

  const name = document.getElementById("name");
  const street = document.getElementById("street");
  const city = document.getElementById("city");
  const state = document.getElementById("state");
  const pincode = document.getElementById("pincode");
  const phone = document.getElementById("phone");

  function setError(id, message) {
    document.getElementById(id).innerText = message;
  }

  function validateName() {
    if (!name.value.trim()) return "Name is required";
    return "";
  }

  function validateStreet() {
    if (!street.value.trim()) return "Address is required";
    return "";
  }

  function validateCity() {
    if (!city.value.trim()) return "City is required";
    return "";
  }

  function validateState() {
    if (!state.value.trim()) return "State is required";
    return "";
  }

  function validatePincode() {
    const value = pincode.value.trim();

    if (!value) return "Pincode is required";

    if (!/^[0-9]{5,6}$/.test(value))
      return "Enter valid pincode";

    return "";
  }

  function validatePhone() {
    const value = phone.value.trim();

    if (!value) return "Phone number is required";

    if (!/^[6-9]\d{9}$/.test(value))
      return "Enter valid phone number";

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

  const inputs = [name, street, city, state, pincode, phone];

  inputs.forEach(input => {
    input.addEventListener("input", () => {
      validateForm();
    });
  });

  form.addEventListener("submit", (e) => {

    if (!validateForm()) {
      e.preventDefault();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Saving...";
  });

});