document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".otp-input");
  const combinedOtp = document.getElementById("combinedOtp");
  const resendBtn = document.getElementById("resendBtn");
  const timerElement = document.getElementById("timer");
  const emailInput = document.querySelector("input[name='email']");
  const email = emailInput ? emailInput.value : null;

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
  let timeLeft = 59;

  function startTimer() {
    resendBtn.disabled = true;
    resendBtn.classList.add("opacity-50", "cursor-not-allowed");

    countdown = setInterval(() => {
      timeLeft--;
      timerElement.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(countdown);
        resendBtn.disabled = false;
        resendBtn.classList.remove("opacity-50", "cursor-not-allowed");
        resendBtn.innerHTML = `
          Resend Code
          <span class="absolute left-0 -bottom-1 w-0 h-[1px] bg-blue-700 transition-all duration-300 group-hover:w-full"></span>
        `;
      }
    }, 1000);
  }

  startTimer();

  /* ---------- RESEND LOGIC ---------- */

  resendBtn.addEventListener("click", async () => {
    if (resendBtn.disabled || !email) return;

    resendBtn.disabled = true;
    resendBtn.textContent = "Sending...";

    try {
      const response = await fetch("/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message, "success");

        // Restart timer AFTER success
        timeLeft = 59;
        timerElement.textContent = timeLeft;
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