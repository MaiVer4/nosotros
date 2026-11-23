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

interface FloatingHeartsProps {
  enabled?: boolean;
  symbols?: string[];
}

const DEFAULT_SYMBOLS = ['✨', '🌸', '💖'];

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({
  enabled = true,
  symbols = DEFAULT_SYMBOLS,
}) => {
  const symbolsKey =
    symbols && symbols.length > 0
      ? symbols.join('|')
      : DEFAULT_SYMBOLS.join('|');

  const particles = useMemo<HeartParticle[]>(() => {
    const activeSymbols = symbolsKey.split('|').filter(Boolean);
    const palette = activeSymbols.length > 0 ? activeSymbols : DEFAULT_SYMBOLS;
    const isSmall = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isSmall ? 8 : 14;

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.floor((i * 93 + 7) % 92) + 4,
      size: (i % 3) * 4 + 12,
      duration: (i % 5) * 2 + 12,
      delay: i % 6,
      opacity: (i % 3) * 0.08 + 0.15,
      symbol: palette[i % palette.length],
    }));
  }, [symbolsKey]);

  if (!enabled) return null;

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
