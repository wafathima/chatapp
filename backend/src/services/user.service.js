// src/services/user.service.ts
import bcrypt from "bcrypt";
import pool from "../config/db.js";
const PIN_REGEX = /^\d{4,6}$/;
export async function getProfile(userId) {
    const result = await pool.query(`SELECT id, username, email, display_name, avatar_url,
            (pin_hash IS NOT NULL) AS has_pin
     FROM users WHERE id = $1`, [userId]);
    if (result.rowCount === 0) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    return result.rows[0];
}
export async function updateProfile(userId, data) {
    const displayName = typeof data.display_name === "string"
        ? data.display_name.trim().slice(0, 40) || null
        : data.display_name === null
            ? null
            : undefined;
    const avatarUrl = typeof data.avatar_url === "string"
        ? data.avatar_url.trim().slice(0, 500) || null
        : data.avatar_url === null
            ? null
            : undefined;
    const result = await pool.query(`UPDATE users
     SET display_name = COALESCE($2, display_name),
         avatar_url   = COALESCE($3, avatar_url)
     WHERE id = $1
     RETURNING id, username, email, display_name, avatar_url,
               (pin_hash IS NOT NULL) AS has_pin`, [userId, displayName ?? null, avatarUrl ?? null]);
    return result.rows[0];
}
export async function setPin(userId, pin) {
    if (!PIN_REGEX.test(pin)) {
        throw Object.assign(new Error("PIN must be 4–6 digits"), {
            statusCode: 400,
        });
    }
    const hash = await bcrypt.hash(pin, 10);
    await pool.query("UPDATE users SET pin_hash = $2 WHERE id = $1", [
        userId,
        hash,
    ]);
}
export async function verifyPin(userId, pin) {
    const result = await pool.query("SELECT pin_hash FROM users WHERE id = $1", [userId]);
    const hash = result.rows[0]?.pin_hash;
    if (!hash)
        return false;
    return bcrypt.compare(pin, hash);
}
//# sourceMappingURL=user.service.js.map