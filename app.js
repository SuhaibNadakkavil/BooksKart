import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";

import helmet from "helmet";
import compression from "compression";
import passport from "./config/passport.js";

import errorMiddleware from "./middlewares/error.middleware.js";
import userRoutes from "./routes/user/index.js";
import adminRoutes from './routes/admin/index.js'

import sessionConfig from "./middlewares/session.middleware.js";
import { globalLimiter } from "./middlewares/rateLimit.middleware.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "layouts/userLayouts");

app.use(express.static(path.join(__dirname, "./public")));
app.use("/uploads", express.static("public/uploads"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// No Cache 
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// Session
sessionConfig(app);

// Passport.js(Google Oauth)
app.use(passport.initialize());
app.use(passport.session());

// Global Rate Limiting
app.use(globalLimiter);

// Routes
app.use("/", userRoutes);
app.use('/admin', adminRoutes)

// 404 Handler
app.use((req, res, next) => {
  const error = new Error("Page Not Found");
  error.statusCode = 404;
  next(error);
});

// Global Error Handler
app.use(errorMiddleware);

export default app;