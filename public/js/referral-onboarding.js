document.addEventListener(
  "DOMContentLoaded",
  () => {

    const form =
      document.getElementById(
        "referralForm"
      );

    const skipBtn =
      document.getElementById(
        "skipBtn"
      );

    const referralInput =
      document.getElementById(
        "referralCode"
      );

    const submitBtn =
      document.getElementById(
        "submitBtn"
      );

    function setError(message) {

      const errorEl =
        document.getElementById(
          "referralError"
        );

      if (errorEl) {
        errorEl.innerText = message;
      }
    }

    function validateReferral() {

      const value =
        referralInput.value.trim();

      // optional field
      if (!value) return "";

      if (value.length < 4) {
        return "Invalid referral code";
      }

      return "";
    }

    referralInput.addEventListener(
      "blur",
      () => {
        setError(
          validateReferral()
        );
      }
    );

    skipBtn.addEventListener(
      "click",
      () => {

        referralInput.value = "";

        form.submit();
      }
    );

    form.addEventListener(
      "submit",
      (e) => {

        const error =
          validateReferral();

        setError(error);

        if (error) {
          e.preventDefault();
          return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText =
          "Processing...";
      }
    );
  }
);