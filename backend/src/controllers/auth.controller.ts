
import type { Request, Response, NextFunction } from "express";
import {
  createSession,
  deleteSession,
  loginUser,
  registerUser,
} from "../services/auth.service.js";
import {
  loginSchema,
  registerSchema,
} from "../services/auth.validation.js";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function handleError(
  error: unknown,
  res: Response,
  next: NextFunction
) {
  const err = error as { statusCode?: number; message?: string };

  if (err.statusCode) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  next(error);
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Invalid registration data",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const user = await registerUser(parsed.data);
    const session = await createSession(user.id);

    res.cookie("session", session.token, cookieOptions);

    res.status(201).json({
      message: "Registration successful",
      user,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ message: "Invalid email or password format" });
      return;
    }

    const user = await loginUser(parsed.data);
    const session = await createSession(user.id);

    res.cookie("session", session.token, cookieOptions);

    res.json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.session;

    if (token && typeof token === "string") {
      await deleteSession(token);
    }

    // res.clearCookie("session", {
    //   httpOnly: true,
    //   secure: isProduction,
    //   sameSite: "lax",
    //   path: "/",
    // });

    res.clearCookie("session", {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
});

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

export function me(req: Request, res: Response) {
  const user = req.authUser;

  if (!user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
}
