import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PetalBg from '../components/PetalBg';
import LoverCard from '../components/LoverCard';

export default function TagViewPage() {
  const { slug } = useParams();
  const [tag, setTag]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [pass, setPass]         = useState('');
  const [err, setErr]           = useState('');
  const [shaking, setShaking]   = useState(false);
  const sessionKey              = `lt_unlocked_${slug}`;

  useEffect(() => {
    supabase.from('lover_tags').select('*').eq('slug', slug).eq('active', true)
      .single().then(({ data }) => { setTag(data); setLoading(false); });

    if (sessionStorage.getItem(sessionKey) === '1') setUnlocked(true);
  }, [slug]);

  function tryUnlock() {
    if (!tag) return;
    if (pass === tag.lover_pass) {
      sessionStorage.setItem(sessionKey, '1');
      setUnlocked(true);
    } else {
      setShaking(true);
      setErr('Wrong Lover Pass 💔 Try again!');
      setTimeout(() => { setShaking(false); setErr(''); }, 2000);
    }
  }

  if (loading) return (
    <div className="page-center">
      <div className="spinner" style={{borderTopColor:'var(--crimson)', borderColor:'var(--petal)'}} />
    </div>
  );

  if (!tag) return (
    <div className="page-center">
      <PetalBg />
      <div className="card" style={{textAlign:'center'}}>
        <div style={{fontSize:'3rem', marginBottom:'1rem'}}>💔</div>
        <div className="logo" style={{marginBottom:'0.5rem'}}>Not Found</div>
        <p style={{fontSize:'0.85rem', color:'var(--muted)'}}>This love story doesn't exist... or hasn't been activated yet.</p>
      </div>
    </div>
  );

  if (!unlocked) return (
    <div className="page-center">
      <PetalBg />
      <div className={`card ${shaking ? 'shake-anim' : ''}`}>
        <div className="logo">LOVER TAG</div>
        <div className="logo-sub">A digital love letter</div>

        <div className="couple-row">
          <span className="name-boy">{tag.boy_name}</span>
          <span className="heart-beat">♥</span>
          <span className="name-girl">{tag.girl_name}</span>
        </div>

        <p style={{fontSize:'0.82rem', color:'var(--muted)', textAlign:'center', marginBottom:'1.2rem'}}>
          🔐 Enter your Lover Pass to open this page
        </p>
        <div className="field">
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && tryUnlock()}
            placeholder="••••••••"
            style={{textAlign:'center', letterSpacing:'0.15em'}}
            autoFocus
          />
        </div>
        {err && <div className="toast error">{err}</div>}
        <button className="btn-primary" onClick={tryUnlock} style={{marginTop:'0.8rem'}}>
          Enter Our World 💕
        </button>

        <div style={{marginTop:'1.8rem', textAlign:'center', fontSize:'0.75rem', color:'var(--muted)', lineHeight:1.8}}>
          Want this for your love? 💌<br />
          <a href="https://www.facebook.com/kenedrian.bucog.5/" target="_blank" rel="noreferrer"
            style={{color:'var(--crimson)', fontWeight:600, textDecoration:'none'}}>
            Click here to get yours →
          </a>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          10%,90% { transform: translateX(-3px); }
          20%,80%  { transform: translateX(5px); }
          30%,50%,70% { transform: translateX(-5px); }
          40%,60%  { transform: translateX(5px); }
        }
        .shake-anim { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97); }
      `}</style>
    </div>
  );

  return <TagMain tag={tag} />;
}

// ── The actual lover tag page ──────────────────────────────────
function TagMain({ tag }) {
  const [lbOpen, setLbOpen]   = useState(false);
  const [lbIdx, setLbIdx]     = useState(0);
  const [music, setMusic]     = useState(false);
  const [counter, setCounter] = useState({});
  const [msgText, setMsgText] = useState('');
  const [showCard, setShowCard] = useState(false);

  const [quizIdx, setQuizIdx]   = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [chosen, setChosen]     = useState('');

  const audioRef = useRef(null);

  // Counter
  useEffect(() => {
    const start = new Date(tag.start_date);
    function tick() {
      const now  = new Date();
      const diff = now - start;
      const ts   = Math.floor(diff / 1000);
      const s    = ts % 60;
      const tm   = Math.floor(ts / 60);
      const mi   = tm % 60;
      const th   = Math.floor(tm / 60);
      const h    = th % 24;
      const td   = Math.floor(th / 24);
      const y    = Math.floor(td / 365.25);
      const mo   = Math.floor((td % 365.25) / 30.44);
      const d    = Math.floor((td % 365.25) % 30.44);
      setCounter({ y, mo, d, h, mi, s });
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [tag.start_date]);

  // Typewriter
  useEffect(() => {
    let i = 0;
    setMsgText('');
    const t = setInterval(() => {
      if (i >= tag.message.length) { clearInterval(t); return; }
      setMsgText(prev => prev + tag.message[i++]);
    }, 36);
    return () => clearInterval(t);
  }, [tag.message]);

  function toggleMusic() {
    if (!audioRef.current) return;
    if (music) { audioRef.current.pause(); setMusic(false); }
    else { audioRef.current.play().catch(() => {}); setMusic(true); }
  }

  function openLb(i) { setLbIdx(i); setLbOpen(true); }
  function lbPrev()  { setLbIdx(p => (p - 1 + tag.photos.length) % tag.photos.length); }
  function lbNext()  { setLbIdx(p => (p + 1) % tag.photos.length); }

  const quiz = tag.quiz || [];
  function answerQuiz(opt) {
    if (answered) return;
    setChosen(opt);
    setAnswered(true);
    if (opt === quiz[quizIdx].ans) setQuizScore(s => s+1);
    setTimeout(() => {
      if (quizIdx + 1 >= quiz.length) setQuizDone(true);
      else { setQuizIdx(i => i+1); setAnswered(false); setChosen(''); }
    }, 900);
  }
  function restartQuiz() { setQuizIdx(0); setQuizScore(0); setQuizDone(false); setAnswered(false); setChosen(''); }

  const scoreMsg = ['Keep trying! Love never gives up 💕','Not bad! Love is a journey 💑',
    'Good job! You know each other 💘','Great! True love shines 🌹','PERFECT! Soul mates forever 🥰💍'];

  return (
    <div style={{minHeight:'100vh', background:'var(--cream)', position:'relative'}}>
      <PetalBg />
      <canvas id="confetti-canvas" />

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">LOVER TAG</div>
        <div className="nav-right">
          <button className="nav-btn" onClick={toggleMusic}>
            {music ? '🔇' : '🎵'} Music
          </button>
          <button className="nav-btn" onClick={() => setShowCard(true)}>
            💌 Card
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero-wrap">
        <div className="hero-tag">💌 Your Love Story</div>
        <div className="hero-names">
          <span className="name-boy">{tag.boy_name}</span>
          <span className="heart-beat">♥</span>
          <span className="name-girl">{tag.girl_name}</span>
        </div>
        <div className="status-badge">{tag.status_text}</div>
      </div>

      <div style={{position:'relative', zIndex:1}}>
        {/* COUNTER */}
        <div className="main-section">
          <div className="sec-label">Together since 💕</div>
          <div className="counter-wrap">
            <div className="counter-grid" style={{marginBottom:'0.7rem'}}>
              {[['y','Years'],['mo','Months'],['d','Days']].map(([k,u]) => (
                <div className="counter-card" key={k}>
                  <div className="counter-num">{counter[k] ?? 0}</div>
                  <div className="counter-unit">{u}</div>
                </div>
              ))}
            </div>
            <div className="counter-grid counter-sm">
              {[['h','Hours'],['mi','Minutes'],['s','Seconds']].map(([k,u]) => (
                <div className="counter-card" key={k}>
                  <div className="counter-num">{String(counter[k] ?? 0).padStart(2,'0')}</div>
                  <div className="counter-unit">{u}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MESSAGE */}
        <div className="main-section">
          <div className="sec-label">A message for you 💌</div>
          <div className="msg-card">{msgText}<span style={{borderRight:'2px solid var(--crimson)'}}>‌</span></div>
        </div>

        {/* GALLERY */}
        {tag.photos?.length > 0 && (
          <div className="main-section">
            <div className="sec-label">Our moments 📸</div>
            <div className="gallery-grid">
              {tag.photos.map((url, i) => (
                <div className="gallery-item" key={i} onClick={() => openLb(i)}>
                  <img src={url} alt={`Moment ${i+1}`} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUIZ */}
        {quiz.length > 0 && (
          <div className="main-section">
            <div className="sec-label">Love quiz 💘</div>
            <div className="quiz-card">
              {!quizDone ? (
                <>
                  <div className="quiz-progress">Question {quizIdx+1} of {quiz.length}</div>
                  <div className="quiz-q">{quiz[quizIdx].q}</div>
                  <div className="quiz-opts">
                    {quiz[quizIdx].opts.map(opt => {
                      let cls = 'quiz-opt';
                      if (answered && opt === quiz[quizIdx].ans) cls += ' correct';
                      else if (answered && opt === chosen) cls += ' wrong';
                      return (
                        <button key={opt} className={cls} disabled={answered} onClick={() => answerQuiz(opt)}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{textAlign:'center', padding:'1rem 0'}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:'2.8rem', fontWeight:700,
                    color:'var(--crimson)', marginBottom:'0.4rem'}}>
                    {quizScore}/{quiz.length}
                  </div>
                  <div style={{fontSize:'0.9rem', color:'var(--muted)', marginBottom:'1.2rem'}}>
                    {scoreMsg[Math.min(quizScore, scoreMsg.length-1)]}
                  </div>
                  <button className="btn-ghost" onClick={restartQuiz} style={{width:'auto', padding:'0.65rem 1.8rem'}}>
                    Try again 💕
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="site-footer">
          <div>Made with ♥ by <strong>LOVER TAG</strong></div>
          <div style={{marginTop:'0.4rem'}}>
            Want this for your love? 💌<br />
            <a href="https://www.facebook.com/kenedrian.bucog.5/" target="_blank" rel="noreferrer">
              Click here to get yours →
            </a>
          </div>
        </footer>
      </div>

      {/* LIGHTBOX */}
      {lbOpen && (
        <div className="lightbox open">
          <button className="lb-close" onClick={() => setLbOpen(false)}>✕</button>
          <img src={tag.photos[lbIdx]} alt="" />
          <div className="lb-controls">
            <button className="lb-btn" onClick={lbPrev}>‹</button>
            <div className="lb-dots">
              {tag.photos.map((_, i) => (
                <div key={i} className={`lb-dot ${i===lbIdx?'active':''}`} onClick={() => setLbIdx(i)} />
              ))}
            </div>
            <button className="lb-btn" onClick={lbNext}>›</button>
          </div>
        </div>
      )}

      {/* LOVER CARD MODAL */}
      {showCard && <LoverCard tag={tag} onClose={() => setShowCard(false)} />}

      {/* AUDIO */}
      <audio ref={audioRef} loop src={tag.music_url || ''} />
    </div>
  );
}
