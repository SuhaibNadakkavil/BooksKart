document.addEventListener("DOMContentLoaded", () => {

  const editBtn = document.getElementById("editPhotoBtn");
  const fileInput = document.getElementById("profileImageInput");
  const previewImg = document.getElementById("imagePreview");
  const previewText = document.getElementById("imagePreviewText");

  if (!editBtn) return;

  editBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
      previewImg.src = event.target.result;
      previewImg.classList.remove("hidden");

      if (previewText) {
        previewText.classList.add("hidden");
      }
    };

    reader.readAsDataURL(file);
  });


  const form = document.querySelector("form");
  if (!form) return;

  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");

  function setError(id, message) {
    const el = document.getElementById(id);
    if (el) el.innerText = message;
  }

  function validateName() {
    const value = nameInput.value.trim();

    if (!value) return "Name is required";
    if (value.length < 2) return "Name must be at least 2 characters";
    if (value.length > 50) return "Name must not exceed 50 characters";

    const nameRegex = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;
    if (!nameRegex.test(value)) return "Enter a valid name";

    return "";
  }

  function validatePhone() {
    const value = phoneInput.value.trim();
    if (!value) return "";

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(value))
      return "Enter a valid 10-digit phone number";

    return "";
  }

  nameInput.addEventListener("blur", () => {
    setError("nameError", validateName());
  });

  phoneInput.addEventListener("blur", () => {
    setError("phoneError", validatePhone());
  });

  form.addEventListener("submit", (e) => {
    const nameError = validateName();
    const phoneError = validatePhone();

    setError("nameError", nameError);
    setError("phoneError", phoneError);

    if (nameError || phoneError) {
      e.preventDefault();
    }
  });

});