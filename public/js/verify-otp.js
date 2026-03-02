document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".otp-input");
  const combinedOtp = document.getElementById("combinedOtp");
  const resendBtn = document.getElementById("resendBtn");
  const timerElement = document.getElementById("timer");
  const emailInput = document.querySelector("input[name='email']");
  const email = emailInput ? emailInput.value : null;

  const mode = resendBtn?.dataset.mode || "signup";
  const storageKey = `otp_expiry_${mode}`;
  const TIMER_DURATION = 60;

  /* ---------- OTP INPUT LOGIC ---------- */

  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value.replace(/\D/g, "");
      input.value = value;

      if (value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }

      updateOtpValue();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

      if (pastedData.length === 6) {
        inputs.forEach((input, i) => {
          input.value = pastedData[i] || "";
        });
        updateOtpValue();
      }
    });
  });

  function updateOtpValue() {
    const otp = Array.from(inputs).map(input => input.value).join("");
    combinedOtp.value = otp;
  }

  /* ---------- TIMER ---------- */

let countdown;

function getRemainingTime() {
  const expiry = Number(localStorage.getItem(storageKey));
  if (!expiry) return 0;

  const remaining = Math.floor((expiry - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

function startTimer() {
  clearInterval(countdown);

  resendBtn.disabled = true;
  resendBtn.classList.add("opacity-50", "cursor-not-allowed");

  countdown = setInterval(() => {
    const timeLeft = getRemainingTime();

    if (timeLeft > 0) {
      resendBtn.innerHTML = `Resend code in ${timeLeft}s`;
    }

    if (timeLeft <= 0) {
      clearInterval(countdown);

      resendBtn.disabled = false;
      resendBtn.classList.remove("opacity-50", "cursor-not-allowed");

      resendBtn.innerHTML = "Resend Code";

      localStorage.removeItem(storageKey); // optional cleanup
    }

  }, 1000);
}

function initializeTimer() {
  let expiry = Number(localStorage.getItem(storageKey));

  // If no expiry exists, create one (first page load)
  if (!expiry) {
    expiry = Date.now() + TIMER_DURATION * 1000;
    localStorage.setItem(storageKey, expiry);
  }

  startTimer();
}

// Initialize on page load
initializeTimer();

  /* ---------- RESEND LOGIC ---------- */

const resendEndpoint =
  mode === "reset"
    ? "/resend-reset-otp"
    : "/resend-otp";

resendBtn.addEventListener("click", async () => {
  if (resendBtn.disabled || !email) return;

  resendBtn.disabled = true;
  resendBtn.textContent = "Sending...";

  try {
    const response = await fetch(resendEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (data.success) {
      showToast(data.message, "success");

      const newExpiry = Date.now() + TIMER_DURATION * 1000;
      localStorage.setItem(storageKey, newExpiry);

      startTimer();
    } else {
      showToast(data.message, "error");
      resendBtn.disabled = false;
    }

  } catch (error) {
    showToast("Something went wrong", "error");
    resendBtn.disabled = false;
  }
});

});

/* ---------- TOAST FUNCTION ---------- */

function showToast(message, type) {
  Toastify({
    text: message,
    duration: 4000,
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