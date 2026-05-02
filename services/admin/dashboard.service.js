import * as dashboardRepo from "../../repositories/user/dashboard.repository.js";


// =====================================
// FORMAT CHART LABELS
// =====================================
const formatChartData = (raw, filter) => {

  let labels = [];
  let values = [];

  for (const item of raw) {

    let label;

    if (filter === "yearly") {
      label = item._id.toString();
    } else if (filter === "weekly") {
      label = `W${item._id}`;
    } else {
      // monthly
      const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
      ];
      label = months[item._id - 1];
    }

    labels.push(label);
    values.push(item.total);
  }

  return { labels, values };
};


// =====================================
// MAIN DASHBOARD SERVICE
// =====================================
export const getDashboardDataService = async ({
  filter = "monthly"
}) => {

  const [
    metrics,
    chartRaw,
    topProducts,
    topCategories
  ] = await Promise.all([

    dashboardRepo.getDashboardMetrics(),

    dashboardRepo.getRevenueChartData({ filter }),

    dashboardRepo.getTopSellingProducts(),

    dashboardRepo.getTopSellingCategories()
  ]);

  const chartData = formatChartData(chartRaw, filter);

  return {
    metrics,
    chartData,
    topProducts,
    topCategories
  };
};