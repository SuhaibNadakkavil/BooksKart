import puppeteer from "puppeteer";

export const getBrowser = async () => {
  return await puppeteer.launch({
    headless: "new",
    executablePath: process.env.NODE_ENV === "production"
      ? "/usr/bin/chromium-browser"
      : undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  });
};