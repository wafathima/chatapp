
import type { Request, Response, NextFunction } from "express";
import { findSession } from "../services/auth.service.js";

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        username: string;
        email: string;
        session_id: string;
      };
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.session;

    if (!token || typeof token !== "string") {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const user = await findSession(token);

    if (!user) {
      res.clearCookie("session");
      res.status(401).json({ message: "Session expired or invalid" });
      return;
    }

    req.authUser = user;
    next();
  } catch (error) {
    next(error);
  }
}
