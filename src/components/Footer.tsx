import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  partner1: string;
  partner2: string;
  daughterName: string;
  startDate: string;
}

export const Footer: React.FC<FooterProps> = ({
  partner1,
  partner2,
  daughterName,
  startDate,
}) => {
  const year = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 border-t border-rose-100 bg-white/60 backdrop-blur-sm text-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-4">
          <Heart className="w-5 h-5 fill-rose-500" />
        </div>

        <p className="font-serif text-xl font-bold text-stone-800 mb-1">
          {partner1} & {partner2}
        </p>

        <p className="font-handwriting text-2xl text-rose-600 mb-4">
          "Esperando con todo el amor a nuestra pequeña {daughterName}"
        </p>

        <p className="text-xs text-stone-400 max-w-md leading-relaxed mb-6">
          Nuestra historia comenzó el {new Date(startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}. Cada día que pasa es un regalo y el mejor capítulo aún está por comenzar con la llegada de nuestra princesa.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-[11px] text-rose-700 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>Hecho con amor infinito para nuestra familia • {year}</span>
        </div>
      </div>
    </footer>
  );
};
