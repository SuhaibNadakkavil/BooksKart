import XLSX from "xlsx";
import { getSalesReportService } from "./sales.service.js";
import { getBrowser } from "../../utils/puppeteer.js";

// =====================================
// EXPORT PDF
// =====================================
export const exportSalesPDFService = async ({ from, to }) => {

  const data = await getSalesReportService({
    from,
    to,
    page: 1,
    limit: 1000 // export all (adjust if needed)
  });

  const html = generatePDFHtml(data);

  const browser = await getBrowser()

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true
  });

  await browser.close();

  return pdf;
};


// =====================================
// EXPORT EXCEL
// =====================================
export const exportSalesExcelService = async ({ from, to }) => {

  const data = await getSalesReportService({
    from,
    to,
    page: 1,
    limit: 1000
  });

  const rows = data.tableData.map(o => ({
    OrderID: o.orderId,
    Date: new Date(o.date).toLocaleDateString(),
    PaymentMethod: o.paymentMethod,
    Status: o.status,
    Gross: o.gross,
    Discount: o.discount,
    Refund: o.refund,
    Net: o.net
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

  return XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx"
  });
};


// =====================================
// HTML TEMPLATE FOR PDF
// =====================================
const generatePDFHtml = (data) => {

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial; padding: 20px; }
          h1 { font-size: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body>

        <h1>Sales Report</h1>

        <p>Total Orders: ${data.summary.totalOrders}</p>
        <p>Gross Revenue: ₹${data.summary.grossRevenue}</p>
        <p>Discount: ₹${data.summary.totalDiscount}</p>
        <p>Refund: ₹${data.summary.totalRefund}</p>
        <p>Net Revenue: ₹${data.summary.netRevenue}</p>

        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Method</th>
              <th>Status</th>
              <th>Gross</th>
              <th>Discount</th>
              <th>Refund</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>

            ${data.tableData.map(o => `
              <tr>
                <td>${o.orderId}</td>
                <td>${new Date(o.date).toLocaleDateString()}</td>
                <td>${o.paymentMethod}</td>
                <td>${o.status}</td>
                <td>${o.gross}</td>
                <td>${o.discount}</td>
                <td>${o.refund}</td>
                <td>${o.net}</td>
              </tr>
            `).join("")}

          </tbody>
        </table>

      </body>
    </html>
  `;
};