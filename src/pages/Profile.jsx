import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext.jsx';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const AVAILABILITY_OPTIONS = ['Mornings', 'Afternoons', 'Evenings', 'Weekends'];

export default function Profile() {
  const { user, updateProfile } = useUser();
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [canTeach, setCanTeach] = useState([]);
  const [wantsToLearn, setWantsToLearn] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [teachSkill, setTeachSkill] = useState('');
  const [teachLevel, setTeachLevel] = useState('Beginner');
  const [learnSkill, setLearnSkill] = useState('');
  const [language, setLanguage] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    setLocation(user.location || '');
    setBio(user.bio || '');
    setCanTeach(user.canTeach || []);
    setWantsToLearn(user.wantsToLearn || []);
    setAvailability(user.availability || []);
    setLanguages(user.languages || ['English']);
  }, [user]);

  if (!user) return <p>Please log in first.</p>;

  function addTeach(e) {
    e.preventDefault();
    if (!teachSkill.trim()) return;
    if (canTeach.some(s => s.skill.toLowerCase() === teachSkill.trim().toLowerCase())) return;
    setCanTeach([...canTeach, { skill: teachSkill.trim(), level: teachLevel }]);
    setTeachSkill('');
  }

  function addLearn(e) {
    e.preventDefault();
    if (!learnSkill.trim()) return;
    if (!wantsToLearn.some(s => s.toLowerCase() === learnSkill.trim().toLowerCase()))
      setWantsToLearn([...wantsToLearn, learnSkill.trim()]);
    setLearnSkill('');
  }

  function addLanguage(e) {
    e.preventDefault();
    if (!language.trim()) return;
    if (!languages.some(s => s.toLowerCase() === language.trim().toLowerCase()))
      setLanguages([...languages, language.trim()]);
    setLanguage('');
  }

  function toggleAvailability(option) {
    setAvailability(prev => prev.includes(option) ? prev.filter(x => x !== option) : [...prev, option]);
  }

  async function save() {
    setSaving(true);
    setMessage('');
    try {
      await updateProfile({ bio, location, canTeach, wantsToLearn, availability, languages });
      setMessage('Profile updated successfully.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page profile-page">
      <div className="profile-header">
        <div>
          <p className="matches-eyebrow">YOUR IDENTITY</p>
          <h1>{user.displayName}</h1>
          <p>@{user.username} · Manage your skills, goals and availability.</p>
        </div>
        <button className="btn btn--primary" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </div>

      {message && <div className="match-notice"><strong>{message}</strong></div>}

      <section className="card profile-card">
        <div className="section-title"><span className="section-icon">👤</span><div><h2>Basic info</h2><p>Your public profile information.</p></div></div>
        <label>Display name</label>
        <input value={user.displayName} disabled />
        <label>Username</label>
        <input value={`@${user.username}`} disabled />
        <label htmlFor="bio">Bio</label>
        <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell people what you are interested in..." rows="4" />
        <label htmlFor="location">Location</label>
        <input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="City" />
      </section>

      <section className="card profile-card">
        <div className="section-title"><span className="section-icon">🎓</span><div><h2>I can teach</h2><p>Skills you can share with others.</p></div></div>
        <div className="tag-list">
          {canTeach.map(s => <span className="skill-tag teach" key={s.skill}>{s.skill} · {s.level} <button onClick={() => setCanTeach(canTeach.filter(x => x.skill !== s.skill))}>×</button></span>)}
          {!canTeach.length && <p className="muted">No skills added yet.</p>}
        </div>
        <form onSubmit={addTeach} className="inline-form">
          <input value={teachSkill} onChange={e => setTeachSkill(e.target.value)} placeholder="e.g. React" />
          <select value={teachLevel} onChange={e => setTeachLevel(e.target.value)}>{LEVELS.map(x => <option key={x}>{x}</option>)}</select>
          <button className="btn" type="submit">+ Add Skill</button>
        </form>
      </section>

      <section className="card profile-card">
        <div className="section-title"><span className="section-icon">📚</span><div><h2>I want to learn</h2><p>Skills you want to exchange or learn.</p></div></div>
        <div className="tag-list">
          {wantsToLearn.map(s => <span className="skill-tag learn" key={s}>{s} <button onClick={() => setWantsToLearn(wantsToLearn.filter(x => x !== s))}>×</button></span>)}
          {!wantsToLearn.length && <p className="muted">No learning goals yet.</p>}
        </div>
        <form onSubmit={addLearn} className="inline-form">
          <input value={learnSkill} onChange={e => setLearnSkill(e.target.value)} placeholder="e.g. Java" />
          <button className="btn" type="submit">+ Add Goal</button>
        </form>
      </section>

      <section className="card profile-card">
        <div className="section-title"><span className="section-icon">🕐</span><div><h2>Availability</h2><p>When you are usually available.</p></div></div>
        <div className="availability-options">
          {AVAILABILITY_OPTIONS.map(option => <label key={option}><input type="checkbox" checked={availability.includes(option)} onChange={() => toggleAvailability(option)} /> {option}</label>)}
        </div>
      </section>

      <section className="card profile-card">
        <div className="section-title"><span className="section-icon">🌐</span><div><h2>Languages</h2><p>Languages you can communicate in.</p></div></div>
        <div className="tag-list">{languages.map(s => <span className="skill-tag" key={s}>{s} <button onClick={() => setLanguages(languages.filter(x => x !== s))}>×</button></span>)}</div>
        <form onSubmit={addLanguage} className="inline-form">
          <input value={language} onChange={e => setLanguage(e.target.value)} placeholder="e.g. Tamil" />
          <button className="btn" type="submit">+ Add Language</button>
        </form>
      </section>
    </div>
  );
}
