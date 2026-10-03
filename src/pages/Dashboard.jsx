import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { api } from '../utils/api.js';
import { getMatchScore } from '../utils/matching.js';

export default function Dashboard() {
  const { user } = useUser();
  const [people, setPeople] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return;
    api('/users/search').then(d => setPeople(d.users || [])).catch(() => {});
    api('/friends/requests').then(d => setRequests(d.requests || [])).catch(() => {});
  }, [user]);

  const matches = useMemo(() => people.filter(p => p._id !== user?._id)
    .map(person => ({ person, score: getMatchScore(user, person).score }))
    .sort((a,b) => b.score-a.score).slice(0,3), [people,user]);

  async function respond(id, status) {
    await api(`/friends/${status}/${id}`, { method: 'POST' });
    setRequests(prev => prev.filter(r => r._id !== id));
  }

  if (!user) return null;
  const fields = [user.location, user.bio, user.canTeach?.length, user.wantsToLearn?.length, user.availability?.length];
  const progress = Math.round(fields.filter(Boolean).length / fields.length * 100);

  return (
    <div className="dashboard-page">
      <section className="dashboard-header">
        <div><p className="dashboard-eyebrow">YOUR SKILL JOURNEY</p><h1>Welcome back, <span>{user.displayName}</span> 👋</h1><p className="dashboard-subtitle">Keep learning, keep teaching, and build valuable connections.</p></div>
        <div className="dashboard-header-actions"><Link to="/matches" className="dashboard-outline-btn">Find a Skill Partner</Link><Link to="/profile" className="dashboard-primary-btn">Edit Profile</Link></div>
      </section>

      {progress < 100 && <section className="profile-progress-card"><div className="profile-progress-icon">✨</div><div className="profile-progress-content"><div className="profile-progress-top"><div><h3>Complete your profile</h3><p>A complete profile helps us find better skill matches.</p></div><strong>{progress}%</strong></div><div className="progress-track"><div className="progress-fill" style={{width:`${progress}%`}} /></div></div><Link to="/profile" className="progress-link">Complete →</Link></section>}

      <section className="dashboard-stats">
        <Stat icon="👁️" title="Profile Views" value={user.profileViews || 0} text="People viewed your profile" />
        <Stat icon="📚" title="Learning Goals" value={user.wantsToLearn?.length || 0} text="Skills you want to learn" />
        <Stat icon="🎓" title="Teaching Skills" value={user.canTeach?.length || 0} text="Skills you can share" />
        <Stat icon="🤝" title="Connections" value={user.friends?.length || 0} text="Accepted skill partners" />
      </section>

      {requests.length > 0 && <section className="dashboard-card"><div className="dashboard-card-header"><div><p className="section-label">NOTIFICATIONS</p><h2>Friend requests</h2></div></div>
        {requests.map(r => <div className="request-row" key={r._id}><div><strong>{r.sender.displayName}</strong><span>@{r.sender.username} wants to connect with you.</span></div><div className="profile-actions"><button className="btn btn--primary" onClick={() => respond(r._id,'accept')}>Accept</button><button className="btn" onClick={() => respond(r._id,'reject')}>Reject</button></div></div>)}
      </section>}

      <section className="dashboard-main-grid">
        <div className="dashboard-card"><div className="dashboard-card-header"><div><p className="section-label">YOUR SKILLS</p><h2>Skill overview</h2></div><Link to="/profile" className="section-link">Manage skills →</Link></div>
          <div className="skills-overview">
            <SkillList title="I can teach" items={user.canTeach?.map(x => `${x.skill} · ${x.level}`)} empty="Add skills you can teach." />
            <SkillList title="I want to learn" items={user.wantsToLearn} empty="Add learning goals." />
          </div>
        </div>
        <div className="dashboard-card"><div className="dashboard-card-header"><div><p className="section-label">TOP MATCHES</p><h2>People for you</h2></div><Link to="/matches" className="section-link">View all →</Link></div>
          {matches.length ? matches.map(({person,score}) => <Link className="dashboard-match-row" key={person._id} to={`/profile/${person.username}`}><div className="dashboard-match-avatar">{person.displayName?.[0]?.toUpperCase()}</div><div><strong>{person.displayName}</strong><span>@{person.username} · {score}% match</span></div><span>→</span></Link>) : <p className="muted">No other users yet. Invite a friend to SkillBarter.</p>}
        </div>
      </section>
    </div>
  );
}

function Stat({icon,title,value,text}) {
  return <div className="dashboard-stat-card"><div className="stat-icon">{icon}</div><div><p>{title}</p><h2>{value}</h2><span>{text}</span></div></div>;
}
function SkillList({title,items,empty}) {
  return <div className="skill-column"><div className="skill-column-header"><div><h3>{title}</h3><span>{items?.length || 0} items</span></div></div><div className="dashboard-skill-list">{items?.length ? items.map(x => <div className="dashboard-skill-item" key={x}><strong>{x}</strong></div>) : <div className="skill-empty">{empty}</div>}</div></div>;
}
