import React, { useMemo } from 'react';

interface HeartParticle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  symbol: string;
}

export const FloatingHearts: React.FC = () => {
  // Ultra-lightweight particles with GPU composition
  const particles = useMemo<HeartParticle[]>(() => {
    const isSmall = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isSmall ? 8 : 14;
    const symbols = ['✨', '🌸', '💖'];

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.floor(Math.random() * 92) + 4,
      size: Math.floor(Math.random() * 12) + 12,
      duration: Math.floor(Math.random() * 8) + 12,
      delay: Math.floor(Math.random() * 6),
      opacity: Math.random() * 0.25 + 0.15,
      symbol: symbols[i % symbols.length],
    }));
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{ transform: 'translateZ(0)' }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute select-none animate-float-slow"
          style={{
            left: `${p.left}%`,
            top: `${(p.id * 7) % 95}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            willChange: 'transform',
            transform: 'translate3d(0, 0, 0)',
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
};
