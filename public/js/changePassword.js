document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("changePasswordForm");
  if (!form) return;

  const currentInput = document.getElementById("currentPassword");
  const newInput = document.getElementById("newPassword");
  const confirmInput = document.getElementById("confirmPassword");
  const submitBtn = document.getElementById("submitBtn");

  function setError(id, message) {
    const el = document.getElementById(id);
    if (el) el.innerText = message;
  }

  function validateCurrent() {
    const value = currentInput.value.trim();
    if (!value) return "Current password is required";
    return "";
  }

  function validateNew() {
    const value = newInput.value.trim();
    if (!value) return "New password is required";

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(value))
      return "Minimum 8 chars, include upper, lower & number";

    return "";
  }

  function validateConfirm() {
    const value = confirmInput.value.trim();
    if (!value) return "Please confirm your new password";
    if (value !== newInput.value.trim())
      return "Passwords do not match";
    return "";
  }

  // Blur validation
  currentInput.addEventListener("blur", () =>
    setError("currentPasswordError", validateCurrent())
  );

  newInput.addEventListener("blur", () =>
    setError("newPasswordError", validateNew())
  );

  confirmInput.addEventListener("blur", () =>
    setError("confirmPasswordError", validateConfirm())
  );

  // Password toggle
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

  // Submit validation
  form.addEventListener("submit", (e) => {
    const currentError = validateCurrent();
    const newError = validateNew();
    const confirmError = validateConfirm();

    setError("currentPasswordError", currentError);
    setError("newPasswordError", newError);
    setError("confirmPasswordError", confirmError);

    if (currentError || newError || confirmError) {
      e.preventDefault();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Saving...";
  });

});