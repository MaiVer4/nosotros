import React, { useState, useEffect } from 'react';
import { Heart, Lock, KeyRound, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LockScreenProps {
  correctPin: string;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ correctPin, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const verifyPin = (candidate: string) => {
    if (candidate === correctPin) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f68', '#fecdd6', '#fb718d', '#d7b77f'],
      });
      setTimeout(() => {
        onUnlock();
      }, 500);
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
      }, 800);
    }
  };

  // Allow physical keyboard typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-[#FFF0F2] via-[#FDF8F5] to-[#FCEEE9]">
      {/* Background romantic blur accents */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-rose-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-champagne-200/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm p-8 text-center bg-white/85 backdrop-blur-xl rounded-3xl romantic-shadow border border-rose-100 transition-all">
        {/* Avatars & Hearts icon */}
        <div className="relative mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-tr from-rose-400 to-rose-200 shadow-lg text-white">
          <Heart className="w-10 h-10 fill-white animate-pulse" />
          <span className="absolute -top-1 -right-1 p-1.5 bg-champagne-400 rounded-full text-white shadow">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>

        <h1 className="font-serif text-3xl font-semibold text-stone-800 tracking-tight mb-1">
          Maicol & Vanessa
        </h1>
        <p className="font-handwriting text-xl text-rose-600 mb-6">
          Nuestra historia, recuerdos & Vaiolet
        </p>

        {/* Lock icon and instructions */}
        <div className="flex items-center justify-center gap-2 mb-4 text-xs font-medium text-stone-500 uppercase tracking-widest">
          <Lock className="w-3.5 h-3.5 text-rose-500" />
          <span>Ingresa el PIN de acceso</span>
        </div>

        {/* PIN visual indicators */}
        <div
          className={`flex justify-center gap-4 mb-8 transition-transform ${
            error ? 'animate-bounce' : ''
          }`}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  error
                    ? 'bg-red-400 scale-110'
                    : isFilled
                    ? 'bg-rose-500 scale-125 shadow-md shadow-rose-300'
                    : 'border-2 border-stone-300 bg-stone-100'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-sm font-medium text-red-500 mb-4 animate-fade-in">
            Código incorrecto. Vuelve a intentarlo con amor.
          </p>
        )}

        {/* Digital Numpad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="w-16 h-16 rounded-2xl bg-stone-50 hover:bg-rose-50 active:scale-95 text-stone-700 hover:text-rose-600 font-medium text-xl shadow-sm border border-stone-200/60 transition-all flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="w-16 h-16 rounded-2xl bg-stone-50 hover:bg-rose-50 active:scale-95 text-stone-700 hover:text-rose-600 font-medium text-xl shadow-sm border border-stone-200/60 transition-all flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            aria-label="Borrar dígito"
            className="w-16 h-16 rounded-2xl bg-stone-50 hover:bg-rose-50 active:scale-95 text-stone-500 hover:text-rose-600 font-medium text-sm shadow-sm border border-stone-200/60 transition-all flex items-center justify-center"
          >
            ←
          </button>
        </div>

        {/* Hint toggle */}
        <button
          type="button"
          onClick={() => setShowHint(!showHint)}
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-rose-500 transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>{showHint ? 'Ocultar pista' : '¿Necesitas una pista?'}</span>
        </button>

        {showHint && (
          <div className="mt-2 p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200/60 transition-all">
            💡 Pista: Día y mes de nuestra fecha especial (11 de julio)
          </div>
        )}
      </div>
    </div>
  );
};
