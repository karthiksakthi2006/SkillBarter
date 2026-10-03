import { useEffect, useMemo, useState } from 'react';
import { useUser } from '../context/UserContext.jsx';
import { api } from '../utils/api.js';
import { getMatchScore } from '../utils/matching.js';
import MatchCard from '../components/MatchCard.jsx';
import { Link } from 'react-router-dom';

export default function Matches() {
  const { user } = useUser();
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const query = search.trim();
    api(`/users/search${query ? `?q=${encodeURIComponent(query)}` : ''}`)
      .then(data => { if (!cancelled) setPeople(data.users || []); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [search]);

  const results = useMemo(() => people
    .filter(person => person._id !== user?._id)
    .map(person => ({ person, matchResult: getMatchScore(user, person) }))
    .sort((a,b) => sortBy === 'score' ? b.matchResult.score - a.matchResult.score : a.person.displayName.localeCompare(b.person.displayName)), [people, user, sortBy]);

  if (!user) return null;

  return (
    <div className="matches-page">
      <div className="matches-header">
        <div><p className="matches-eyebrow">DISCOVER PEOPLE</p><h1>Find Your Skill Partners</h1><p>Search real SkillBarter users by username, name or skill.</p></div>
        <div className="matches-count"><strong>{results.length}</strong><span>people found</span></div>
      </div>

      <div className="matches-toolbar">
        <div className="match-search"><span>🔎</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search @username, name or skill..." />{search && <button className="clear-search" onClick={() => setSearch('')}>×</button>}</div>
        <select className="match-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}><option value="score">Best match</option><option value="name">Name</option></select>
      </div>

      {error && <div className="match-notice"><strong>{error}</strong></div>}
      {loading ? <div className="no-match-results"><h2>Searching...</h2></div> :
        results.length ? <div className="match-results">{results.map(({person, matchResult}) => <MatchCard key={person._id} person={person} matchResult={matchResult} onViewProfile={() => {}} />)}</div> :
        <div className="no-match-results"><div className="no-match-icon">🔍</div><h2>No matching people found</h2><p>Try a username, display name or skill.</p></div>}
    </div>
  );
}
