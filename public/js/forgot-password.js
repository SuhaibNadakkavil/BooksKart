document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("forgotForm");
  if (!form) return;

  const emailInput = document.getElementById("email");
  const submitBtn = document.getElementById("submitBtn");

  function setError(id, message) {
    const el = document.getElementById(id);
    if (el) el.innerText = message;
  }

  function validateEmail() {
    const value = emailInput.value.trim();

    if (!value) return "Email is required";

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!emailRegex.test(value))
      return "Enter a valid email address";

    return "";
  }

  // Blur validation
  emailInput.addEventListener("blur", () => {
    setError("emailError", validateEmail());
  });

  // Submit validation
  form.addEventListener("submit", (e) => {
    const emailError = validateEmail();

    setError("emailError", emailError);

    if (emailError) {
      e.preventDefault();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Sending...";
  });

});