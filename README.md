# BooksKart

A full-stack e-commerce platform for buying and selling books online, built with the MVC architecture on Node.js and Express.

**Live Demo:** [bookskart.online](https://bookskart.online)

---

## Tech Stack

**Backend**
- Node.js, Express.js
- MongoDB, Mongoose
- Redis (session caching)
- Passport.js (Google OAuth)
- Razorpay (payment gateway)
- Nodemailer (email / OTP)
- Cloudinary (image storage)
- Puppeteer (PDF generation)
- Helmet, express-rate-limit, compression

**Frontend**
- EJS templating with express-ejs-layouts
- Tailwind CSS v4
- Chart.js, SweetAlert2, Toastify

**Infrastructure**
- Deployed on AWS EC2 via NGINX
- Environment-based config with dotenv

---

## Features

### User
- Authentication — signup, login, Google OAuth, OTP verification, forgot password
- Product listing with search, sort, filter, and pagination
- Product detail page with zoomable images and related recommendations
- Cart and wishlist management with stock validation
- Checkout with address management and multiple payment options
  - Cash on Delivery
  - Razorpay (online payment)
  - Wallet balance
- Coupon and referral offer system
- Order management — place, cancel, return, track status
- Downloadable invoice (PDF)
- Wallet system — auto-refund on cancellation or approved returns
- User profile — edit details, manage addresses, change password

### Admin
- Secure admin authentication
- User management — block / unblock with search and pagination
- Product management — add, edit, soft delete, multi-image upload with crop/resize
- Category management — add, edit, soft delete
- Order management — update status, verify return requests, manage refunds
- Coupon management — create and delete with validation rules
- Offer module — referral offers via token URL and referral code
- Sales reports — filter by date range (daily, weekly, yearly, custom), exportable as PDF and Excel
- Dashboard — charts with filters, top 10 best-selling products, categories, and brands

---

## Project Structure

```
src/
├── config/           # DB, session, passport, cloudinary setup
├── controllers/      # Lean HTTP handlers
├── services/         # Business logic layer
├── repositories/     # Database access layer
├── models/           # Mongoose schemas
├── routes/           # Express route definitions
├── middlewares/      # Auth, error handling, rate limiting
├── validators/       # Joi validation schemas
├── utils/            # Helpers, enums, constants
├── app.js
└── server.js
```

---

## Architecture & Engineering Practices

- Layered MVC — controllers stay lean, business logic lives in services, DB access isolated in repositories
- Global error handling middleware
- Input validation with Joi
- Input sanitization and injection prevention
- HTTP status codes stored as enums
- Stack traces hidden in production
- Response compression with `compression`
- Security headers via `helmet`
- Rate limiting on sensitive routes
- Redis-based session caching
- Non-blocking async patterns throughout
- Git branching strategy followed (main / dev / feature branches)

---

## Book Variants & Categories

**Variants:** Paperback, Hardcover

**Categories:** Self-help, Fiction

---

## Design System

- Monochromatic palette — `#FAFAF8` background, `#121212` text, `#333333` hover
- Typography-driven hierarchy using size, weight, and spacing — no color used to encode meaning
- Font pairing: Inter (UI/headings), Merriweather (body), Playfair Display (branding)
- WCAG AA contrast compliant
- Accessible base font size (16px), line height 1.5–1.7

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB
- Redis
- Cloudinary account
- Razorpay account
- Google OAuth credentials

### Installation

```bash
git clone https://github.com/SuhaibNadakkavil/BooksKart.git
cd BooksKart
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=
MONGO_URI=
SESSION_SECRET=
REDIS_URL=
NODE_ENV=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### Run

```bash
# Development
npm run dev

# Production
npm start

# Build CSS
npm run build:css
```

---

## License

This project is developed for educational and portfolio purposes.
