import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMessages } from '../context/MessageContext.jsx';
import { api } from '../utils/api.js';

export default function MessageDropdown({ onClose }) {
  const { conversations, openConversation } = useMessages();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);

  async function findUsers(value) {
    setSearch(value);
    if (!value.trim()) { setUsers([]); return; }
    try { const data = await api(`/users/search?q=${encodeURIComponent(value)}`); setUsers(data.users || []); } catch {}
  }

  return <div className="message-dropdown">
    <div className="message-dropdown-header"><div><h3>Messages</h3><p>Your skill exchange conversations</p></div><button onClick={onClose}>×</button></div>
    <div className="message-search"><span>🔎</span><input value={search} onChange={e => findUsers(e.target.value)} placeholder="Search users..." /></div>

    {search && users.length > 0 && <div className="conversation-list">{users.slice(0,5).map(person =>
      <button className="conversation-item" key={person._id} onClick={() => { openConversation(person._id); onClose(); }}>
        <div className="conversation-avatar">{person.displayName?.[0]}</div><div className="conversation-info"><strong>{person.displayName}</strong><p>@{person.username}</p></div>
      </button>)}</div>}

    {!search && (conversations.length ? <div className="conversation-list">{conversations.map(c =>
      <button className="conversation-item" key={c._id} onClick={() => { openConversation(c.participant?._id); onClose(); }}>
        <div className="conversation-avatar">{c.participant?.displayName?.[0]}</div><div className="conversation-info"><strong>{c.participant?.displayName}</strong><p>{c.lastMessage?.text || 'Start your skill exchange'}</p></div>
      </button>)}</div> : <div className="empty-messages"><div className="empty-message-icon">💬</div><h4>No conversations yet</h4><p>Become friends with someone before messaging.</p></div>)}

    <Link to="/matches" onClick={onClose} className="message-dropdown-footer">Find a skill partner →</Link>
  </div>;
}
