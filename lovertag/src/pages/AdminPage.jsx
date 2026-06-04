import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PetalBg from '../components/PetalBg';

// ─── ADMIN PASSWORD ──────────────────────────────────────────
// Change this to a strong password!
const ADMIN_PW = 'lovertag_admin_2024';
// ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed]   = useState(false);
  const [pw, setPw]           = useState('');
  const [err, setErr]         = useState('');
  const [tags, setTags]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState('');

  function login() {
    if (pw === ADMIN_PW) setAuthed(true);
    else { setErr('Wrong admin password! 🔐'); setTimeout(() => setErr(''), 2000); }
  }

  useEffect(() => { if (authed) fetchPending(); }, [authed]);

  async function fetchPending() {
    setLoading(true);
    const { data } = await supabase
      .from('lover_tags')
      .select('*')
      .order('created_at', { ascending: false });
    setTags(data || []);
    setLoading(false);
  }

  async function approve(id) {
    await supabase.from('lover_tags')
      .update({ payment_status: 'paid', active: true })
      .eq('id', id);
    setMsg('Tag approved and activated! 💚');
    setTimeout(() => setMsg(''), 3000);
    fetchPending();
  }

  async function revoke(id) {
    await supabase.from('lover_tags')
      .update({ payment_status: 'unpaid', active: false })
      .eq('id', id);
    fetchPending();
  }

  const pending  = tags.filter(t => t.payment_status === 'pending_admin' || t.payment_status === 'pending_gcash');
  const active   = tags.filter(t => t.payment_status === 'paid');
  const inactive = tags.filter(t => t.payment_status === 'unpaid');

  if (!authed) return (
    <div className="page-center">
      <PetalBg />
      <div className="card" style={{maxWidth:360}}>
        <div className="logo">LOVER TAG</div>
        <div className="logo-sub">Admin Panel 🔐</div>
        <div className="field">
          <label>Admin Password</label>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="••••••••" autoFocus />
        </div>
        {err && <div className="toast error">{err}</div>}
        <button className="btn-primary" onClick={login} style={{marginTop:'0.8rem'}}>
          Enter Admin 🌹
        </button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh', background:'var(--cream)', position:'relative'}}>
      <PetalBg />
      <nav className="nav">
        <div className="nav-logo">LOVER TAG — Admin 🌹</div>
        <button className="nav-btn" onClick={fetchPending}>↻ Refresh</button>
      </nav>

      <div style={{maxWidth:700, margin:'0 auto', padding:'2rem 1.5rem', position:'relative', zIndex:1}}>
        {msg && <div className="toast success" style={{marginBottom:'1rem'}}>{msg}</div>}

        {loading ? (
          <div style={{textAlign:'center', padding:'3rem'}}>
            <div className="spinner" style={{borderTopColor:'var(--crimson)', borderColor:'var(--petal)', margin:'0 auto'}} />
          </div>
        ) : (
          <>
            {/* Pending Section */}
            <Section title={`⏳ Pending Approval (${pending.length})`} color="#f57f17">
              {pending.length === 0 ? (
                <Empty text="No pending payments 🎉" />
              ) : pending.map(t => (
                <AdminTagCard key={t.id} tag={t} onApprove={() => approve(t.id)} onRevoke={() => revoke(t.id)} />
              ))}
            </Section>

            {/* Active Section */}
            <Section title={`💚 Active Tags (${active.length})`} color="#2e7d32">
              {active.length === 0 ? <Empty text="No active tags yet." /> : active.map(t => (
                <AdminTagCard key={t.id} tag={t} onRevoke={() => revoke(t.id)} isActive />
              ))}
            </Section>

            {/* Inactive Section */}
            <Section title={`🚫 Unpaid (${inactive.length})`} color="var(--muted)">
              {inactive.length === 0 ? <Empty text="No unpaid tags." /> : inactive.map(t => (
                <AdminTagCard key={t.id} tag={t} onApprove={() => approve(t.id)} />
              ))}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, color, children }) {
  return (
    <div style={{marginBottom:'2rem'}}>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:'1.3rem', color, marginBottom:'1rem',
        paddingBottom:'0.5rem', borderBottom:'1px solid var(--border)'}}>
        {title}
      </h2>
      <div style={{display:'flex', flexDirection:'column', gap:'0.8rem'}}>{children}</div>
    </div>
  );
}

function Empty({ text }) {
  return <div style={{fontSize:'0.85rem', color:'var(--muted)', padding:'0.8rem 0'}}>{text}</div>;
}

function AdminTagCard({ tag, onApprove, onRevoke, isActive }) {
  const tagUrl = `${window.location.origin}/tag/${tag.slug}`;

  return (
    <div style={{background:'white', border:'1px solid var(--border)', borderRadius:16,
      padding:'1.2rem 1.4rem', boxShadow:'0 2px 8px rgba(180,60,90,0.05)'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem'}}>
        <div>
          <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:'1.25rem', fontWeight:700, color:'var(--text)'}}>
            <span style={{color:'var(--boy)'}}>{tag.boy_name}</span>
            {' ♥ '}
            <span style={{color:'var(--girl)'}}>{tag.girl_name}</span>
          </div>
          <div style={{fontSize:'0.73rem', color:'var(--muted)', marginTop:'0.15rem'}}>
            /{tag.slug} · {new Date(tag.created_at).toLocaleDateString()}
          </div>
          <div style={{fontSize:'0.73rem', color:'var(--muted)'}}>
            Payment: <strong>{tag.payment_status}</strong>
            {tag.paymongo_ref && ` · Ref: ${tag.paymongo_ref}`}
          </div>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          {onApprove && (
            <button className="btn-primary" onClick={onApprove}
              style={{width:'auto', padding:'0.5rem 1rem', fontSize:'0.78rem'}}>
              ✓ Approve
            </button>
          )}
          {onRevoke && isActive && (
            <button className="nav-btn danger" onClick={onRevoke} style={{fontSize:'0.75rem'}}>
              Revoke
            </button>
          )}
          <a href={tagUrl} target="_blank" rel="noreferrer" className="nav-btn"
            style={{fontSize:'0.75rem', textDecoration:'none'}}>
            👁 View
          </a>
        </div>
      </div>
    </div>
  );
}
