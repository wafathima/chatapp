import { findSession } from "../services/auth.service.js";
export async function requireAuth(req, res, next) {
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
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.middleware.js.map