import puppeteer from "puppeteer";

export const getBrowser = async () => {
  return await puppeteer.launch({
    headless: "new",
    executablePath: process.env.NODE_ENV === "production"
      ? "/usr/bin/chromium-browser"
      : undefined,
    args: process.env.NODE_ENV === "production"
      ? ["--no-sandbox", "--disable-setuid-sandbox"]
      : []
  });
};