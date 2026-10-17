import React, { useMemo } from 'react';

interface HeartParticle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const FloatingHearts: React.FC = () => {
  const particles = useMemo<HeartParticle[]>(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.floor(Math.random() * 16) + 12,
      duration: Math.random() * 12 + 10,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.35 + 0.15,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute text-rose-300 select-none animate-float-slow"
          style={{
            left: `${p.left}%`,
            top: `${(p.id * 5) % 100}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.id % 3 === 0 ? '✨' : p.id % 2 === 0 ? '🌸' : '💖'}
        </span>
      ))}
    </div>
  );
};
