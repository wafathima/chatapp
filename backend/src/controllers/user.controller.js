import { getProfile, updateProfile, setPin, verifyPin, } from "../services/user.service.js";
function handleError(error, res, next) {
    const err = error;
    if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }
    next(error);
}
export async function me(req, res, next) {
    try {
        const user = await getProfile(req.authUser.id);
        res.json({ user });
    }
    catch (error) {
        handleError(error, res, next);
    }
}
export async function updateMe(req, res, next) {
    try {
        const user = await updateProfile(req.authUser.id, {
            display_name: req.body?.display_name,
            avatar_url: req.body?.avatar_url,
        });
        res.json({ user });
    }
    catch (error) {
        handleError(error, res, next);
    }
}
export async function setupPin(req, res, next) {
    try {
        const pin = String(req.body?.pin ?? "");
        await setPin(req.authUser.id, pin);
        res.json({ message: "PIN set" });
    }
    catch (error) {
        handleError(error, res, next);
    }
}
export async function checkPin(req, res, next) {
    try {
        const pin = String(req.body?.pin ?? "");
        const ok = await verifyPin(req.authUser.id, pin);
        res.json({ ok });
    }
    catch (error) {
        handleError(error, res, next);
    }
}
//# sourceMappingURL=user.controller.js.map