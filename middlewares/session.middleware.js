import session from "express-session";
import { RedisStore } from "connect-redis";
import redisClient from "../config/redis.js";

const userSession = session({
  name: "user.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({ client: redisClient }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  },
});

const adminSession = session({
  name: "admin.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({ client: redisClient }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  },
});

export default function sessionConfig(app) {
  app.use("/admin", adminSession);
  app.use(userSession);
}