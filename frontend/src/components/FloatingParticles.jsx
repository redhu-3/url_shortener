import { useEffect, useState } from 'react';
import './FloatingParticles.css';

export default function FloatingParticles() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const buildParticles = () => {
      const cs = getComputedStyle(document.documentElement);
      const colors = [
        cs.getPropertyValue('--p1').trim() || '#c9697a',
        cs.getPropertyValue('--p2').trim() || '#e8a0ad',
        cs.getPropertyValue('--p3').trim() || '#c9a96e',
        cs.getPropertyValue('--p4').trim() || '#e8cc9d',
        cs.getPropertyValue('--p5').trim() || 'rgba(247,244,240,0.6)',
      ];
      return Array.from({ length: 28 }, (_, i) => {
        const size = Math.random() * 3 + 3;
        const left = Math.random() * 100;
        const delay = Math.random() * -20;
        const duration = Math.random() * 12 + 8;
        const color = colors[Math.floor(Math.random() * colors.length)];
        return { id: i, size, left, delay, duration, color };
      });
    };
    setParticles(buildParticles());

    /* re-build when theme toggles */
    const obs = new MutationObserver(() => setParticles(buildParticles()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="floating-particles-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="floating-particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
