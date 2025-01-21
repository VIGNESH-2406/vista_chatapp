import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

// Get messages by chatId
export const getMessages = (id) => API.get(`/message/${id}`);

// Add a new message
export const addMessage = (data) => API.post('/message/', data);

// Update message status by senderId (e.g., "sent" or "delivered")
export const updateMessagesBySenderId = (senderId) =>  API.put(`/message/status/sender/${senderId}`);

// update all messages status in a chat to "read"
export const updateMessagesByChatId = (chatId,currentUser) => API.put(`/message/status/read/${chatId}/${currentUser}`);
