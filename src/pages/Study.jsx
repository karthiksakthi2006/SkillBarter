import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';
import { useMessages } from '../context/MessageContext.jsx';

function Avatar({ person }) {
  const name = person?.displayName || person?.username || '?';
  return <div className="study-avatar">{name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()}</div>;
}

export default function Study() {
  const navigate = useNavigate();
  const { socket } = useMessages();
  const [invites, setInvites] = useState([]);
  const [sent, setSent] = useState([]);
  const [active, setActive] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('chat');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const studyFeatures = [
    {
      id: 'chat',
      icon: '💬',
      title: 'Chat',
      description: 'Discuss doubts while you learn.',
      panel: {
        heading: 'Chat with your study partner',
        text: 'Send quick updates, explain concepts, and keep the session moving without leaving the room.'
      }
    },
    {
      id: 'video',
      icon: '📹',
      title: 'Video meeting',
      description: 'Use camera and microphone when you both join.',
      panel: {
        heading: 'Video meeting',
        text: 'Turn on your camera and microphone to talk face-to-face and keep the learning session more personal.'
      }
    },
    {
      id: 'screen',
      icon: '🖥️',
      title: 'Screen share',
      description: 'Share your screen for coding or explanations.',
      panel: {
        heading: 'Screen share',
        text: 'Share your screen to walk through code, demos, or explanations while your partner follows along live.'
      }
    }
  ];

  async function load() {
    try {
      const data = await api('/study/invites');
      setInvites(data.invites || []);
      setSent(data.sent || []);
      setActive(data.active || []);
      setCurrentUserId(data.currentUserId || '');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    load();
    if (!socket) return;
    const refresh = () => load();
    socket.on('study-invite', refresh);
    socket.on('study-invite-updated', refresh);
    return () => { socket.off('study-invite', refresh); socket.off('study-invite-updated', refresh); };
  }, [socket]);

  async function respond(id, action) {
    try {
      const data = await api(`/study/invites/${action}/${id}`, { method: 'POST' });
      if (action === 'accept') navigate(`/study/${data.roomId}`);
      else await load();
    } catch (err) { setError(err.message); }
  }

  if (loading) return <div className="page"><p>Loading study invitations...</p></div>;

  return <div className="page study-page">
    <section className="study-hero">
      <div><p className="dashboard-eyebrow">LEARN TOGETHER</p><h1>Study Room</h1><p>Connect with an accepted SkillBarter partner for a focused one-to-one learning session.</p></div>
      <div className="study-hero-icon">🎓</div>
    </section>

    {error && <div className="form-error">{error}</div>}

    <section className="study-info-grid">
      {studyFeatures.map(feature => (
        <button
          type="button"
          key={feature.id}
          className={`study-info-card ${selectedFeature === feature.id ? 'is-active' : ''}`}
          onClick={() => setSelectedFeature(feature.id)}
          aria-pressed={selectedFeature === feature.id}
        >
          <strong>{feature.icon} {feature.title}</strong>
          <span>{feature.description}</span>
        </button>
      ))}
    </section>

    <section className="study-feature-panel">
      <p className="section-label">ACTIVE MODE</p>
      <h3>{studyFeatures.find(feature => feature.id === selectedFeature)?.panel.heading}</h3>

      {selectedFeature === 'chat' && (
        <div className="study-live-box study-chat-box">
          <div className="study-chat-header">
            <div className="study-chat-avatar">AK</div>
            <div>
              <strong>Aisha Khan</strong>
              <span>@aisha</span>
            </div>
          </div>

          <div className="study-chat-messages">
            <div className="study-message study-message--other">Can you explain the React state flow again?</div>
            <div className="study-message study-message--mine">Sure — we’ll update the form state and re-render the UI.</div>
            <div className="study-message study-message--other">Perfect, let’s review the code together.</div>
          </div>

          <div className="study-chat-input-row">
            <input type="text" value="Type a message..." readOnly />
            <button type="button">Send</button>
          </div>
        </div>
      )}

      {selectedFeature === 'video' && (
        <div className="study-live-box study-video-box">
          <div className="study-video-stage">
            <div className="study-video-card study-video-card--remote">
              <span>Remote user</span>
            </div>
            <div className="study-video-card study-video-card--local">
              <span>You</span>
            </div>
          </div>
          <div className="study-control-row">
            <button type="button">🎙️ Mute</button>
            <button type="button">📷 Camera</button>
            <button type="button">Leave</button>
          </div>
        </div>
      )}

      {selectedFeature === 'screen' && (
        <div className="study-live-box study-screen-box">
          <div className="study-screen-stage">
            <div className="study-screen-window">
              <div className="study-window-bar">
                <span /><span /><span />
              </div>
              <div className="study-window-body">
                <div className="study-code-block">
                  <span>const skillMatch = "React + JavaScript";</span>
                  <span>console.log(skillMatch);</span>
                </div>
              </div>
            </div>
          </div>
          <div className="study-control-row">
            <button type="button">🖥️ Share screen</button>
            <button type="button">Pause</button>
            <button type="button">Stop sharing</button>
          </div>
        </div>
      )}
    </section>

    <section className="dashboard-card study-card">
      <div className="dashboard-card-header"><div><p className="section-label">INCOMING</p><h2>Study invitations</h2></div></div>
      {invites.length ? invites.map(invite => <div className="study-invite-row" key={invite._id}><Avatar person={invite.sender}/><div className="study-invite-main"><strong>{invite.sender.displayName}</strong><span>@{invite.sender.username}</span><p>{invite.topic}</p></div><div className="study-actions"><button className="btn btn--primary" onClick={() => respond(invite._id, 'accept')}>Accept & Join</button><button className="btn" onClick={() => respond(invite._id, 'reject')}>Decline</button></div></div>) : <div className="study-empty"><span>📚</span><h3>No study invitations yet</h3><p>Open a friend's profile and choose “Study Together” to invite them.</p><Link to="/matches" className="btn btn--primary">Find a partner</Link></div>}
    </section>

    <section className="dashboard-card study-card">
      <div className="dashboard-card-header"><div><p className="section-label">ACTIVE</p><h2>Your study sessions</h2></div></div>
      {active.length ? active.map(invite => { const other = String(invite.sender._id) === String(currentUserId) ? invite.receiver : invite.sender; return <div className="study-invite-row" key={invite._id}><Avatar person={other}/><div className="study-invite-main"><strong>{other.displayName}</strong><span>@{other.username}</span><p>{invite.topic}</p></div><button className="btn btn--primary" onClick={() => navigate(`/study/${invite.roomId}`)}>Join meeting</button></div>; }) : <p className="muted">No active study sessions. Accept an invitation to start one.</p>}
    </section>

    <section className="dashboard-card study-card">
      <div className="dashboard-card-header"><div><p className="section-label">PENDING</p><h2>Sent invitations</h2></div></div>
      {sent.length ? sent.map(invite => <div className="study-invite-row" key={invite._id}><Avatar person={invite.receiver}/><div className="study-invite-main"><strong>{invite.receiver.displayName}</strong><span>@{invite.receiver.username}</span><p>{invite.topic}</p></div><span className="study-pending">Waiting for response</span></div>) : <p className="muted">No pending invitations.</p>}
    </section>
  </div>;
}
