import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

const userRequests = new Map<string, number[]>();

const WINDOW = 60 * 1000;
const MAX_REQUESTS = 5;

// Cleanup old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamps] of userRequests) {
    const filtered = timestamps.filter((t) => now - t < WINDOW);
    if (filtered.length === 0) {
      userRequests.delete(userId);
    } else {
      userRequests.set(userId, filtered);
    }
  }
}, 60000);

export const aiThrottle = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Date.now();
  const timestamps = userRequests.get(userId) || [];
  const filtered = timestamps.filter((t) => now - t < WINDOW);

  if (filtered.length >= MAX_REQUESTS) {
    return res.status(429).json({
      message: "AI request limit reached. Please wait a minute.",
    });
  }

  filtered.push(now);
  userRequests.set(userId, filtered);

  next();
};
