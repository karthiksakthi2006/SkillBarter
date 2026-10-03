import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ displayName: '', username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { register } = useUser();
  const navigate = useNavigate();

  function change(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await register(form);
      navigate('/profile');
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
            <div className="feature"><span>↔</span><div><strong>Your identity</strong><small>Choose a unique @username.</small></div></div>
            <div className="feature"><span>✦</span><div><strong>Your skills</strong><small>Show what you teach and want to learn.</small></div></div>
            <div className="feature"><span>✓</span><div><strong>Real connections</strong><small>Connect with people through SkillBarter.</small></div></div>
          </div>
        </div>
      </section>

      <section className="login-right">
        <div className="form-container">
          <div className="mobile-brand">SkillBarter</div>
          <p className="form-title">GET STARTED</p>
          <h2>Create your account</h2>

          <form onSubmit={submit} className="login-form">
            {[
              ['displayName', 'Display name', 'Karthik'],
              ['username', 'Username', 'kathir'],
              ['email', 'Email', 'you@example.com'],
              ['password', 'Password', '••••••••'],
              ['confirmPassword', 'Confirm password', '••••••••']
            ].map(([name, label, placeholder]) => (
              <div key={name}>
                <label htmlFor={name}>{label}</label>
                <div className="input-container">
                  <input id={name} name={name} type={name.includes('password') ? 'password' : name === 'email' ? 'email' : 'text'}
                    value={form[name]} onChange={change} placeholder={placeholder} required />
                </div>
              </div>
            ))}

            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="continue-button" disabled={busy}>
              {busy ? 'Creating...' : 'Create account'} <span>→</span>
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
