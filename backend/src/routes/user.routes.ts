// src/routes/user.routes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  me,
  updateMe,
  setupPin,
  checkPin,
} from "../controllers/user.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/me", me);
router.patch("/me", updateMe);
router.post("/me/pin", setupPin);
router.post("/me/pin/check", checkPin);

export default router;