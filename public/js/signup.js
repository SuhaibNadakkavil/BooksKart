document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

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

  function validateName() {
    const value = nameInput.value.trim();

    if (!value) return "Name is required";

    if (value.length < 2 || value.length > 50)
      return "Name must be 2–50 characters";

    const nameRegex = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;

    if (!nameRegex.test(value))
      return "Enter a valid name";

    return "";
  }

  function validateEmail() {
    const value = emailInput.value.trim();

    if (!value) return "Email is required";

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!emailRegex.test(value))
      return "Enter a valid email address";

    return "";
  }

  function validatePhone() {
    const value = phoneInput.value.trim();

    if (!value) return "Phone number is required";

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(value))
      return "Enter a valid 10-digit phone number";

    return "";
  }

  function validatePassword() {
    const value = passwordInput.value;

    if (!value) return "Password is required";

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(value))
      return "Min 8 chars, Must include upper, lower, number & special character";

    return "";
  }

  function validateConfirmPassword() {
    const value = confirmPasswordInput.value;

    if (!value) return "Please confirm your password";

    if (value !== passwordInput.value)
      return "Passwords do not match";

    return "";
  }

  // -----------------------------
  // Real-time Validation (Blur)
  // -----------------------------
  nameInput.addEventListener("blur", () => {
    setError("nameError", validateName());
  });

  emailInput.addEventListener("blur", () => {
    setError("emailError", validateEmail());
  });

  phoneInput.addEventListener("blur", () => {
    setError("phoneError", validatePhone());
  });

  passwordInput.addEventListener("blur", () => {
    setError("passwordError", validatePassword());
  });

  confirmPasswordInput.addEventListener("blur", () => {
    setError("confirmPasswordError", validateConfirmPassword());
  });

  // -----------------------------
  // Password Toggle
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

    const nameError = validateName();
    const emailError = validateEmail();
    const phoneError = validatePhone();
    const passwordError = validatePassword();
    const confirmError = validateConfirmPassword();

    setError("nameError", nameError);
    setError("emailError", emailError);
    setError("phoneError", phoneError);
    setError("passwordError", passwordError);
    setError("confirmPasswordError", confirmError);

    if (
      nameError ||
      emailError ||
      phoneError ||
      passwordError ||
      confirmError
    ) {
      isValid = false;
    }

    if (!isValid) {
      e.preventDefault();
      return;
    }

    // Disable button during request
    submitBtn.disabled = true;
    submitBtn.innerText = "Creating...";
  });
});
