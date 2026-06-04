import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import PetalBg from '../components/PetalBg';

const EMPTY_QUIZ = { q: '', opts: ['', '', '', ''], ans: '' };

function makeSlug(boy, girl) {
  const clean = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${clean(boy)}-${clean(girl)}-${Math.random().toString(36).slice(2,6)}`;
}

export default function CreateTagPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1 — basics
  const [boyName,   setBoyName]   = useState('');
  const [girlName,  setGirlName]  = useState('');
  const [status,    setStatus]    = useState('Happily Together 💕');
  const [startDate, setStartDate] = useState('');
  const [loverPass, setLoverPass] = useState('');
  const [message,   setMessage]   = useState('');

  // Step 2 — photos
  const [photos, setPhotos]   = useState([]); // [{file, preview}]
  const fileRef = useRef();

  // Step 3 — quiz
  const [quizItems, setQuizItems] = useState([{ ...EMPTY_QUIZ, opts: ['','','',''] }]);

  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');

  // ── PHOTO HANDLERS ──
  function handleFiles(files) {
    const arr = Array.from(files);
    if (photos.length + arr.length > 5) { setErr('Max 5 photos!'); return; }
    const newPhotos = arr.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setPhotos(prev => [...prev, ...newPhotos]);
    setErr('');
  }
  function removePhoto(i) { setPhotos(prev => prev.filter((_,idx) => idx !== i)); }

  // ── QUIZ HANDLERS ──
  function addQuiz() {
    if (quizItems.length >= 5) return;
    setQuizItems(prev => [...prev, { ...EMPTY_QUIZ, opts: ['','','',''] }]);
  }
  function setQField(i, field, val) {
    setQuizItems(prev => prev.map((q,idx) => idx===i ? {...q,[field]:val} : q));
  }
  function setOpt(i, oi, val) {
    setQuizItems(prev => prev.map((q,idx) => idx===i
      ? {...q, opts: q.opts.map((o,oidx) => oidx===oi ? val : o)}
      : q
    ));
  }
  function removeQuiz(i) { setQuizItems(prev => prev.filter((_,idx) => idx !== i)); }

  // ── VALIDATION ──
  function validateStep1() {
    if (!boyName.trim() || !girlName.trim()) { setErr("Enter both names!"); return false; }
    if (!startDate) { setErr("Pick your anniversary date!"); return false; }
    if (!loverPass.trim() || loverPass.length < 4) { setErr("Lover Pass must be at least 4 characters!"); return false; }
    if (!message.trim()) { setErr("Write a love message!"); return false; }
    return true;
  }
  function validateStep2() {
    if (photos.length < 1) { setErr("Upload at least 1 photo!"); return false; }
    return true;
  }
  function validateStep3() {
    for (let i = 0; i < quizItems.length; i++) {
      const q = quizItems[i];
      if (!q.q.trim()) { setErr(`Question ${i+1} is empty!`); return false; }
      if (q.opts.some(o => !o.trim())) { setErr(`Fill all options for question ${i+1}!`); return false; }
      if (!q.ans.trim()) { setErr(`Select the correct answer for question ${i+1}!`); return false; }
    }
    return true;
  }

  function next() {
    setErr('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  }

  // ── SUBMIT ──
  async function submit() {
    setErr('');
    if (!validateStep3()) return;
    setLoading(true);

    try {
      const slug = makeSlug(boyName, girlName);

      // 1. Upload photos to Supabase Storage
      const photoUrls = [];
      for (let i = 0; i < photos.length; i++) {
        const { file } = photos[i];
        const ext  = file.name.split('.').pop();
        const path = `${user.id}/${slug}/photo_${i}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('lover-photos')
          .upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('lover-photos').getPublicUrl(path);
        photoUrls.push(urlData.publicUrl);
      }

      // 2. Insert tag record
      const { data: tag, error: tagErr } = await supabase
        .from('lover_tags')
        .insert({
          user_id:        user.id,
          slug,
          boy_name:       boyName.trim(),
          girl_name:      girlName.trim(),
          status_text:    status.trim(),
          start_date:     startDate,
          lover_pass:     loverPass.trim(),
          message:        message.trim(),
          photos:         photoUrls,
          quiz:           quizItems,
          payment_status: 'unpaid',
          active:         false,
        })
        .select()
        .single();

      if (tagErr) throw tagErr;

      // 3. Go to paywall
      nav(`/pay/${tag.id}`);
    } catch (ex) {
      console.error(ex);
      setErr(ex.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const steps = [1,2,3];

  return (
    <div style={{minHeight:'100vh', background:'var(--cream)', position:'relative'}}>
      <PetalBg />
      <nav className="nav">
        <div className="nav-logo">LOVER TAG 💌</div>
        <button className="nav-btn" onClick={() => nav('/dashboard')}>← Dashboard</button>
      </nav>

      <div style={{maxWidth:520, margin:'0 auto', padding:'2rem 1.5rem', position:'relative', zIndex:1}}>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:'1.8rem', fontWeight:700,
          color:'var(--text)', textAlign:'center', marginBottom:'0.4rem'}}>
          Create Your Lover Tag 🌹
        </h1>
        <p style={{textAlign:'center', color:'var(--muted)', fontSize:'0.82rem', marginBottom:'2rem'}}>
          Fill in your love story — step by step
        </p>

        {/* Step indicator */}
        <div className="steps">
          {steps.map((s, i) => (
            <div key={s} className="step-item">
              <div className={`step-circle ${step > s ? 'done' : step === s ? 'active' : ''}`}>
                {step > s ? '✓' : s}
              </div>
              {i < steps.length-1 && <div className={`step-line ${step > s ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        <div className="card" style={{maxWidth:'100%', animation:'floatIn 0.5s ease both'}}>

          {/* ── STEP 1: Basics ── */}
          {step === 1 && (
            <>
              <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', color:'var(--crimson)',
                textAlign:'center', marginBottom:'1.4rem', fontStyle:'italic'}}>
                Step 1 — Your Love Story
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.7rem'}}>
                <div className="field">
                  <label>His Name 💙</label>
                  <input value={boyName} onChange={e => setBoyName(e.target.value)} placeholder="e.g. Ken" />
                </div>
                <div className="field">
                  <label>Her Name 🩷</label>
                  <input value={girlName} onChange={e => setGirlName(e.target.value)} placeholder="e.g. Mitch" />
                </div>
              </div>
              <div className="field">
                <label>Relationship Status</label>
                <input value={status} onChange={e => setStatus(e.target.value)} placeholder="Happily Together 💕" />
              </div>
              <div className="field">
                <label>Anniversary / Start Date 📅</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{borderRadius:14}} />
              </div>
              <div className="field">
                <label>Lover Pass 🔐 (password for your partner)</label>
                <input value={loverPass} onChange={e => setLoverPass(e.target.value)} placeholder="Min 4 characters" />
              </div>
              <div className="field">
                <label>Love Message 💌</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Write a sweet message to your partner..." style={{minHeight:100}} />
              </div>
            </>
          )}

          {/* ── STEP 2: Photos ── */}
          {step === 2 && (
            <>
              <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', color:'var(--crimson)',
                textAlign:'center', marginBottom:'1.4rem', fontStyle:'italic'}}>
                Step 2 — Your Moments 📸
              </div>
              <p style={{fontSize:'0.8rem', color:'var(--muted)', textAlign:'center', marginBottom:'1rem'}}>
                Upload up to 5 photos of you two together
              </p>
              <div className="upload-zone" onClick={() => fileRef.current.click()}>
                <input ref={fileRef} type="file" accept="image/*" multiple
                  onChange={e => handleFiles(e.target.files)} />
                <div style={{fontSize:'2rem', marginBottom:'0.4rem'}}>📷</div>
                <div style={{fontSize:'0.85rem', color:'var(--muted)'}}>
                  {photos.length === 0 ? 'Tap to upload photos' : `${photos.length}/5 uploaded`}
                </div>
              </div>
              {photos.length > 0 && (
                <div className="upload-grid">
                  {photos.map((p, i) => (
                    <div className="upload-thumb" key={i}>
                      <img src={p.preview} alt="" />
                      <button className="rm-btn" onClick={() => removePhoto(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── STEP 3: Quiz ── */}
          {step === 3 && (
            <>
              <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', color:'var(--crimson)',
                textAlign:'center', marginBottom:'1.4rem', fontStyle:'italic'}}>
                Step 3 — Love Quiz 💘
              </div>
              <p style={{fontSize:'0.8rem', color:'var(--muted)', textAlign:'center', marginBottom:'1.2rem'}}>
                Add up to 5 questions about your relationship
              </p>
              {quizItems.map((q, i) => (
                <div key={i} style={{background:'var(--blush)', borderRadius:16, padding:'1rem', marginBottom:'0.9rem',
                  border:'1px solid var(--border)'}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.7rem'}}>
                    <span style={{fontSize:'0.78rem', fontWeight:600, color:'var(--crimson)'}}>Question {i+1}</span>
                    {quizItems.length > 1 && (
                      <button onClick={() => removeQuiz(i)}
                        style={{background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'0.9rem'}}>
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="field">
                    <label>Question</label>
                    <input value={q.q} onChange={e => setQField(i,'q',e.target.value)}
                      placeholder="e.g. Where did we first meet?" />
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'0.6rem'}}>
                    {q.opts.map((opt, oi) => (
                      <div className="field" key={oi} style={{marginBottom:0}}>
                        <label>Option {oi+1}</label>
                        <input value={opt} onChange={e => setOpt(i, oi, e.target.value)}
                          placeholder={`Option ${oi+1}`} />
                      </div>
                    ))}
                  </div>
                  <div className="field" style={{marginBottom:0}}>
                    <label>Correct Answer (must match one option exactly)</label>
                    <select value={q.ans} onChange={e => setQField(i,'ans',e.target.value)}
                      style={{borderRadius:14}}>
                      <option value="">Select correct answer...</option>
                      {q.opts.filter(o => o.trim()).map((o, oi) => (
                        <option key={oi} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {quizItems.length < 5 && (
                <button className="btn-ghost" onClick={addQuiz} style={{marginBottom:'0.5rem'}}>
                  + Add Question
                </button>
              )}
            </>
          )}

          {err && <div className="toast error" style={{marginBottom:'0.8rem'}}>{err}</div>}

          <div style={{display:'flex', gap:'0.7rem', marginTop:'1rem'}}>
            {step > 1 && (
              <button className="btn-ghost" onClick={() => { setErr(''); setStep(s => s-1); }}
                style={{flex:1}}>
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button className="btn-primary" onClick={next} style={{flex:2}}>
                Next →
              </button>
            ) : (
              <button className="btn-primary" onClick={submit} disabled={loading} style={{flex:2}}>
                {loading ? <div className="spinner" /> : 'Create Lover Tag 🌹'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
