import HTTP_STATUS from "../../utils/httpStatus.js";
import { getSalesReportService } from "../../services/admin/sales.service.js";
import {
  exportSalesPDFService,
  exportSalesExcelService
} from "../../services/admin/sales.export.service.js";


// =====================================
// LOAD SALES REPORT PAGE
// =====================================
export const loadSalesReportPage = async (req, res, next) => {
  try {

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    // ==============================
    // QUERY PARAMS (FILTERS)
    // ==============================
    const { from, to } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const data = await getSalesReportService({
    from,
    to,
    page,
    limit
    });

    return res.status(HTTP_STATUS.OK).render(
      "admin/sales-report",
      {
        title: "Sales Report | BooksKart",
        activePage: "sales",

        success,
        error,

        filters: {
          from: from || "",
          to: to || ""
        },

        summary: data.summary,
        tableData: data.tableData,
        pagination: data.pagination,

        pageScript: "/js/adminSales.js"
      }
    );

  } catch (err) {
    next(err);
  }
};

// =====================================
// EXPORT PDF
// =====================================
export const exportSalesPDF = async (req, res, next) => {
  try {

    const { from, to } = req.query;

    const pdfBuffer = await exportSalesPDFService({ from, to });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=sales-report.pdf"
    });

    return res.send(pdfBuffer);

  } catch (err) {
    next(err);
  }
};


// =====================================
// EXPORT EXCEL
// =====================================
export const exportSalesExcel = async (req, res, next) => {
  try {

    const { from, to } = req.query;

    const buffer = await exportSalesExcelService({ from, to });

    res.set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        "attachment; filename=sales-report.xlsx"
    });

    return res.send(buffer);

  } catch (err) {
    next(err);
  }
};