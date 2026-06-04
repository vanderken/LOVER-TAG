import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { createGCashPayment } from '../lib/paymongo';
import PetalBg from '../components/PetalBg';

export default function PaywallPage() {
  const { tagId } = useParams();
  const { user }  = useAuth();
  const nav = useNavigate();

  const [tag, setTag]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState(false);
  const [method,  setMethod]  = useState(''); // 'gcash' | 'admin'
  const [msg, setMsg]         = useState('');
  const [err, setErr]         = useState('');

  useEffect(() => {
    supabase.from('lover_tags').select('*').eq('id', tagId).eq('user_id', user.id)
      .single().then(({ data }) => { setTag(data); setLoading(false); });

    // Check if returning from PayMongo redirect
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) checkPayment(ref);
  }, [tagId]);

  async function checkPayment(referenceNumber) {
    // Poll PayMongo for payment status
    // ─── PAYMONGO SECRET KEY NEEDED HERE ───
    // In production, this check should happen via a Supabase Edge Function
    // using your PayMongo SECRET key (not the public key).
    // For now, we update via the reference number stored in DB.
    const { data } = await supabase
      .from('lover_tags')
      .select('payment_status')
      .eq('paymongo_ref', referenceNumber)
      .single();
    if (data?.payment_status === 'paid') {
      setMsg('Payment confirmed! Your Lover Tag is now active 💚');
    }
  }

  async function handleGCash() {
    setPaying(true); setErr('');
    try {
      const { checkoutUrl, referenceNumber } = await createGCashPayment(tag.slug, user.email);

      // Save reference number in DB
      await supabase.from('lover_tags')
        .update({ paymongo_ref: referenceNumber, payment_status: 'pending_gcash' })
        .eq('id', tagId);

      // Redirect to PayMongo checkout
      window.location.href = checkoutUrl;
    } catch (ex) {
      setErr(ex.message || 'GCash payment failed. Try again or contact admin.');
      setPaying(false);
    }
  }

  async function handleContactAdmin() {
    setPaying(true); setErr('');
    try {
      await supabase.from('lover_tags')
        .update({ payment_status: 'pending_admin' })
        .eq('id', tagId);
      setMsg('Request sent! Contact the admin on Facebook to pay ₱100 and get your tag activated. 💌');
    } catch (ex) {
      setErr('Something went wrong.');
    } finally {
      setPaying(false);
    }
  }

  if (loading) return (
    <div className="page-center">
      <div className="spinner" style={{borderTopColor:'var(--crimson)', borderColor:'var(--petal)'}} />
    </div>
  );

  if (!tag) return (
    <div className="page-center">
      <div className="toast error">Tag not found.</div>
    </div>
  );

  if (tag.payment_status === 'paid') {
    return <AlreadyPaid tag={tag} />;
  }

  return (
    <div className="page-center">
      <PetalBg />
      <div className="card paywall-card">
        <div className="logo">LOVER TAG</div>
        <div className="logo-sub">Activate your love story</div>

        <div className="couple-row">
          <span className="name-boy">{tag.boy_name}</span>
          <span className="heart-beat">♥</span>
          <span className="name-girl">{tag.girl_name}</span>
        </div>

        <div className="price-tag">₱100</div>
        <div className="price-sub">ONE-TIME · FOREVER YOURS</div>

        <ul style={{listStyle:'none', marginBottom:'1.5rem', display:'flex', flexDirection:'column', gap:'0.5rem'}}>
          {['💌 Personalized Lover Tag page','🔐 Lover Pass protection','📸 5 couple photos gallery',
            '💘 Custom love quiz','⏱ Relationship timer','🔗 Unique shareable link',
            '📱 QR Code for your partner'].map(f => (
            <li key={f} style={{fontSize:'0.85rem', color:'var(--text)', display:'flex', alignItems:'center', gap:'0.5rem'}}>
              {f}
            </li>
          ))}
        </ul>

        {msg ? (
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'2.5rem', marginBottom:'0.8rem'}}>🎉</div>
            <div className="toast success" style={{marginBottom:'1.2rem'}}>{msg}</div>
            {tag.payment_status === 'pending_admin' && (
              <a href="https://www.facebook.com/kenedrian.bucog.5/" target="_blank" rel="noreferrer"
                className="btn-primary" style={{textDecoration:'none', display:'block', textAlign:'center', padding:'0.9rem'}}>
                💬 Message Admin on Facebook →
              </a>
            )}
            <button className="btn-ghost" onClick={() => nav('/dashboard')} style={{marginTop:'0.7rem'}}>
              ← Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            {err && <div className="toast error" style={{marginBottom:'1rem'}}>{err}</div>}

{!method ? (
     <button className="btn-primary" onClick={() => setMethod('admin')}>
       💬 Contact Admin to Pay
     </button>
           
            ) : method === 'gcash' ? (
              <div>
                <div style={{background:'var(--blush)', border:'1px solid var(--border)', borderRadius:16,
                  padding:'1rem', marginBottom:'1rem', fontSize:'0.83rem', color:'var(--muted)', textAlign:'center'}}>
                  You will be redirected to GCash checkout. After payment, come back here automatically.
                </div>
                <button className="btn-primary" onClick={handleGCash} disabled={paying}>
                  {paying ? <div className="spinner" /> : '📱 Proceed to GCash →'}
                </button>
                <button className="btn-ghost" onClick={() => setMethod('')} style={{marginTop:'0.6rem'}}>
                  ← Back
                </button>
              </div>
            ) : (
              <div>
                <div style={{background:'var(--blush)', border:'1px solid var(--border)', borderRadius:16,
                  padding:'1rem', marginBottom:'1rem', fontSize:'0.83rem', color:'var(--text)', lineHeight:1.7}}>
                  <strong>How it works:</strong><br />
                  1. Click the button below to notify the admin<br />
                  2. Message the admin on Facebook<br />
                  3. Pay ₱100 via GCash to the admin<br />
                  4. Admin will activate your Lover Tag 💚
                </div>
                <button className="btn-primary" onClick={handleContactAdmin} disabled={paying}>
                  {paying ? <div className="spinner" /> : '📨 Notify Admin & Get FB Link'}
                </button>
                <button className="btn-ghost" onClick={() => setMethod('')} style={{marginTop:'0.6rem'}}>
                  ← Back
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AlreadyPaid({ tag }) {
  const nav = useNavigate();
  const tagUrl = `${window.location.origin}/tag/${tag.slug}`;
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(tagUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="page-center">
      <PetalBg />
      <div className="card" style={{textAlign:'center'}}>
        <div style={{fontSize:'2.5rem', marginBottom:'0.5rem'}}>🎉</div>
        <div className="logo" style={{marginBottom:'0.2rem'}}>Already Active!</div>
        <div style={{fontSize:'0.85rem', color:'var(--muted)', marginBottom:'1.5rem'}}>
          Your Lover Tag is live 💚
        </div>
        <div className="couple-row" style={{marginBottom:'1.2rem'}}>
          <span className="name-boy">{tag.boy_name}</span>
          <span className="heart-beat">♥</span>
          <span className="name-girl">{tag.girl_name}</span>
        </div>
        <div className="share-link" onClick={copy}>{copied ? '✓ Copied!' : tagUrl}</div>
        <button className="btn-primary" onClick={() => nav(`/tag/${tag.slug}`)} style={{marginTop:'1rem'}}>
          View Lover Tag →
        </button>
        <button className="btn-ghost" onClick={() => nav('/dashboard')} style={{marginTop:'0.6rem'}}>
          ← Dashboard
        </button>
      </div>
    </div>
  );
}
