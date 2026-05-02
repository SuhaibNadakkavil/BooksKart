document.addEventListener("DOMContentLoaded", () => {

  const ctx = document.getElementById("revenueChart");

  if (!ctx) return;

  const el = document.getElementById("dashboardData");

    const labels = JSON.parse(el.dataset.labels);
    const values = JSON.parse(el.dataset.values);

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Revenue",
        data: values,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

});