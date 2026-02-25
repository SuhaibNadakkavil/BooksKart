document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("setPasswordForm");
  if (!form) return;

  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const submitBtn = document.getElementById("submitBtn");

  /* ----------------------------
     Utility
  ---------------------------- */

  function setError(id, message) {
    const el = document.getElementById(id);
    if (el) el.innerText = message;
  }

  function clearError(id) {
    setError(id, "");
  }

  /* ----------------------------
     Validation Rules
  ---------------------------- */

  function validatePassword() {
    const value = passwordInput.value.trim();

    if (!value) return "Password is required";

    if (value.length < 8)
      return "Password must be at least 8 characters";

    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/;

    if (!strongRegex.test(value))
      return "Must include uppercase, lowercase, number & special character";

    return "";
  }

  function validateConfirmPassword() {
    const value = confirmPasswordInput.value.trim();

    if (!value) return "Confirm password is required";

    if (value !== passwordInput.value.trim())
      return "Passwords do not match";

    return "";
  }

  /* ----------------------------
     Real-time Validation
  ---------------------------- */

  passwordInput.addEventListener("blur", () => {
    setError("passwordError", validatePassword());
  });

  confirmPasswordInput.addEventListener("blur", () => {
    setError("confirmPasswordError", validateConfirmPassword());
  });

  /* ----------------------------
     Toggle Password Visibility
  ---------------------------- */

  document.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-toggle");
      const input = document.getElementById(id);

      if (input) {
        input.type =
          input.type === "password" ? "text" : "password";
      }
    });
  });

  /* ----------------------------
     Submit Validation
  ---------------------------- */

  form.addEventListener("submit", (e) => {

    let isValid = true;

    const passwordError = validatePassword();
    const confirmError = validateConfirmPassword();

    setError("passwordError", passwordError);
    setError("confirmPasswordError", confirmError);

    if (passwordError || confirmError) {
      isValid = false;
    }

    if (!isValid) {
      e.preventDefault();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Saving...";
  });

});