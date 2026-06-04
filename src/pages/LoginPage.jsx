import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PetalBg from '../components/PetalBg';

export default function LoginPage() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail]     = useState('');
  const [pass,  setPass]      = useState('');
  const [err,   setErr]       = useState('');
  const [loading, setLoading] = useState(false);

  async function handle(e) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await signIn(email, pass);
      nav('/dashboard');
    } catch (ex) {
      setErr(ex.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-center">
      <PetalBg />
      <div className="card">
        <div className="logo">LOVER TAG</div>
        <div className="logo-sub">A digital love letter</div>

        <form onSubmit={handle}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com" required autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)}
              placeholder="••••••••" required />
          </div>
          {err && <div className="toast error">{err}</div>}
          <button className="btn-primary" disabled={loading} style={{marginTop:'1rem'}}>
            {loading ? <div className="spinner" /> : 'Enter 💕'}
          </button>
        </form>

        <div className="divider">or</div>

        <p style={{textAlign:'center', fontSize:'0.85rem', color:'var(--muted)'}}>
          No account yet?{' '}
          <Link to="/signup" style={{color:'var(--crimson)', fontWeight:600, textDecoration:'none'}}>
            Sign up →
          </Link>
        </p>
      </div>
    </div>
  );
}
