import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-container">
      <section className="login-left">
        <div className="circle circle-one" />
        <div className="circle circle-two" />
        <div className="left-content">
          <h1>Trade skills<br /><span>Grow together</span></h1>
          <div className="features">
            <div className="feature"><span>↔</span><div><strong>Exchange skills</strong><small>Teach one skill and learn another.</small></div></div>
            <div className="feature"><span>✦</span><div><strong>Find your match</strong><small>Connect with people who complement your goals.</small></div></div>
            <div className="feature"><span>✓</span><div><strong>Build your reputation</strong><small>Grow through useful skill exchanges.</small></div></div>
          </div>
        </div>
      </section>

      <section className="login-right">
        <div className="form-container">
          <div className="mobile-brand">SkillBarter</div>
          <p className="form-title">WELCOME BACK</p>
          <h2>Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="username">Username</label>
            <div className="input-container">
              <input id="username" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="e.g. kathir" autoFocus required />
            </div>

            <label htmlFor="password">Password</label>
            <div className="input-container">
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Your password" required />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="continue-button" disabled={busy}>
              {busy ? 'Signing in...' : 'Continue'} <span>→</span>
            </button>
          </form>

          <p className="auth-switch">
            New to SkillBarter? <Link to="/sign-up">Create an account</Link>
          </p>

          <div className="divider"><span>HOW IT WORKS</span></div>
          <div className="steps">
            <div className="step"><b>01</b><strong>Create your profile</strong></div>
            <div className="step"><b>02</b><strong>Add skills to teach & learn</strong></div>
            <div className="step"><b>03</b><strong>Meet your ideal skill partner</strong></div>
          </div>
        </div>
      </section>
    </div>
  );
}
