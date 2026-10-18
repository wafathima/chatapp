import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, logout, me, register, } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
const router = Router();
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many attempts. Please try again later.",
    },
});
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);
export default router;
//# sourceMappingURL=auth.routes.js.map