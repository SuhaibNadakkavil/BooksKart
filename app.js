import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import session from 'express-session'
import { RedisStore } from 'connect-redis'
import redisClient from './config/redis.js'
import rateLimit from 'express-rate-limit'
import errorMiddleware from './middlewares/error.middleware.js'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import path from 'path'
import { fileURLToPath } from 'url'
import expressLayouts from 'express-ejs-layouts'


const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(expressLayouts)

app.set("layout","layouts/userLayouts")

app.use(express.static(path.join(__dirname, './public')))

app.use(express.urlencoded({extended: true}))
app.use(express.json());

app.use(helmet());

app.use(compression());

const redisStore = new RedisStore({
    client: redisClient,
})

app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET || "bookskart-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, try again later"
  }
});

app.use(limiter);

app.use('/auth', authRoutes)
app.use('/user', userRoutes)


app.use(errorMiddleware)

export default app