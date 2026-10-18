import { createDirectConversation, getMessages, listConversations, searchUsers, getSuggestedUsers, deleteConversation, archiveConversation, setConversationHidden, } from "../services/chat.service.js";
function handleError(error, res, next) {
    const err = error;
    if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }
    next(error);
}
export async function users(req, res, next) {
    try {
        const search = typeof req.query.search === "string"
            ? req.query.search.trim().slice(0, 100)
            : "";
        const results = await searchUsers(req.authUser.id, search);
        res.json({ users: results });
    }
    catch (error) {
        next(error);
    }
}
export async function suggestedUsers(req, res, next) {
    try {
        const results = await getSuggestedUsers(req.authUser.id);
        res.json({ users: results });
    }
    catch (error) {
        next(error);
    }
}
export async function conversations(req, res, next) {
    try {
        const mode = req.query.mode;
        const normalized = mode === "archived" || mode === "hidden" ? mode : "active";
        const results = await listConversations(req.authUser.id, normalized);
        res.json({ conversations: results });
    }
    catch (error) {
        next(error);
    }
}
export async function createConversation(req, res, next) {
    try {
        const otherUserId = req.body?.userId;
        if (typeof otherUserId !== "string" ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(otherUserId)) {
            res.status(400).json({ message: "A valid userId is required" });
            return;
        }
        const conversation = await createDirectConversation(req.authUser.id, otherUserId);
        res.status(200).json({ conversation });
    }
    catch (error) {
        handleError(error, res, next);
    }
}
export async function messages(req, res, next) {
    try {
        const results = await getMessages(req.authUser.id, req.params.id);
        res.json({ messages: results });
    }
    catch (error) {
        handleError(error, res, next);
    }
}
export async function removeConversation(req, res, next) {
    try {
        await deleteConversation(req.authUser.id, req.params.id);
        res.json({ message: "Conversation deleted" });
    }
    catch (error) {
        handleError(error, res, next);
    }
}
// ---------- Feature 1 ----------
export async function archiveConversationController(req, res, next) {
    try {
        const archived = req.body?.archived !== false; // default true
        await archiveConversation(req.authUser.id, req.params.id, archived);
        res.json({ message: archived ? "Archived" : "Unarchived" });
    }
    catch (error) {
        handleError(error, res, next);
    }
}
// ---------- Feature 2 ----------
export async function hideConversationController(req, res, next) {
    try {
        const hidden = req.body?.hidden !== false; // default true
        await setConversationHidden(req.authUser.id, req.params.id, hidden);
        res.json({ message: hidden ? "Hidden" : "Unhidden" });
    }
    catch (error) {
        handleError(error, res, next);
    }
}
//# sourceMappingURL=chat.controller.js.map