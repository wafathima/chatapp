// src/routes/chat.routes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { users, suggestedUsers, conversations, createConversation, messages, removeConversation, archiveConversationController, hideConversationController, } from "../controllers/chat.controller.js";
const router = Router();
router.use(requireAuth);
router.get("/users", users);
router.get("/users/suggested", suggestedUsers);
router.get("/conversations", conversations);
router.post("/conversations", createConversation);
router.get("/conversations/:id/messages", messages);
router.delete("/conversations/:id", removeConversation);
router.patch("/conversations/:id/archive", archiveConversationController);
router.patch("/conversations/:id/hide", hideConversationController);
export default router;
//# sourceMappingURL=chat.routes.js.map