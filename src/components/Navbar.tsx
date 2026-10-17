import React, { useState, useEffect } from 'react';
import { Heart, Lock, Plus, Baby, BookOpen, Clock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavbarProps {
  onLock: () => void;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLock, onOpenAddModal }) => {
  const [activeTab, setActiveTab] = useState<'tiempo' | 'vaiolet' | 'historia' | 'cartas'>('tiempo');

  // Track scroll position to update active tab
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vaioletEl = document.getElementById('vaiolet');
      const historiaEl = document.getElementById('historia');
      const cartasEl = document.getElementById('cartas');

      if (cartasEl && scrollY >= cartasEl.offsetTop - 300) {
        setActiveTab('cartas');
      } else if (historiaEl && scrollY >= historiaEl.offsetTop - 300) {
        setActiveTab('historia');
      } else if (vaioletEl && scrollY >= vaioletEl.offsetTop - 300) {
        setActiveTab('vaiolet');
      } else {
        setActiveTab('tiempo');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Navbar for Desktop & Mobile Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-rose-100 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          {/* Monogram / Brand */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-rose-500 to-rose-300 flex items-center justify-center text-white shadow-sm">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            </div>
            <span className="font-serif font-bold text-base sm:text-lg text-stone-800 tracking-tight">
              Maicol <span className="text-rose-500 font-sans font-normal">&</span> Vanessa
            </span>
          </a>

          {/* Desktop Navigation links */}
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-stone-600">
            <a
              href="#tiempo"
              className={`flex items-center gap-1.5 transition-colors ${
                activeTab === 'tiempo' ? 'text-rose-600 font-semibold' : 'hover:text-rose-600'
              }`}
            >
              <Clock className="w-4 h-4 text-rose-400" />
              <span>Tiempo Juntos</span>
            </a>
            <a
              href="#vaiolet"
              className={`flex items-center gap-1.5 transition-colors ${
                activeTab === 'vaiolet' ? 'text-rose-600 font-semibold' : 'hover:text-rose-600'
              }`}
            >
              <Baby className="w-4 h-4 text-rose-400" />
              <span>Vaiolet</span>
            </a>
            <a
              href="#historia"
              className={`flex items-center gap-1.5 transition-colors ${
                activeTab === 'historia' ? 'text-rose-600 font-semibold' : 'hover:text-rose-600'
              }`}
            >
              <BookOpen className="w-4 h-4 text-rose-400" />
              <span>Línea del Tiempo</span>
            </a>
            <a
              href="#cartas"
              className={`flex items-center gap-1.5 transition-colors ${
                activeTab === 'cartas' ? 'text-rose-600 font-semibold' : 'hover:text-rose-600'
              }`}
            >
              <Mail className="w-4 h-4 text-rose-400" />
              <span>Cartas Secretas</span>
            </a>
          </nav>

          {/* Desktop Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Recuerdo</span>
            </button>

            <button
              type="button"
              onClick={onLock}
              title="Bloquear web"
              className="p-2 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Bottom Tab Bar for Mobile (Native App Style) */}
      <div className="sm:hidden fixed bottom-3 left-3 right-3 z-40">
        <nav className="bg-white/95 border border-rose-200/90 rounded-2xl shadow-xl px-2 py-1.5 flex items-center justify-between">
          {/* Tab 1: Inicio */}
          <a
            href="#tiempo"
            onClick={() => setActiveTab('tiempo')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-all ${
              activeTab === 'tiempo' ? 'text-rose-600 font-bold scale-105' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <Clock className="w-4 h-4 mb-0.5" />
            <span>Inicio</span>
          </a>

          {/* Tab 2: Vaiolet */}
          <a
            href="#vaiolet"
            onClick={() => setActiveTab('vaiolet')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-all ${
              activeTab === 'vaiolet' ? 'text-rose-600 font-bold scale-105' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <Baby className="w-4 h-4 mb-0.5" />
            <span>Vaiolet</span>
          </a>

          {/* Center Action: Plus Button */}
          <div className="flex items-center justify-center px-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={onOpenAddModal}
              className="w-11 h-11 -mt-4 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center shadow-lg border-2 border-white"
              title="Añadir Recuerdo"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Tab 3: Recuerdos */}
          <a
            href="#historia"
            onClick={() => setActiveTab('historia')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-all ${
              activeTab === 'historia' ? 'text-rose-600 font-bold scale-105' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span>Recuerdos</span>
          </a>

          {/* Tab 4: Cartas */}
          <a
            href="#cartas"
            onClick={() => setActiveTab('cartas')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-all ${
              activeTab === 'cartas' ? 'text-rose-600 font-bold scale-105' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <Mail className="w-4 h-4 mb-0.5" />
            <span>Cartas</span>
          </a>
        </nav>
      </div>
    </>
  );
};
