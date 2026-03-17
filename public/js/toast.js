document.addEventListener("DOMContentLoaded", () => {

  const successMessage = document.body.dataset.success;
  const errorMessage = document.body.dataset.error;

  if (successMessage) {
    showToast(successMessage, "success");
  }

  if (errorMessage) {
    showToast(errorMessage, "error");
  }

});

function showToast(message, type) {
  Toastify({
    text: message,
    duration: 2000,
    gravity: "top",
    position: "center",
    stopOnFocus: true,
    style: {
      background: type === "success"
        ? "#16a34a"
        : "#dc2626",
      borderRadius: "8px",
      fontWeight: "500",
      padding: "12px 16px"
    }
  }).showToast();
}