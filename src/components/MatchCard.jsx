import { Link } from 'react-router-dom';

export default function MatchCard({ person, matchResult }) {
  const name = person.displayName || person.username;
  const initials = name.split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase();
  const scoreClass = matchResult.score >= 80 ? 'match-score--excellent' : matchResult.score >= 60 ? 'match-score--good' : '';

  return (
    <article className="modern-match-card">
      <div className="modern-match-user">
        <div className="modern-match-avatar">{initials}</div>
        <div className="modern-match-user-info">
          <div className="modern-match-name-row"><h2>{name}</h2>{matchResult.isMutualMatch && <span className="mutual-tag">🤝 Mutual</span>}</div>
          <p className="modern-match-location">📍 {person.location || 'Location not added'}</p>
          <p className="profile-username">@{person.username}</p>
        </div>
      </div>

      <div className="modern-match-skills">
        <div><span className="skill-label">CAN TEACH</span><div className="match-tags">{person.canTeach?.slice(0,3).map(s => <span key={s.skill}>{s.skill}</span>)}</div></div>
        <div><span className="skill-label">WANTS TO LEARN</span><div className="match-tags match-tags--learn">{person.wantsToLearn?.slice(0,3).map(s => <span key={s}>{s}</span>)}</div></div>
      </div>

      <div className="modern-match-score">
        <div className={`large-match-score ${scoreClass}`}><strong>{matchResult.score}%</strong><span>match</span></div>
        <Link to={`/profile/${person.username}`} className="view-profile-btn">View profile →</Link>
      </div>
    </article>
  );
}
