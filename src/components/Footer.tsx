import React from 'react';
import { Heart, Sparkles, Edit3 } from 'lucide-react';
import type { FooterConfig } from '../types';

interface FooterProps {
  partner1: string;
  partner2: string;
  footerConfig: FooterConfig;
  isLiveEditMode?: boolean;
  onEditSection?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  partner1,
  partner2,
  footerConfig,
  isLiveEditMode = false,
  onEditSection,
}) => {
  const year = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 border-t border-rose-100 bg-white/60 backdrop-blur-sm text-center relative">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {isLiveEditMode && onEditSection && (
          <button
            type="button"
            onClick={onEditSection}
            className="mb-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-stone-900 hover:bg-rose-600 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Textos del Pie de Página</span>
          </button>
        )}

        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-4">
          <Heart className="w-5 h-5 fill-rose-500" />
        </div>

        <p className="font-serif text-xl font-bold text-stone-800 mb-1">
          {partner1} & {partner2}
        </p>

        <p className="font-handwriting text-2xl text-rose-600 mb-4 px-2">
          {footerConfig?.quote || '"Esperando con todo el amor a nuestra pequeña Vaiolet"'}
        </p>

        <p className="text-xs text-stone-400 max-w-md leading-relaxed mb-6 px-2">
          {footerConfig?.description ||
            'Nuestra historia comenzó el 11 de julio de 2025. Cada día que pasa es un regalo y el mejor capítulo aún está por comenzar con la llegada de nuestra princesa.'}
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-[11px] text-rose-700 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>
            {footerConfig?.badgeText || 'Hecho con amor infinito para nuestra familia'} • {year}
          </span>
        </div>
      </div>
    </footer>
  );
};
