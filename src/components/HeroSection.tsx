import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Calendar, Baby, Hourglass } from 'lucide-react';
import { calculateElapsedTime, calculateNextAnniversary } from '../utils/timeCalculations';
import type { ElapsedTime, CountdownTime } from '../utils/timeCalculations';

interface HeroSectionProps {
  partner1: string;
  partner2: string;
  startDate: string;
  daughterName: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  partner1,
  partner2,
  startDate,
  daughterName,
}) => {
  const [elapsed, setElapsed] = useState<ElapsedTime>(() => calculateElapsedTime(startDate));
  const [anniversary, setAnniversary] = useState<CountdownTime>(() => calculateNextAnniversary(startDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(calculateElapsedTime(startDate));
      setAnniversary(calculateNextAnniversary(startDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [startDate]);

  return (
    <section id="tiempo" className="relative pt-12 pb-16 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        {/* Romantic subheader tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 border border-rose-200/60 text-rose-700 text-xs font-medium mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Nuestra Historia de Amor Oficial desde el 11 de Julio de 2025</span>
        </div>

        {/* Names Header */}
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-stone-800 tracking-tight mb-4">
          {partner1}{' '}
          <span className="inline-block mx-1 font-handwriting text-rose-500 text-5xl sm:text-7xl font-normal">
            &
          </span>{' '}
          {partner2}
        </h1>

        <p className="font-handwriting text-2xl sm:text-3xl text-rose-600/90 max-w-xl mx-auto mb-10">
          "Un día nos miramos, dijimos que sí, y hoy creamos nuestro propio universo con {daughterName}."
        </p>

        {/* Real-time Relationship Counter Box */}
        <div className="p-6 sm:p-8 rounded-3xl romantic-glass-rose romantic-shadow mb-8 relative border border-rose-200/80">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
            <h2 className="text-sm uppercase tracking-widest font-semibold text-rose-900">
              Tiempo Compartiendo Nuestras Vidas
            </h2>
          </div>

          {/* Grid of live counter units */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 max-w-2xl mx-auto">
            <div className="p-3 sm:p-4 rounded-2xl bg-white/90 shadow-sm border border-rose-100 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-rose-600">
                {elapsed.years}
              </span>
              <span className="text-[11px] sm:text-xs uppercase font-medium text-stone-500 mt-1">
                {elapsed.years === 1 ? 'Año' : 'Años'}
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white/90 shadow-sm border border-rose-100 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-rose-600">
                {elapsed.months}
              </span>
              <span className="text-[11px] sm:text-xs uppercase font-medium text-stone-500 mt-1">
                {elapsed.months === 1 ? 'Mes' : 'Meses'}
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white/90 shadow-sm border border-rose-100 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-rose-600">
                {elapsed.days}
              </span>
              <span className="text-[11px] sm:text-xs uppercase font-medium text-stone-500 mt-1">
                {elapsed.days === 1 ? 'Día' : 'Días'}
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white/90 shadow-sm border border-rose-100 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-rose-600">
                {String(elapsed.hours).padStart(2, '0')}
              </span>
              <span className="text-[11px] sm:text-xs uppercase font-medium text-stone-500 mt-1">
                Horas
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white/90 shadow-sm border border-rose-100 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-rose-600">
                {String(elapsed.minutes).padStart(2, '0')}
              </span>
              <span className="text-[11px] sm:text-xs uppercase font-medium text-stone-500 mt-1">
                Minutos
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white/90 shadow-sm border border-rose-100 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-rose-600 tabular-nums">
                {String(elapsed.seconds).padStart(2, '0')}
              </span>
              <span className="text-[11px] sm:text-xs uppercase font-medium text-stone-500 mt-1">
                Segundos
              </span>
            </div>
          </div>

          <p className="mt-5 text-xs text-rose-800/80 font-medium">
            (Equivalente a más de <span className="font-bold text-rose-700">{elapsed.totalDays}</span> días juntos despertando y amándonos)
          </p>
        </div>

        {/* Milestone Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Card: Next Anniversary Countdown */}
          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200/70 shadow-sm text-left flex items-start gap-4">
            <div className="p-3 rounded-xl bg-champagne-100 text-champagne-500">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-0.5">
                Próximo Aniversario #{anniversary.anniversaryNumber}
              </span>
              {anniversary.isToday ? (
                <p className="text-base font-bold text-rose-600">
                  🎉 ¡HOY ES NUESTRO ANIVERSARIO! ¡Feliz día mi amor! 💖
                </p>
              ) : (
                <p className="text-sm font-semibold text-stone-700">
                  Faltan <span className="text-rose-600 font-bold">{anniversary.days}</span> días,{' '}
                  <span className="text-rose-600 font-bold">{anniversary.hours}</span>h y{' '}
                  <span className="text-rose-600 font-bold">{anniversary.minutes}</span>m (11 de Julio)
                </p>
              )}
              <span className="text-xs text-stone-500 mt-1 block">
                Para seguir sumando años de risas y complicidad
              </span>
            </div>
          </div>

          {/* Card: Vaiolet Quick Status */}
          <a
            href="#vaiolet"
            className="p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-rose-200/80 shadow-sm text-left flex items-start gap-4 hover:border-rose-400 transition-colors group"
          >
            <div className="p-3 rounded-xl bg-rose-100 text-rose-500 group-hover:scale-105 transition-transform">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 block mb-0.5 flex items-center gap-1.5">
                <span>La Dulce Espera de Vaiolet</span>
                <Hourglass className="w-3.5 h-3.5 animate-spin text-rose-400" />
              </span>
              <p className="text-sm font-semibold text-stone-800">
                ¡Semana 39 de gestación cumplida!
              </p>
              <span className="text-xs text-stone-500 mt-1 block group-hover:text-rose-600 transition-colors">
                En cualquier momento recibimos a nuestra hija →
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};
