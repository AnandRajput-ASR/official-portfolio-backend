const repository = require('../repositories/messages.repository');
const { sendContactNotification } = require('./email.service');

async function sendMessage(payload) {
  const saved = await repository.createMessage(payload);

  // Fire-and-forget email notification (don't block the response)
  void (async () => {
    try {
      await sendContactNotification({
        name: payload.name,
        email: payload.email,
        message: payload.message,
        receivedAt: saved?.received_at || new Date().toISOString(),
      });
      await repository.markNotified(saved.id);
    } catch (err) {
      console.error('[EMAIL] Contact notification failed for message', saved.id, err.message);
    }
  })();

  return saved;
}

async function getMessages() {
  return await repository.getMessages();
}

async function markRead(id) {
  return await repository.markRead(id);
}

async function toggleStar(id) {
  return await repository.toggleStar(id);
}

async function deleteMessage(id) {
  return await repository.deleteMessage(id);
}

async function markAllRead() {
  return await repository.markAllRead();
}

async function updateLabels(id, labels) {
  return await repository.updateLabels(id, labels);
}

async function updateArchived(id, archived) {
  return await repository.updateArchived(id, archived);
}

async function updateReplied(id, repliedAt) {
  return await repository.updateReplied(id, repliedAt);
}

module.exports = {
  sendMessage,
  getMessages,
  markRead,
  toggleStar,
  deleteMessage,
  markAllRead,
  updateLabels,
  updateArchived,
  updateReplied,
};
