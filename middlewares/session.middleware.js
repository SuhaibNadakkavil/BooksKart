import session from "express-session";
import { RedisStore } from "connect-redis";
import redisClient from "../config/redis.js";

const redisStore = new RedisStore({
  client: redisClient,
});

const sessionMiddleware = session({
  store: redisStore,
  name: "bookskart.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24,
  },
});

export default sessionMiddleware;