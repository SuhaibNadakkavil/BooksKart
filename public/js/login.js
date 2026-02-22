document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // -----------------------------
  // Utility: Set Error Message
  // -----------------------------
  function setError(id, message) {
    const el = document.getElementById(id);
    if (el) el.innerText = message;
  }

  function clearError(id) {
    setError(id, "");
  }

  // -----------------------------
  // Validation Functions
  // -----------------------------

  function validateEmail() {
    const value = emailInput.value.trim();

    if (!value) return "Email is required";

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!emailRegex.test(value))
      return "Enter a valid email address";

    return "";
  }

  function validatePassword() {
    const value = passwordInput.value.trim();

    if (!value) return "Password is required";

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(value))
      return "Min 8 chars, Must include upper, lower, number & special character";

    return "";
  }

  // -----------------------------
  // Real-time Validation (Blur)
  // -----------------------------

  emailInput.addEventListener("blur", () => {
    setError("emailError", validateEmail());
  });

  passwordInput.addEventListener("blur", () => {
    setError("passwordError", validatePassword());
  });

  // -----------------------------
  // Password Toggle (Reusable Pattern)
  // -----------------------------
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

  // -----------------------------
  // Final Submit Validation
  // -----------------------------
  form.addEventListener("submit", (e) => {
    let isValid = true;

    const emailError = validateEmail();
    const passwordError = validatePassword();

    setError("emailError", emailError);
    setError("passwordError", passwordError);

    if (emailError || passwordError) {
      isValid = false;
    }

    if (!isValid) {
      e.preventDefault();
      return;
    }

    // Disable button during request
    submitBtn.disabled = true;
    submitBtn.innerText = "Logging in...";
  });
});