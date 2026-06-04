import { useEffect, useRef } from 'react';

const COLORS = ['#ffc2cc','#ffb3c1','#ffe4e8','#f9a8d4','#ffd6dc'];

export default function PetalBg() {
  const ref = useRef(null);

  useEffect(() => {
    const bg = ref.current;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'petal';
      const size = 5 + Math.random() * 8;
      p.style.cssText = `
        left:${Math.random() * 100}%;
        width:${size}px; height:${size}px;
        animation-duration:${7 + Math.random() * 8}s;
        animation-delay:${Math.random() * 12}s;
        background:${COLORS[Math.floor(Math.random() * COLORS.length)]};
      `;
      bg.appendChild(p);
    }
    return () => { if (bg) bg.innerHTML = ''; };
  }, []);

  return <div className="petal-bg" ref={ref} />;
}
