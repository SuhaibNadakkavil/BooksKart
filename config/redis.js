import dotenv from 'dotenv'
dotenv.config()

import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL,
})

redisClient.on("connect", () => {
  console.log("Redis Cloud connected");
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

await redisClient.connect();

export default redisClient;