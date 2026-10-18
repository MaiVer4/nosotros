import React, { useState } from 'react';
import { Mail, Heart, Sparkles, X, Edit3, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LoveLetter, LettersSectionConfig } from '../types';

interface LoveLettersSectionProps {
  letters: LoveLetter[];
  lettersConfig: LettersSectionConfig;
  isLiveEditMode?: boolean;
  onEditSection?: () => void;
  onEditLetter?: (id: string) => void;
  onDeleteLetter?: (id: string) => void;
  onAddLetter?: () => void;
}

export const LoveLettersSection: React.FC<LoveLettersSectionProps> = ({
  letters,
  lettersConfig,
  isLiveEditMode = false,
  onEditSection,
  onEditLetter,
  onDeleteLetter,
  onAddLetter,
}) => {
  const [activeLetter, setActiveLetter] = useState<LoveLetter | null>(null);

  return (
    <section id="cartas" className="py-12 sm:py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Live Edit Mode Controls */}
        {isLiveEditMode && (
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
            {onEditSection && (
              <button
                type="button"
                onClick={onEditSection}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-stone-900 hover:bg-rose-600 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Textos de la Sección de Cartas</span>
              </button>
            )}
            {onAddLetter && (
              <button
                type="button"
                onClick={onAddLetter}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nueva Carta Secreta</span>
              </button>
            )}
          </div>
        )}

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-semibold uppercase tracking-wider mb-2.5">
            <Mail className="w-3.5 h-3.5 text-rose-500" />
            <span>{lettersConfig?.sectionBadge || 'Cápsula del Tiempo & Palabras del Alma'}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-800 tracking-tight mb-2">
            {lettersConfig?.sectionTitle || 'Cartas "Ábreme Cuando..."'}
          </h2>
          <p className="font-handwriting text-xl sm:text-2xl text-rose-600 px-2">
            {lettersConfig?.sectionSubtitle ||
              'Sobres sellados con promesas, fuerza y recuerdos para los momentos clave de nuestras vidas'}
          </p>
        </div>

        {/* Grid of Interactive Envelopes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {letters.map((letter) => (
            <motion.div
              key={letter.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveLetter(letter)}
              className="group cursor-pointer p-5 sm:p-6 rounded-3xl smooth-card border border-rose-200/90 flex flex-col justify-between relative overflow-hidden transition-colors hover:border-rose-300"
            >
              {/* Flap accent line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-300 via-rose-500 to-rose-300" />

              <div>
                {/* Live Edit Mode Actions */}
                {isLiveEditMode && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mb-2 p-1.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-1"
                  >
                    {onEditLetter && (
                      <button
                        type="button"
                        onClick={() => onEditLetter(letter.id)}
                        className="px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                    )}
                    {onDeleteLetter && (
                      <button
                        type="button"
                        onClick={() => onDeleteLetter(letter.id)}
                        className="p-1 rounded-md text-red-500 hover:bg-red-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Wax seal */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-11 h-11 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: letter.sealColor || '#f43f68' }}
                >
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                </motion.div>

                <div className="text-center mb-2.5 sm:mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
                    De: {letter.author} • Para: {letter.recipient}
                  </span>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-stone-800 leading-snug">
                    {letter.title}
                  </h3>
                </div>

                <div className="p-2.5 sm:p-3 rounded-2xl bg-rose-50/70 border border-rose-100 text-center mb-3 sm:mb-4">
                  <p className="font-handwriting text-xs sm:text-sm text-stone-700">
                    "{letter.openWhen}"
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-stone-100 text-center">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 group-hover:text-rose-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Romper sello y leer</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Letter Modal (Open Letter) */}
      <AnimatePresence>
        {activeLetter && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto p-6 sm:p-10 bg-[#FFFDF9] rounded-t-3xl sm:rounded-3xl shadow-2xl border-2 border-rose-200 text-stone-800"
            >
              <button
                type="button"
                onClick={() => setActiveLetter(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center pb-4 sm:pb-6 border-b border-rose-200/80 mb-4 sm:mb-6">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-rose-500 block mb-1">
                  Carta Especial • {activeLetter.openWhen}
                </span>
                <h3 className="font-serif text-xl sm:text-3xl font-bold text-stone-900">
                  {activeLetter.title}
                </h3>
                <span className="text-[11px] sm:text-xs text-stone-400 mt-1 block">
                  Escrita con amor el{' '}
                  {new Date(activeLetter.dateWritten).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Letter content */}
              <div className="font-serif text-sm sm:text-base leading-relaxed text-stone-700 whitespace-pre-line mb-6 sm:mb-8 bg-[#FAF6F0] p-4 sm:p-6 rounded-2xl border border-stone-200/70">
                {activeLetter.content}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-rose-200/80">
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Para siempre nosotros</span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setActiveLetter(null)}
                  className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Cerrar carta
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
