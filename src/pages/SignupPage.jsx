import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PetalBg from '../components/PetalBg';

export default function SignupPage() {
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [email, setEmail]   = useState('');
  const [pass,  setPass]    = useState('');
  const [pass2, setPass2]   = useState('');
  const [err,   setErr]     = useState('');
  const [msg,   setMsg]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handle(e) {
    e.preventDefault();
    setErr(''); setMsg('');
    if (pass !== pass2) { setErr("Passwords don't match! 💔"); return; }
    if (pass.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await signUp(email, pass);
      setMsg('Account created! Check your email to confirm, then log in. 💌');
    } catch (ex) {
      setErr(ex.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-center">
      <PetalBg />
      <div className="card">
        <div className="logo">LOVER TAG</div>
        <div className="logo-sub">Create your account</div>

        {msg ? (
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'3rem', marginBottom:'1rem'}}>💌</div>
            <div className="toast success" style={{marginBottom:'1.2rem'}}>{msg}</div>
            <Link to="/login" className="btn-primary" style={{textDecoration:'none', display:'block', textAlign:'center', padding:'0.9rem'}}>
              Go to Login →
            </Link>
          </div>
        ) : (
          <form onSubmit={handle}>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com" required autoFocus />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)}
                placeholder="Min 6 characters" required />
            </div>
            <div className="field">
              <label>Confirm Password</label>
              <input type="password" value={pass2} onChange={e => setPass2(e.target.value)}
                placeholder="Repeat password" required />
            </div>
            {err && <div className="toast error">{err}</div>}
            <button className="btn-primary" disabled={loading} style={{marginTop:'1rem'}}>
              {loading ? <div className="spinner" /> : 'Create Account 🌹'}
            </button>
          </form>
        )}

        <div className="divider">or</div>
        <p style={{textAlign:'center', fontSize:'0.85rem', color:'var(--muted)'}}>
          Already have an account?{' '}
          <Link to="/login" style={{color:'var(--crimson)', fontWeight:600, textDecoration:'none'}}>
            Log in →
          </Link>
        </p>
      </div>
    </div>
  );
}
