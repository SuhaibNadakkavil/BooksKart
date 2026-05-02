import HTTP_STATUS from "../../utils/httpStatus.js";
import { getDashboardDataService } from "../../services/admin/dashboard.service.js";


// =====================================
// LOAD DASHBOARD PAGE
// =====================================
export const loadDashboardPage = async (req, res, next) => {
  try {

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    // ==============================
    // FILTER (monthly default)
    // ==============================
    const filter = req.query.filter || "monthly";

    const data = await getDashboardDataService({
      filter
    });

    return res.status(HTTP_STATUS.OK).render(
      "admin/dashboard",
      {
        title: "Dashboard | BooksKart",
        activePage: "dashboard",

        success,
        error,

        filter,

        metrics: data.metrics,
        chartData: data.chartData,
        topProducts: data.topProducts,
        topCategories: data.topCategories,

        pageScript: "/js/adminDashboard.js"
      }
    );

  } catch (err) {
    next(err);
  }
};