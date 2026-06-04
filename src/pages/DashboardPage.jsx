import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import PetalBg from '../components/PetalBg';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [tags, setTags]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTags(); }, []);

  async function fetchTags() {
    setLoading(true);
    const { data } = await supabase
      .from('lover_tags')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setTags(data || []);
    setLoading(false);
  }

  async function logout() {
    await signOut();
    nav('/login');
  }

  function baseUrl() {
    return window.location.origin;
  }

  return (
    <div style={{minHeight:'100vh', background:'var(--cream)', position:'relative'}}>
      <PetalBg />
      <nav className="nav">
        <div className="nav-logo">LOVER TAG 💌</div>
        <div className="nav-right">
          <button className="nav-btn danger" onClick={logout}>Log out</button>
        </div>
      </nav>

      <div style={{maxWidth:600, margin:'0 auto', padding:'2rem 1.5rem', position:'relative', zIndex:1}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem'}}>
          <div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:'1.8rem', fontWeight:700, color:'var(--text)'}}>
              Your Love Tags
            </h1>
            <p style={{fontSize:'0.82rem', color:'var(--muted)', marginTop:'0.2rem'}}>{user?.email}</p>
          </div>
          <Link to="/create" className="btn-primary"
            style={{width:'auto', padding:'0.7rem 1.5rem', textDecoration:'none', fontSize:'0.88rem'}}>
            + Create Lover Tag
          </Link>
        </div>

        {loading ? (
          <div style={{textAlign:'center', padding:'3rem'}}>
            <div className="spinner" style={{borderTopColor:'var(--crimson)', borderColor:'var(--petal)', margin:'0 auto'}} />
          </div>
        ) : tags.length === 0 ? (
          <div className="card" style={{textAlign:'center', maxWidth:'100%'}}>
            <div style={{fontSize:'3rem', marginBottom:'1rem'}}>💌</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:'1.3rem', fontStyle:'italic', color:'var(--text)', marginBottom:'0.5rem'}}>
              No love tags yet
            </div>
            <p style={{fontSize:'0.85rem', color:'var(--muted)', marginBottom:'1.5rem'}}>
              Create your first Lover Tag and share it with your partner!
            </p>
            <Link to="/create" className="btn-primary"
              style={{textDecoration:'none', display:'inline-block', width:'auto', padding:'0.75rem 2rem'}}>
              Create Now 🌹
            </Link>
          </div>
        ) : (
          <div className="dashboard-grid">
            {tags.map(tag => (
              <TagItem key={tag.id} tag={tag} baseUrl={baseUrl()} onRefresh={fetchTags} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TagItem({ tag, baseUrl, onRefresh }) {
  const nav = useNavigate();
  const tagUrl = `${baseUrl}/tag/${tag.slug}`;
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(tagUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const statusLabel = tag.payment_status === 'paid' ? 'Active 💚'
    : tag.payment_status === 'pending_admin' ? 'Pending Admin ⏳'
    : 'Unpaid ⚠️';

  const badgeClass = tag.payment_status === 'paid' ? 'badge-paid'
    : tag.payment_status === 'pending_admin' ? 'badge-pending'
    : 'badge-inactive';

  return (
    <div className="tag-card-item" style={{flexDirection:'column', alignItems:'flex-start'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', flexWrap:'wrap', gap:'0.5rem'}}>
        <div className="tag-card-names">
          <span style={{color:'var(--boy)'}}>{tag.boy_name}</span>
          {' ♥ '}
          <span style={{color:'var(--girl)'}}>{tag.girl_name}</span>
        </div>
        <span className={`tag-status-badge ${badgeClass}`}>{statusLabel}</span>
      </div>

      <div style={{fontSize:'0.78rem', color:'var(--muted)', marginTop:'0.3rem'}}>
        /{tag.slug}
      </div>

      <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap', marginTop:'0.9rem', width:'100%'}}>
        {tag.payment_status === 'paid' ? (
          <>
            <button className="nav-btn" onClick={copyLink} style={{fontSize:'0.75rem'}}>
              {copied ? '✓ Copied!' : '🔗 Copy Link'}
            </button>
            <button className="nav-btn" onClick={() => nav(`/tag/${tag.slug}`)} style={{fontSize:'0.75rem'}}>
              👁 Preview
            </button>
          </>
        ) : (
          <button className="btn-primary"
            onClick={() => nav(`/pay/${tag.id}`)}
            style={{width:'auto', padding:'0.5rem 1.2rem', fontSize:'0.8rem'}}>
            💳 Pay ₱100 to Activate
          </button>
        )}
      </div>
    </div>
  );
}
