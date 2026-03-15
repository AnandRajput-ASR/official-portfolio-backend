const repository = require('../repositories/messages.repository');

async function sendMessage(payload) {
  return await repository.createMessage(payload);
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

module.exports = {
  sendMessage,
  getMessages,
  markRead,
  toggleStar,
  deleteMessage,
  markAllRead,
};
