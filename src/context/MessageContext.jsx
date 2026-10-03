import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { api, API_URL } from '../utils/api.js';
import { useUser } from './UserContext.jsx';

const MessageContext = createContext(null);

export function MessageProvider({ children }) {
  const { user } = useUser();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setActiveConversation(null);
      return;
    }

    api('/messages/conversations').then(d => setConversations(d.conversations || [])).catch(() => {});

    const s = io(API_URL.replace(/\/api$/, ''), { auth: { token: localStorage.getItem('skillbarter_token') } });
    s.on('new-message', message => {
      setConversations(prev => prev.map(c => c._id === message.conversationId ? { ...c, lastMessage: message } : c));
      setActiveConversation(prev => {
        if (!prev || prev._id !== message.conversationId) return prev;
        if (prev.messages?.some(m => m._id === message._id)) return prev;
        return { ...prev, messages: [...(prev.messages || []), message] };
      });
    });
    setSocket(s);
    window.__skillbarterSocket = s;
    return () => { s.disconnect(); if (window.__skillbarterSocket === s) delete window.__skillbarterSocket; };
  }, [user?._id]);

  async function openConversation(userId) {
    const data = await api(`/messages/conversations/${userId}`, { method: 'POST' });
    setActiveConversation(data.conversation);
    setConversations(prev => prev.some(c => c._id === data.conversation._id) ? prev : [data.conversation, ...prev]);
    socket?.emit('join-conversation', data.conversation._id);
  }

  async function sendMessage(text) {
    if (!activeConversation || !text.trim()) return;
    const data = await api('/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId: activeConversation._id, text: text.trim() })
    });
    setActiveConversation(prev => ({ ...prev, messages: [...(prev.messages || []), data.message] }));
  }

  function closeConversation() { setActiveConversation(null); }

  const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return <MessageContext.Provider value={{ conversations, activeConversation, unreadCount, socket, openConversation, sendMessage, closeConversation }}>
    {children}
  </MessageContext.Provider>;
}

export function useMessages() { return useContext(MessageContext); }
