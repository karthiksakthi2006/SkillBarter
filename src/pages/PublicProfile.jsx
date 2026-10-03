import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../utils/api.js';
import { useUser } from '../context/UserContext.jsx';
import { useMessages } from '../context/MessageContext.jsx';

export default function PublicProfile() {
  const { username } = useParams();
  const { user } = useUser();
  const { openConversation } = useMessages();
  const [profile, setProfile] = useState(null);
  const [relationship, setRelationship] = useState({ status: 'none' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [studyBusy, setStudyBusy] = useState(false);

  async function load() {
    try {
      const data = await api(`/users/${encodeURIComponent(username)}`);
      setProfile(data.user);
      if (user && data.user._id !== user._id) {
        const rel = await api(`/friends/status/${data.user._id}`);
        setRelationship(rel);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [username, user?._id]);

  async function requestFriend() {
    setBusy(true);
    try {
      await api(`/friends/request/${profile._id}`, { method: 'POST' });
      await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function message() {
    try { await openConversation(profile._id); }
    catch (err) { setError(err.message); }
  }

  async function studyTogether() {
    setStudyBusy(true);
    try {
      await api(`/study/invite/${profile._id}`, { method: 'POST', body: JSON.stringify({ topic: `Study with ${profile.displayName}` }) });
      setError('');
      setRelationship(prev => ({ ...prev, studySent: true }));
    } catch (err) { setError(err.message); }
    finally { setStudyBusy(false); }
  }

  if (loading) return <div className="page"><p>Loading profile...</p></div>;
  if (error || !profile) return <div className="page"><div className="card empty-state"><h2>Profile not found</h2><p>{error}</p><Link to="/matches" className="btn btn--primary">Back to matches</Link></div></div>;

  const initials = (profile.displayName || profile.username).split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase();

  return (
    <div className="page profile-page">
      <div className="profile-public-card">
        <div className="profile-public-top">
          <div className="profile-public-avatar">{initials}</div>
          <div>
            <h1>{profile.displayName}</h1>
            <p className="profile-username">@{profile.username}</p>
            <p>📍 {profile.location || 'Location not added'}</p>
          </div>
          {user?._id === profile._id ? (
            <Link to="/profile" className="btn">Edit profile</Link>
          ) : user ? (
            <div className="profile-actions">
              {relationship.status === 'friends' ? (
                <>
                  <button className="btn btn--primary" onClick={message}>💬 Message</button>
                  <button className="btn study-profile-btn" disabled={studyBusy || relationship.studySent} onClick={studyTogether}>{studyBusy ? 'Sending...' : relationship.studySent ? 'Study invite sent' : '🎓 Study Together'}</button>
                </>
              ) : relationship.status === 'pending-sent' ? (
                <button className="btn" disabled>Request sent</button>
              ) : relationship.status === 'pending-received' ? (
                <Link className="btn btn--primary" to="/dashboard">Open notifications</Link>
              ) : (
                <button className="btn btn--primary" disabled={busy} onClick={requestFriend}>
                  {busy ? 'Sending...' : '+ Add Friend'}
                </button>
              )}
            </div>
          ) : null}
        </div>

        <p className="profile-public-bio">{profile.bio || 'No bio added yet.'}</p>

        <div className="public-profile-grid">
          <section className="card profile-card">
            <h2>🎓 I can teach</h2>
            <div className="tag-list">
              {profile.canTeach?.length ? profile.canTeach.map(s => <span className="skill-tag teach" key={s.skill}>{s.skill} · {s.level}</span>) : <p className="muted">No teaching skills yet.</p>}
            </div>
          </section>
          <section className="card profile-card">
            <h2>📚 I want to learn</h2>
            <div className="tag-list">
              {profile.wantsToLearn?.length ? profile.wantsToLearn.map(s => <span className="skill-tag learn" key={s}>{s}</span>) : <p className="muted">No learning goals yet.</p>}
            </div>
          </section>
        </div>

        <div className="card profile-card">
          <h2>Availability & languages</h2>
          <p>{profile.availability?.join(' • ') || 'Not specified'}</p>
          <p>{profile.languages?.join(' • ') || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );
}
