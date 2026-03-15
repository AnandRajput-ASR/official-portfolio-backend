const sql = require('../configs/database.config');

async function createMessage({ name, email, message }) {
  await sql`
        INSERT INTO portfolio.messages (
            name,
            email,
            message
        )
        VALUES (
            ${name},
            ${email},
            ${message}
        )
    `;
}

async function getMessages() {
  const messages = await sql`
        SELECT
            id,
            name,
            email,
            message,
            read,
            starred,
            replied_at AS "repliedAt",
            received_at AS "receivedAt"
        FROM portfolio.messages
        WHERE is_deleted = false
        ORDER BY received_at DESC
    `;

  const unreadCount = messages.filter(m => !m.read).length;

  return {
    messages,
    unreadCount,
  };
}

async function markRead(id) {
  const result = await sql`
        UPDATE portfolio.messages
        SET read = true
        WHERE id = ${id}
        RETURNING *
    `;

  return result[0];
}

async function toggleStar(id) {
  const result = await sql`
        UPDATE portfolio.messages
        SET starred = NOT starred
        WHERE id = ${id}
        RETURNING *
    `;

  return result[0];
}

async function deleteMessage(id) {
  await sql`
        UPDATE portfolio.messages
        SET
            is_deleted = true,
            deleted_at = now()
        WHERE id = ${id}
    `;
}

async function markAllRead() {
  await sql`
        UPDATE portfolio.messages
        SET read = true
        WHERE is_deleted = false
    `;
}

module.exports = {
  createMessage,
  getMessages,
  markRead,
  toggleStar,
  deleteMessage,
  markAllRead,
};
