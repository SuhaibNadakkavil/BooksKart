document.addEventListener("DOMContentLoaded", () => {

  const buttons = document.querySelectorAll(".page-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {

      const page = btn.dataset.page;

      const url = new URL(window.location.href);

      url.searchParams.set("page", page);

      window.location.href = url.toString();

    });
  });

});