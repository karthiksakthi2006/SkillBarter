import { useEffect, useRef, useState } from 'react';
import { useMessages } from '../context/MessageContext.jsx';

export default function ChatWindow() {
  const { activeConversation, sendMessage, closeConversation } = useMessages();
  const [message, setMessage] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeConversation?.messages]);

  if (!activeConversation) return null;
  const person = activeConversation.participant;
  const name = person?.displayName || 'Skill partner';

  async function submit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    await sendMessage(message);
    setMessage('');
  }

  return <div className="chat-window">
    <div className="chat-header"><div className="chat-user"><div className="chat-avatar">{name[0]}</div><div><strong>{name}</strong><span>@{person?.username}</span></div></div><button className="chat-close" onClick={closeConversation}>×</button></div>
    <div className="exchange-card"><div className="exchange-card-title">🤝 Skill Exchange</div><div className="exchange-skills"><div><small>YOU</small><strong>Skills</strong></div><div className="exchange-arrow">⇄</div><div><small>{name.toUpperCase()}</small><strong>{person?.canTeach?.[0]?.skill || 'Skills'}</strong></div></div></div>
    <div className="chat-body">
      {activeConversation.messages?.length ? activeConversation.messages.map(item => {
        const mine = item.sender?._id === activeConversation.currentUserId || item.sender === 'me';
        return <div className={`message-row ${mine ? 'message-row--mine' : ''}`} key={item._id || item.id}><div className="message-bubble"><p>{item.text}</p><span>{new Date(item.createdAt || Date.now()).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span></div></div>;
      }) : <div className="new-chat"><div className="new-chat-icon">👋</div><h3>Start your skill exchange</h3><p>You are connected. Send a message to begin.</p></div>}
      <div ref={endRef} />
    </div>
    <form className="chat-input-area" onSubmit={submit}><input value={message} onChange={e => setMessage(e.target.value)} placeholder="Message..." /><button type="submit" className="chat-send" disabled={!message.trim()}>➤</button></form>
  </div>;
}
