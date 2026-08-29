import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

const getCookieValue = (cookieHeader: string | undefined, name: string) => {
  if (!cookieHeader) return undefined;

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!match) return undefined;
  return decodeURIComponent(match.split("=").slice(1).join("="));
};

export const requireCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.method === "GET") return next();

  const tokenFromHeader = req.headers["x-csrf-token"];
  const tokenFromCookie = getCookieValue(req.headers.cookie, "csrfToken");

  if (!tokenFromHeader || !tokenFromCookie || tokenFromHeader !== tokenFromCookie) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  next();
};

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    const parts = authHeader.split(" ");
    token = parts[1] && parts[1].length > 0 ? parts[1] : undefined;
  } else {
    const cookieHeader = req.headers.cookie ?? "";
    const cookieToken = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("token="));

    if (cookieToken) {
      token = decodeURIComponent(cookieToken.split("=").slice(1).join("="));
    }
  }

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
