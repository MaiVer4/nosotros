import React, { useState } from 'react';
import { Mail, Heart, Sparkles, X } from 'lucide-react';
import type { LoveLetter } from '../types';

interface LoveLettersSectionProps {
  letters: LoveLetter[];
}

export const LoveLettersSection: React.FC<LoveLettersSectionProps> = ({ letters }) => {
  const [activeLetter, setActiveLetter] = useState<LoveLetter | null>(null);

  return (
    <section id="cartas" className="py-16 px-4 bg-gradient-to-b from-transparent via-[#FFF2F4]/50 to-transparent">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Mail className="w-4 h-4 text-rose-500" />
            <span>Cápsula del Tiempo & Palabras del Alma</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-800 tracking-tight mb-3">
            Cartas "Ábreme Cuando..."
          </h2>
          <p className="font-handwriting text-2xl text-rose-600">
            Sobres sellados con promesas, fuerza y recuerdos para los momentos clave de nuestras vidas
          </p>
        </div>

        {/* Grid of Interactive Envelopes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {letters.map((letter) => (
            <div
              key={letter.id}
              onClick={() => setActiveLetter(letter)}
              className="group cursor-pointer p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-rose-200/80 polaroid-shadow hover:-translate-y-2 hover:border-rose-300 transition-all flex flex-col justify-between relative overflow-hidden"
            >
              {/* Envelope flap aesthetic */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-300 via-rose-500 to-rose-300" />

              <div>
                {/* Wax Seal icon */}
                <div
                  className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: letter.sealColor || '#f43f68' }}
                >
                  <Heart className="w-6 h-6 fill-white" />
                </div>

                <div className="text-center mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
                    De: {letter.author} • Para: {letter.recipient}
                  </span>
                  <h3 className="font-serif text-base font-bold text-stone-800 leading-snug">
                    {letter.title}
                  </h3>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 text-center mb-4">
                  <p className="font-handwriting text-sm text-stone-700">
                    "{letter.openWhen}"
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 text-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 group-hover:text-rose-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Romper sello y leer</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Letter Modal (Open Letter) */}
      {activeLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-10 bg-[#FFFDF9] rounded-3xl shadow-2xl border-2 border-rose-200 text-stone-800">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setActiveLetter(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Vintage letter header */}
            <div className="text-center pb-6 border-b border-rose-200/80 mb-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-rose-500 block mb-1">
                Carta Especial • {activeLetter.openWhen}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {activeLetter.title}
              </h3>
              <span className="text-xs text-stone-400 mt-1 block">
                Escrita con amor el{' '}
                {new Date(activeLetter.dateWritten).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Letter text formatted like handwritten stationery */}
            <div className="font-serif text-base sm:text-lg leading-relaxed text-stone-700 whitespace-pre-line mb-8 bg-[#FAF6F0] p-6 rounded-2xl border border-stone-200/60">
              {activeLetter.content}
            </div>

            {/* Signature footer */}
            <div className="flex justify-between items-center pt-4 border-t border-rose-200/80">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Para siempre nosotros</span>
              </div>

              <button
                type="button"
                onClick={() => setActiveLetter(null)}
                className="px-5 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Cerrar y guardar en el corazón
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
