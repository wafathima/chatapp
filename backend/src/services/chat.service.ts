
// import pool from "../config/db.js";

// export async function searchUsers(userId: string, search: string) {
//   const result = await pool.query(
//     `SELECT id, username
//      FROM users
//      WHERE id <> $1
//        AND (username ILIKE $2 OR email ILIKE $2)
//      ORDER BY username
//      LIMIT 20`,
//     [userId, `%${search}%`]
//   );

//   return result.rows;
// }

// export async function listConversations(userId: string) {
//   const result = await pool.query(
//     `SELECT
//        c.id,
//        c.type,
//        c.title,
//        c.created_at,
//        other_user.username AS other_username,
//        other_user.id AS other_user_id,
//        last_message.content AS last_message,
//        last_message.created_at AS last_message_at
//      FROM conversations c
//      JOIN conversation_members mine
//        ON mine.conversation_id = c.id
//       AND mine.user_id = $1
//      LEFT JOIN LATERAL (
//        SELECT u.id, u.username
//        FROM conversation_members cm
//        JOIN users u ON u.id = cm.user_id
//        WHERE cm.conversation_id = c.id
//          AND cm.user_id <> $1
//        LIMIT 1
//      ) other_user ON TRUE
//      LEFT JOIN LATERAL (
//        SELECT m.content, m.created_at
//        FROM messages m
//        WHERE m.conversation_id = c.id
//          AND m.deleted_at IS NULL
//        ORDER BY m.created_at DESC
//        LIMIT 1
//      ) last_message ON TRUE
//      ORDER BY COALESCE(last_message.created_at, c.created_at) DESC`,
//     [userId]
//   );

//   return result.rows;
// }

// export async function createDirectConversation(
//   userId: string,
//   otherUserId: string
// ) {
//   if (userId === otherUserId) {
//     throw Object.assign(
//       new Error("You cannot start a conversation with yourself"),
//       { statusCode: 400 }
//     );
//   }

//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     const otherUser = await client.query(
//       "SELECT id FROM users WHERE id = $1",
//       [otherUserId]
//     );

//     if (otherUser.rowCount === 0) {
//       throw Object.assign(
//         new Error("User not found"),
//         { statusCode: 404 }
//       );
//     }

//     // Reuse an existing direct conversation if one exists.
//     const existing = await client.query(
//       `SELECT c.id
//        FROM conversations c
//        JOIN conversation_members mine
//          ON mine.conversation_id = c.id
//         AND mine.user_id = $1
//        JOIN conversation_members other
//          ON other.conversation_id = c.id
//         AND other.user_id = $2
//        WHERE c.type = 'direct'
//          AND (
//            SELECT COUNT(*)
//            FROM conversation_members all_members
//            WHERE all_members.conversation_id = c.id
//          ) = 2
//        LIMIT 1`,
//       [userId, otherUserId]
//     );

//     if (existing.rows.length > 0) {
//       await client.query("COMMIT");
//       return { id: existing.rows[0].id };
//     }

//     const conversation = await client.query(
//       `INSERT INTO conversations (type, created_by)
//        VALUES ('direct', $1)
//        RETURNING id`,
//       [userId]
//     );

//     const conversationId = conversation.rows[0].id;

//     await client.query(
//       `INSERT INTO conversation_members (conversation_id, user_id)
//        VALUES ($1, $2), ($1, $3)`,
//       [conversationId, userId, otherUserId]
//     );

//     await client.query("COMMIT");

//     return { id: conversationId };
//   } catch (error) {
//     await client.query("ROLLBACK");
//     throw error;
//   } finally {
//     client.release();
//   }
// }

// export async function getMessages(
//   userId: string,
//   conversationId: string
// ) {
//   const membership = await pool.query(
//     `SELECT 1
//      FROM conversation_members
//      WHERE conversation_id = $1 AND user_id = $2`,
//     [conversationId, userId]
//   );

//   if (membership.rowCount === 0) {
//     throw Object.assign(
//       new Error("Conversation not found"),
//       { statusCode: 404 }
//     );
//   }

//   const result = await pool.query(
//     `SELECT *
//      FROM (
//        SELECT
//          m.id,
//          m.conversation_id,
//          m.sender_id,
//          u.username AS sender_username,
//          m.content,
//          m.created_at,
//          m.edited_at
//        FROM messages m
//        JOIN users u ON u.id = m.sender_id
//        WHERE m.conversation_id = $1
//          AND m.deleted_at IS NULL
//        ORDER BY m.created_at DESC, m.id DESC
//        LIMIT 50
//      ) recent_messages
//      ORDER BY created_at ASC, id ASC`,
//     [conversationId]
//   );

//   return result.rows;
// }

// src/services/chat.service.ts
import pool from "../config/db.js";

export async function searchUsers(userId: string, search: string) {
  const result = await pool.query(
    `SELECT id, username
     FROM users
     WHERE id <> $1
       AND (username ILIKE $2 OR email ILIKE $2)
     ORDER BY username
     LIMIT 20`,
    [userId, `%${search}%`]
  );

  return result.rows;
}

