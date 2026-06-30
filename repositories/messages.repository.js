const sql = require('../configs/database.config');

async function createMessage({ name, email, message }) {
  const result = await sql`
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
        RETURNING *
    `;
  return result[0];
}

async function markNotified(id, updatedBy = null) {
  await sql`
        UPDATE portfolio.messages
        SET notified_at = now(),
            updated_by = ${updatedBy},
            version = COALESCE(version, 1) + 1
        WHERE id = ${id}
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
            archived,
            labels,
            replied_at AS "repliedAt",
            notified_at AS "notifiedAt",
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

async function markRead(id, updatedBy = null) {
  const result = await sql`
        UPDATE portfolio.messages
        SET read = true,
            updated_by = ${updatedBy},
            version = COALESCE(version, 1) + 1
        WHERE id = ${id}
        RETURNING *
    `;

  return result[0];
}

async function toggleStar(id, updatedBy = null) {
  const result = await sql`
        UPDATE portfolio.messages
        SET starred = NOT starred,
            updated_by = ${updatedBy},
            version = COALESCE(version, 1) + 1
        WHERE id = ${id}
        RETURNING *
    `;

  return result[0];
}

async function deleteMessage(id, updatedBy = null) {
  await sql`
        UPDATE portfolio.messages
        SET
            is_deleted = true,
            deleted_at = now(),
            updated_by = ${updatedBy},
            version = COALESCE(version, 1) + 1
        WHERE id = ${id}
    `;
}

async function markAllRead(updatedBy = null) {
  await sql`
        UPDATE portfolio.messages
        SET read = true,
            updated_by = ${updatedBy},
            version = COALESCE(version, 1) + 1
        WHERE is_deleted = false
    `;
}

async function updateLabels(id, labels, updatedBy = null) {
  const result = await sql`
        UPDATE portfolio.messages
        SET labels = ${labels},
            updated_by = ${updatedBy},
            version = COALESCE(version, 1) + 1,
            updated_at = now()
        WHERE id = ${id}
        RETURNING *
    `;

  return result[0];
}

async function updateArchived(id, archived, updatedBy = null) {
  const result = await sql`
        UPDATE portfolio.messages
        SET archived = ${archived},
            updated_by = ${updatedBy},
            version = COALESCE(version, 1) + 1,
            updated_at = now()
        WHERE id = ${id}
        RETURNING *
    `;

  return result[0];
}

async function updateReplied(id, repliedAt, updatedBy = null) {
  const result = await sql`
        UPDATE portfolio.messages
        SET replied_at = ${repliedAt},
            updated_by = ${updatedBy},
            version = COALESCE(version, 1) + 1,
            updated_at = now()
        WHERE id = ${id}
        RETURNING *
    `;

  return result[0];
}

module.exports = {
  createMessage,
  getMessages,
  markRead,
  markNotified,
  toggleStar,
  deleteMessage,
  markAllRead,
  updateLabels,
  updateArchived,
  updateReplied,
};
