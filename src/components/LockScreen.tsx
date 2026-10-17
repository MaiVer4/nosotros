import React, { useState, useEffect } from 'react';
import { Heart, Lock, KeyRound, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f43f68', '#fecdd6', '#fb718d', '#d7b77f'],
      });
      setTimeout(() => {
        onUnlock();
      }, 350);
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
      }, 700);
    }
  };

  // Keyboard support
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-[#FFF0F2] via-[#FDF8F5] to-[#FCEEE9] min-h-[100dvh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-xs sm:max-w-sm p-6 sm:p-8 text-center bg-white/95 rounded-3xl smooth-card border border-rose-100"
      >
        {/* Monogram Icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative mx-auto mb-4 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-rose-300 shadow-md text-white"
        >
          <Heart className="w-8 h-8 sm:w-10 sm:h-10 fill-white" />
          <span className="absolute -top-1 -right-1 p-1 bg-champagne-400 rounded-full text-white shadow">
            <Sparkles className="w-3 h-3" />
          </span>
        </motion.div>

        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-800 tracking-tight mb-1">
          Maicol & Vanessa
        </h1>
        <p className="font-handwriting text-lg sm:text-xl text-rose-600 mb-5">
          Nuestra historia, recuerdos & Vaiolet
        </p>

        {/* Lock instructions */}
        <div className="flex items-center justify-center gap-1.5 mb-3 text-[11px] font-medium text-stone-400 uppercase tracking-widest">
          <Lock className="w-3 h-3 text-rose-500" />
          <span>Ingresa el PIN de acceso</span>
        </div>

        {/* PIN visual indicators with spring */}
        <motion.div
          animate={error ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex justify-center gap-3 sm:gap-4 mb-6"
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <motion.div
                key={index}
                animate={isFilled ? { scale: 1.25 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-colors ${
                  error
                    ? 'bg-red-400'
                    : isFilled
                    ? 'bg-rose-500 shadow-sm shadow-rose-300'
                    : 'border-2 border-stone-300 bg-stone-100'
                }`}
              />
            );
          })}
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-semibold text-red-500 mb-3"
            >
              Código incorrecto. Vuelve a intentarlo.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Digital Numpad with Spring Feedback */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-[220px] sm:max-w-[240px] mx-auto mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <motion.button
              key={digit}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => handleDigit(digit)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-50 hover:bg-rose-50 text-stone-700 hover:text-rose-600 font-medium text-xl shadow-sm border border-stone-200/80 transition-colors flex items-center justify-center select-none"
            >
              {digit}
            </motion.button>
          ))}
          <div />
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => handleDigit('0')}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-50 hover:bg-rose-50 text-stone-700 hover:text-rose-600 font-medium text-xl shadow-sm border border-stone-200/80 transition-colors flex items-center justify-center select-none"
          >
            0
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={handleBackspace}
            aria-label="Borrar dígito"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-50 hover:bg-rose-50 text-stone-500 hover:text-rose-600 font-medium text-sm shadow-sm border border-stone-200/80 transition-colors flex items-center justify-center select-none"
          >
            ←
          </motion.button>
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

        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-2.5 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200/60 overflow-hidden"
            >
              💡 Pista: Día y mes de nuestra fecha especial (11 de julio: 1107)
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
