import bcrypt from "bcryptjs";
import {
  createHash,
  randomBytes,
} from "node:crypto";
import pool from "../config/db.js";
import type { RegisterInput, LoginInput } from "./auth.validation.js";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function registerUser(input: RegisterInput) {
  if (Buffer.byteLength(input.password, "utf8") > 72) {
    throw Object.assign(
      new Error("Password must not exceed 72 UTF-8 bytes"),
      { statusCode: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [input.username, input.email, passwordHash]
    );

    return result.rows[0];
  } catch (error: unknown) {
    const pgError = error as { code?: string; constraint?: string };

    if (pgError.code === "23505") {
      const field = pgError.constraint?.includes("username")
        ? "Username"
        : "Email";

      throw Object.assign(
        new Error(`${field} is already registered`),
        { statusCode: 409 }
      );
    }

    throw error;
  }
}

export async function loginUser(input: LoginInput) {
  const result = await pool.query(
    `SELECT id, username, email, password_hash
     FROM users
     WHERE email = $1`,
    [input.email]
  );

  const user = result.rows[0];

  // Use a generic error so we don't reveal which emails exist.
  if (!user) {
    await bcrypt.compare(
      input.password,
      "$2b$12$LJ3m4ys3Lz0pV5n9n8w3Eu6w4e5uJ7y9s1F5j6K7m8N9o0P1q2R3S"
    ).catch(() => false);

    throw Object.assign(
      new Error("Invalid email or password"),
      { statusCode: 401 }
    );
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.password_hash
  );

  if (!passwordMatches) {
    throw Object.assign(
      new Error("Invalid email or password"),
      { statusCode: 401 }
    );
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await pool.query(
    `INSERT INTO user_sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  return { token, expiresAt };
}

export async function findSession(token: string) {
  const tokenHash = hashToken(token);

  const result = await pool.query(
    `SELECT u.id, u.username, u.email, s.id AS session_id
     FROM user_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1
       AND s.expires_at > NOW()`,
    [tokenHash]
  );

  return result.rows[0] ?? null;
}

export async function deleteSession(token: string) {
  await pool.query(
    "DELETE FROM user_sessions WHERE token_hash = $1",
    [hashToken(token)]
  );
}
