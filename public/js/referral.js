document.addEventListener(
  "DOMContentLoaded",
  () => {

    const copyBtn =
      document.getElementById(
        "copyReferralBtn"
      );

    const shareBtn =
      document.getElementById(
        "shareReferralBtn"
      );

    const codeText =
      document.getElementById(
        "referralCodeText"
      );

    if (!codeText) return;

    const referralCode =
      codeText.innerText.trim();

    const shareLink =
      `${window.location.origin}/signup?ref=${referralCode}`;


    // =========================
    // COPY CODE
    // =========================
    if (copyBtn) {
      copyBtn.addEventListener(
        "click",
        async () => {
          try {

            await navigator.clipboard.writeText(
              referralCode
            );

            copyBtn.innerText =
              "Copied";

            showToast(
              "Code copied", "success"
            );

            setTimeout(() => {
              copyBtn.innerText =
                "Copy";
            }, 1500);

          } catch (err) {

            showToast(
              "Unable to copy code"
            );

          }
        }
      );
    }


    // =========================
    // SHARE LINK
    // =========================
    if (shareBtn) {
      shareBtn.addEventListener(
        "click",
        async () => {

          const text =
`Join BooksKart using my referral code ${referralCode} and earn rewards.
${shareLink}`;

          try {

            if (
              navigator.share
            ) {
              await navigator.share({
                title:
                  "Join BooksKart",
                text,
                url: shareLink
              });

              return;
            }

            await navigator.clipboard.writeText(
              text
            );

            showToast(
              "Invite link copied", "success"
            );

          } catch (err) {
            console.error(err);
          }

        }
      );
    }


    // Sidebar Logic
  const toggleBtn = document.getElementById("sidebarToggle");
  const mobileSidebar = document.getElementById("mobileSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const panel = document.getElementById("sidebarPanel");
  const closeBtn = document.getElementById("closeSidebar");

  if (toggleBtn) {

    function openSidebar() {
      mobileSidebar.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");

      setTimeout(() => {
        overlay.classList.remove("opacity-0");
        panel.classList.remove("-translate-x-full");
      }, 10);
    }

    function closeSidebar() {
      overlay.classList.add("opacity-0");
      panel.classList.add("-translate-x-full");

      setTimeout(() => {
        mobileSidebar.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
      }, 300);
    }

    toggleBtn.addEventListener("click", openSidebar);
    closeBtn.addEventListener("click", closeSidebar);
    overlay.addEventListener("click", closeSidebar);
  }

  // Logout Confirmation
  document.querySelectorAll(".logoutBtn").forEach((btn) => {
    btn.addEventListener("click", function () {

      const form = this.closest("form");

      Swal.fire({
        title: "Logout Confirmation",
        text: "Are you sure you want to logout?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Logout",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#121212",
        cancelButtonColor: "#999",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          form.submit();
        }
      });

    });
  });

  }
);