export async function getSuggestedUsers(userId: string) {
  // Users who are NOT already in a direct conversation with you.
  const result = await pool.query(
    `SELECT u.id, u.username
     FROM users u
     WHERE u.id <> $1
       AND NOT EXISTS (
         SELECT 1
         FROM conversation_members cm
         JOIN conversations c ON c.id = cm.conversation_id
         WHERE cm.user_id = u.id
           AND c.type = 'direct'
           AND EXISTS (
             SELECT 1 FROM conversation_members me
             WHERE me.conversation_id = c.id AND me.user_id = $1
           )
       )
     ORDER BY u.created_at DESC
     LIMIT 20`,
    [userId]
  );

  return result.rows;
}

export async function listConversations(userId: string) {
  const result = await pool.query(
    `SELECT
       c.id,
       c.type,
       c.title,
       c.created_at,
       other_user.username AS other_username,
       other_user.id AS other_user_id,
       last_message.content AS last_message,
       last_message.created_at AS last_message_at
     FROM conversations c
     JOIN conversation_members mine
       ON mine.conversation_id = c.id
      AND mine.user_id = $1
      AND mine.deleted_at IS NULL
     LEFT JOIN LATERAL (
       SELECT u.id, u.username
       FROM conversation_members cm
       JOIN users u ON u.id = cm.user_id
       WHERE cm.conversation_id = c.id
         AND cm.user_id <> $1
       LIMIT 1
     ) other_user ON TRUE
     LEFT JOIN LATERAL (
       SELECT m.content, m.created_at
       FROM messages m
       WHERE m.conversation_id = c.id
         AND m.deleted_at IS NULL
       ORDER BY m.created_at DESC
       LIMIT 1
     ) last_message ON TRUE
     ORDER BY COALESCE(last_message.created_at, c.created_at) DESC`,
    [userId]
  );

  return result.rows;
}

export async function createDirectConversation(
  userId: string,
  otherUserId: string
) {
  if (userId === otherUserId) {
    throw Object.assign(
      new Error("You cannot start a conversation with yourself"),
      { statusCode: 400 }
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const otherUser = await client.query(
      "SELECT id FROM users WHERE id = $1",
      [otherUserId]
    );

    if (otherUser.rowCount === 0) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }

    const existing = await client.query(
      `SELECT c.id
       FROM conversations c
       JOIN conversation_members mine
         ON mine.conversation_id = c.id
        AND mine.user_id = $1
       JOIN conversation_members other
         ON other.conversation_id = c.id
        AND other.user_id = $2
       WHERE c.type = 'direct'
         AND (
           SELECT COUNT(*)
           FROM conversation_members all_members
           WHERE all_members.conversation_id = c.id
         ) = 2
       LIMIT 1`,
      [userId, otherUserId]
    );

    if (existing.rows.length > 0) {
      // Re-joining an old conversation: unhide for the current user.
      await client.query(
        `UPDATE conversation_members
         SET deleted_at = NULL
         WHERE conversation_id = $1 AND user_id = $2`,
        [existing.rows[0].id, userId]
      );

      await client.query("COMMIT");
      return { id: existing.rows[0].id };
    }

    const conversation = await client.query(
      `INSERT INTO conversations (type, created_by)
       VALUES ('direct', $1)
       RETURNING id`,
      [userId]
    );

    const conversationId = conversation.rows[0].id;

    await client.query(
      `INSERT INTO conversation_members (conversation_id, user_id)
       VALUES ($1, $2), ($1, $3)`,
      [conversationId, userId, otherUserId]
    );

    await client.query("COMMIT");

    return { id: conversationId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getMessages(userId: string, conversationId: string) {
  const membership = await pool.query(
    `SELECT 1
     FROM conversation_members
     WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId]
  );

  if (membership.rowCount === 0) {
    throw Object.assign(new Error("Conversation not found"), {
      statusCode: 404,
    });
  }

  const result = await pool.query(
    `SELECT *
     FROM (
       SELECT
         m.id,
         m.conversation_id,
         m.sender_id,
         u.username AS sender_username,
         m.content,
         m.created_at,
         m.edited_at
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
         AND m.deleted_at IS NULL
       ORDER BY m.created_at DESC, m.id DESC
       LIMIT 50
     ) recent_messages
     ORDER BY created_at ASC, id ASC`,
    [conversationId]
  );

  return result.rows;
}

export async function deleteConversation(
  userId: string,
  conversationId: string
) {
  const result = await pool.query(
    `UPDATE conversation_members
     SET deleted_at = NOW()
     WHERE conversation_id = $1 AND user_id = $2
     RETURNING conversation_id`,
    [conversationId, userId]
  );

  if (result.rowCount === 0) {
    throw Object.assign(new Error("Conversation not found"), {
      statusCode: 404,
    });
  }
}