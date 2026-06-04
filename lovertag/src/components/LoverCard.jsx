import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

export default function LoverCard({ tag, onClose }) {
  const qrRef  = useRef(null);
  const [copied, setCopied] = useState(false);
  const tagUrl = `${window.location.origin}/tag/${tag.slug}`;

  useEffect(() => {
    if (qrRef.current) {
      QRCode.toCanvas(qrRef.current, tagUrl, {
        width: 160,
        color: { dark: '#a33352', light: '#fff0f3' },
        margin: 2,
      });
    }
  }, [tagUrl]);

  function copy() {
    navigator.clipboard.writeText(tagUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Compute how long together
  const start = new Date(tag.start_date);
  const now   = new Date();
  const diffMs = now - start;
  const diffDays = Math.floor(diffMs / 86400000);
  const years  = Math.floor(diffDays / 365.25);
  const months = Math.floor((diffDays % 365.25) / 30.44);

  const duration = years > 0
    ? `${years} year${years>1?'s':''}, ${months} month${months!==1?'s':''}`
    : `${months} month${months!==1?'s':''}`;

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:500,
      background:'rgba(20,5,10,0.88)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'1.5rem',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{maxWidth:380, width:'100%', display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem'}}>

        {/* THE CARD */}
        <div className="lt-card" id="lover-card">
          {/* Top decoration */}
          <div style={{display:'flex', justifyContent:'center', gap:'0.4rem', marginBottom:'1.2rem', opacity:0.5}}>
            {['♥','✦','♥','✦','♥'].map((s,i) => (
              <span key={i} style={{color:'var(--crimson)', fontSize:'0.8rem'}}>{s}</span>
            ))}
          </div>

          {/* Logo */}
          <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:'0.7rem', letterSpacing:'0.35em',
            textTransform:'uppercase', color:'var(--muted)', marginBottom:'0.8rem'}}>
            LOVER TAG
          </div>

          {/* Names */}
          <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:'2rem', fontWeight:700, lineHeight:1.1,
            marginBottom:'0.3rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem',
            flexWrap:'wrap'}}>
            <span style={{color:'#4a7fd4'}}>{tag.boy_name}</span>
            <span style={{color:'var(--crimson)', animation:'hbeat 1.3s ease-in-out infinite',
              display:'inline-block'}}>♥</span>
            <span style={{color:'var(--crimson)'}}>{tag.girl_name}</span>
          </div>

          {/* Status */}
          <div style={{fontSize:'0.78rem', color:'var(--muted)', marginBottom:'0.2rem', fontStyle:'italic'}}>
            {tag.status_text}
          </div>

          {/* Duration */}
          <div style={{fontSize:'0.72rem', letterSpacing:'0.12em', textTransform:'uppercase',
            color:'var(--crimson)', fontWeight:600, marginBottom:'1.5rem'}}>
            {duration} together 💕
          </div>

          {/* Divider */}
          <div style={{height:1, background:'linear-gradient(to right, transparent, var(--petal), transparent)',
            marginBottom:'1.5rem'}} />

          {/* QR Code */}
          <div className="qr-wrap">
            <canvas ref={qrRef} style={{borderRadius:12, border:'4px solid white', boxShadow:'0 4px 16px rgba(180,60,90,0.12)'}} />
            <div style={{fontSize:'0.72rem', color:'var(--muted)', letterSpacing:'0.08em'}}>
              Scan to open 📱
            </div>
          </div>

          {/* Bottom decoration */}
          <div style={{display:'flex', justifyContent:'center', gap:'0.4rem', marginTop:'1.2rem', opacity:0.4}}>
            {['✦','♥','✦','♥','✦'].map((s,i) => (
              <span key={i} style={{color:'var(--crimson)', fontSize:'0.75rem'}}>{s}</span>
            ))}
          </div>
        </div>

        {/* Share link */}
        <div onClick={copy} className="share-link" style={{width:'100%', cursor:'pointer'}}>
          {copied ? '✓ Copied to clipboard!' : tagUrl}
        </div>

        {/* Buttons */}
        <div style={{display:'flex', gap:'0.7rem', width:'100%'}}>
          <button className="btn-ghost" onClick={copy} style={{flex:1}}>
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
          <button className="btn-ghost" onClick={onClose} style={{flex:1}}>
            ✕ Close
          </button>
        </div>

        <div style={{fontSize:'0.73rem', color:'rgba(255,255,255,0.45)', textAlign:'center'}}>
          Share this link or QR with your partner 💕
        </div>
      </div>
    </div>
  );
}
