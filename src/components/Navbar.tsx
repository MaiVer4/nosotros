import React from 'react';
import { Heart, Lock, PlusCircle, Baby, BookOpen, Clock } from 'lucide-react';

interface NavbarProps {
  onLock: () => void;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLock, onOpenAddModal }) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 border-b border-rose-100/70 transition-all">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Monogram / Brand */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-400 to-rose-200 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <span className="font-serif font-bold text-lg text-stone-800 tracking-tight">
            Maicol <span className="text-rose-500 font-sans font-normal">&</span> Vanessa
          </span>
        </a>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <a
            href="#tiempo"
            className="flex items-center gap-1.5 hover:text-rose-600 transition-colors"
          >
            <Clock className="w-4 h-4 text-rose-400" />
            <span>Tiempo Juntos</span>
          </a>
          <a
            href="#vaiolet"
            className="flex items-center gap-1.5 hover:text-rose-600 transition-colors"
          >
            <Baby className="w-4 h-4 text-rose-400" />
            <span>Nuestra Hija Vaiolet</span>
          </a>
          <a
            href="#historia"
            className="flex items-center gap-1.5 hover:text-rose-600 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-rose-400" />
            <span>Línea del Tiempo</span>
          </a>
          <a
            href="#cartas"
            className="flex items-center gap-1.5 hover:text-rose-600 transition-colors"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Cartas Secretas</span>
          </a>
        </nav>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Recuerdo</span>
          </button>

          <button
            type="button"
            onClick={onLock}
            title="Bloquear web"
            className="p-2 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
