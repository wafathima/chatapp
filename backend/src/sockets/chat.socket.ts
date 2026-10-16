// src/sockets/chat.socket.ts
import type { Server, Socket } from "socket.io";
import pool from "../config/db.js";
import { findSession } from "../services/auth.service.js";
import {
  addSocket,
  removeSocket,
  isOnline,
  getOnlineUserIds,
} from "./presence.js";

type AuthenticatedUser = {
  id: string;
  username: string;
  email: string;
};

type MessagePayload = {
  conversationId: string;
  content: string;
};

type ChatSocket = Socket<
  {
    "conversation:join": (
      conversationId: string,
      callback?: (result: { ok: boolean; error?: string }) => void
    ) => void;
    "message:send": (
      payload: MessagePayload,
      callback?: (result: {
        ok: boolean;
        message?: unknown;
        error?: string;
      }) => void
    ) => void;
    "message:delete": (
      messageId: string,
      callback?: (result: { ok: boolean; error?: string }) => void
    ) => void;
  },
  {
    "message:new": (message: unknown) => void;
    "message:deleted": (payload: { messageId: string }) => void;
    "notification:new": (payload: unknown) => void;
    "presence:list": (userIds: string[]) => void;
    "presence:online": (payload: { userId: string }) => void;
    "presence:offline": (payload: { userId: string }) => void;
  },
  Record<string, never>,
  { user: AuthenticatedUser }
>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function registerChatSocket(io: Server) {
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;

      if (!cookieHeader) {
        console.error("Socket authentication failed: no cookie received");
        return next(new Error("Authentication required"));
      }

      const token = getSessionToken(cookieHeader);

      if (!token) {
        console.error("Socket authentication failed: session cookie missing");
        return next(new Error("Authentication required"));
      }

      const user = await findSession(token);

      if (!user) {
        console.error("Socket authentication failed: invalid session");
        return next(new Error("Invalid or expired session"));
      }

      socket.data.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      };

      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket: ChatSocket) => {
    const user = socket.data.user;

    console.log(`Authenticated chat socket connected: ${socket.id}`);

    // Personal room for direct notifications to this user.
    socket.join(`user:${user.id}`);

    // Presence bookkeeping.
    addSocket(user.id, socket.id);
    io.emit("presence:online", { userId: user.id });
    socket.emit("presence:list", getOnlineUserIds());

    socket.on("conversation:join", async (conversationId, callback) => {
      try {
        if (typeof conversationId !== "string" || !UUID_RE.test(conversationId)) {
          callback?.({ ok: false, error: "Invalid conversation ID" });
          return;
        }

        const membership = await pool.query(
          `SELECT 1
           FROM conversation_members
           WHERE conversation_id = $1 AND user_id = $2`,
          [conversationId, user.id]
        );

        if (membership.rowCount === 0) {
          callback?.({ ok: false, error: "Conversation not found" });
          return;
        }

        await socket.join(`conversation:${conversationId}`);
        callback?.({ ok: true });
      } catch {
        callback?.({ ok: false, error: "Unable to join conversation" });
      }
    });

    socket.on("message:send", async (payload, callback) => {
      try {
        if (
          !payload ||
          typeof payload.conversationId !== "string" ||
          typeof payload.content !== "string"
        ) {
          callback?.({ ok: false, error: "Invalid message" });
          return;
        }

        const content = payload.content.trim();

        if (!content || content.length > 4000) {
          callback?.({
            ok: false,
            error: "Message must contain 1–4000 characters",
          });
          return;
        }

        const membership = await pool.query(
          `SELECT 1
           FROM conversation_members
           WHERE conversation_id = $1 AND user_id = $2`,
          [payload.conversationId, user.id]
        );

        if (membership.rowCount === 0) {
          callback?.({ ok: false, error: "Conversation not found" });
          return;
        }

await pool.query(
  `UPDATE conversation_members
   SET deleted_at = NULL
   WHERE conversation_id = $1`,
  [payload.conversationId]
);

// Fetch sender's display info for the message payload.
const senderInfo = await pool.query(
  `SELECT display_name, avatar_url FROM users WHERE id = $1`,
  [user.id]
);

        const result = await pool.query(
          `INSERT INTO messages (conversation_id, sender_id, content)
           VALUES ($1, $2, $3)
           RETURNING id, conversation_id, sender_id, content, created_at`,
          [payload.conversationId, user.id, content]
        );

        const message = {
  ...result.rows[0],
  sender_username: user.username,
  sender_display_name: senderInfo.rows[0]?.display_name ?? null,
  sender_avatar_url: senderInfo.rows[0]?.avatar_url ?? null,
};

        const room = `conversation:${payload.conversationId}`;

        // Everyone with the conversation open.
        io.to(room).emit("message:new", message);

        // Personal notification to every OTHER member.
        const members = await pool.query(
          `SELECT user_id FROM conversation_members
           WHERE conversation_id = $1 AND user_id <> $2`,
          [payload.conversationId, user.id]
        );

        for (const row of members.rows) {
          io.to(`user:${row.user_id}`).emit("notification:new", {
            conversationId: payload.conversationId,
            message,
            from: { id: user.id, username: user.username },
          });
        }

        callback?.({ ok: true, message });
      } catch (error) {
        console.error("Message send failed:", error);
        callback?.({ ok: false, error: "Unable to send message" });
      }
    });

    socket.on("message:delete", async (messageId, callback) => {
      try {
        if (typeof messageId !== "string" || !UUID_RE.test(messageId)) {
          callback?.({ ok: false, error: "Invalid message ID" });
          return;
        }

        const result = await pool.query(
          `UPDATE messages
           SET deleted_at = NOW()
           WHERE id = $1
             AND sender_id = $2
             AND deleted_at IS NULL
           RETURNING conversation_id`,
          [messageId, user.id]
        );

        if (result.rowCount === 0) {
          callback?.({ ok: false, error: "Message not found" });
          return;
        }

        const conversationId = result.rows[0].conversation_id;

        io.to(`conversation:${conversationId}`).emit("message:deleted", {
          messageId,
        });

        callback?.({ ok: true });
      } catch (error) {
        console.error("Message delete failed:", error);
        callback?.({ ok: false, error: "Unable to delete message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Chat socket disconnected: ${socket.id}`);

      removeSocket(user.id, socket.id);

      if (!isOnline(user.id)) {
        io.emit("presence:offline", { userId: user.id });
      }
    });
  });
}

function getSessionToken(cookieHeader: string): string | undefined {
  const sessionCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("session="));

  if (!sessionCookie) return undefined;

  try {
    return decodeURIComponent(sessionCookie.slice("session=".length));
  } catch {
    return undefined;
  }
}