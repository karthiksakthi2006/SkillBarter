import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMessages } from '../context/MessageContext.jsx';
import { useUser } from '../context/UserContext.jsx';
import MessageDropdown from './MessageDropDown.jsx';
import ChatWindow from './ChatWindow.jsx';
import { api } from '../utils/api.js';

export default function Navbar() {
  const { unreadCount, activeConversation, socket } = useMessages();
  const { logout, user } = useUser();
  const [showMessages, setShowMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [requests, setRequests] = useState([]);
  const [studyInvites, setStudyInvites] = useState([]);

  useEffect(() => {
    api('/friends/requests').then(d => setRequests(d.requests || [])).catch(() => {});
    api('/study/invites').then(d => setStudyInvites(d.invites || [])).catch(() => {});
  }, [user?._id]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => api('/study/invites').then(d => setStudyInvites(d.invites || [])).catch(() => {});
    socket.on('study-invite', refresh);
    socket.on('study-invite-updated', refresh);
    return () => { socket.off('study-invite', refresh); socket.off('study-invite-updated', refresh); };
  }, [socket]);

  return <nav className="navbar">
    <Link to="/dashboard" className="navbar-logo">SkillBarter</Link>
    <div className="navbar-links"><Link to="/dashboard">Dashboard</Link><Link to="/matches">Find Matches</Link><Link to="/study" className="study-nav-link">Study</Link><Link to="/profile">Profile</Link></div>
    <div className="navbar-actions">
      <div className="message-button-wrapper">
        <button className={`navbar-icon-button ${showMessages ? 'navbar-icon-button--active' : ''}`} onClick={() => setShowMessages(v => !v)} aria-label="Messages">💬{unreadCount > 0 && <span className="navbar-unread">{unreadCount > 9 ? '9+' : unreadCount}</span>}</button>
        {showMessages && <MessageDropdown onClose={() => setShowMessages(false)} />}
      </div>
      <Link to="/study" className="navbar-icon-button notification-button" aria-label="Study invitations">🔔{(requests.length + studyInvites.length) > 0 && <span className="navbar-unread">{requests.length + studyInvites.length}</span>}</Link>
      <div className="profile-menu-wrapper">
        <button className="navbar-profile" onClick={() => setShowProfileMenu(v => !v)}>👤</button>
        {showProfileMenu && <div className="profile-dropdown"><Link to="/profile" onClick={() => setShowProfileMenu(false)}>👤 My Profile</Link><button onClick={() => { logout(); setShowProfileMenu(false); }}>🚪 Logout</button></div>}
      </div>
    </div>
    {activeConversation && <ChatWindow />}
  </nav>;
}
