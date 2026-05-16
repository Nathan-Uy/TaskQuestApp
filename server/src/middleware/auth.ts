import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

export interface AuthRequest extends Request {
  userId?: string;
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const parts = authHeader.split(" ");
  const token = parts[1] && parts[1].length > 0 ? parts[1] : undefined;

  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};
