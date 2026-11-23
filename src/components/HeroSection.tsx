import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Calendar, Baby, Hourglass, Sparkles, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  calculateElapsedTime,
  calculateNextAnniversary,
  calculateDaughterProgress,
} from '../utils/timeCalculations';
import type { HeroTexts, DaughterInfo } from '../types';

interface HeroSectionProps {
  partner1: string;
  partner2: string;
  startDate: string;
  heroTexts: HeroTexts;
  daughter: DaughterInfo;
  isLiveEditMode?: boolean;
  onEditSection?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  partner1,
  partner2,
  startDate,
  heroTexts,
  daughter,
  isLiveEditMode = false,
  onEditSection,
}) => {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const elapsed = useMemo(
    () => calculateElapsedTime(startDate, now),
    [startDate, now]
  );

  const anniversary = useMemo(
    () => calculateNextAnniversary(startDate, now),
    [startDate, now]
  );

  const daughterProgress = useMemo(
    () =>
      calculateDaughterProgress(
        daughter.status,
        daughter.refDate,
        daughter.gestationWeeksAtRefDate,
        daughter.estimatedDueDate,
        daughter.birthDate,
        now
      ),
    [
      daughter.status,
      daughter.refDate,
      daughter.gestationWeeksAtRefDate,
      daughter.estimatedDueDate,
      daughter.birthDate,
      now,
    ]
  );

  const bornAgeHeadline = useMemo(() => {
    const years = daughterProgress.years ?? 0;
    const months = daughterProgress.months ?? 0;
    const days = daughterProgress.days ?? 0;
    const totalDays = daughterProgress.totalDays ?? 0;

    if (years > 0) {
      return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'} de amor`;
    }
    if (months > 0) {
      return `${months} ${months === 1 ? 'mes' : 'meses'} y ${days} ${days === 1 ? 'día' : 'días'} juntos`;
    }
    return `${totalDays} ${totalDays === 1 ? 'día' : 'días'} llenándonos de vida`;
  }, [daughterProgress]);

  return (
    <section id="tiempo" className="relative pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative">
        {isLiveEditMode && onEditSection && (
          <div className="mb-4 flex justify-center">
            <button
              type="button"
              onClick={onEditSection}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-stone-900 hover:bg-rose-600 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Portada, Nombres y Contadores</span>
            </button>
          </div>
        )}

        {/* Names Header */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="font-serif text-3xl sm:text-6xl font-bold text-stone-800 tracking-tight mb-2 sm:mb-4"
        >
          {partner1}{' '}
          <span className="inline-block mx-1 font-handwriting text-rose-500 text-4xl sm:text-7xl font-normal">
            &
          </span>{' '}
          {partner2}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="font-handwriting text-xl sm:text-3xl text-rose-600/90 max-w-xl mx-auto mb-8 sm:mb-10 px-2"
        >
          {heroTexts.heroQuote}
        </motion.p>

        {/* Real-time Relationship Counter Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="p-5 sm:p-8 rounded-3xl smooth-card-rose mb-6 sm:mb-8 relative border border-rose-200"
        >
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 fill-rose-500 animate-pulse" />
            <h2 className="text-xs sm:text-sm uppercase tracking-widest font-semibold text-rose-900">
              {heroTexts.counterTitle}
            </h2>
          </div>

          {/* Grid of live counter units */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-4 max-w-2xl mx-auto">
            <div className="p-2.5 sm:p-4 rounded-2xl bg-white shadow-sm border border-rose-100 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-rose-600">
                {elapsed.years}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-medium text-stone-500 mt-0.5 sm:mt-1">
                {elapsed.years === 1 ? 'Año' : 'Años'}
              </span>
            </div>

            <div className="p-2.5 sm:p-4 rounded-2xl bg-white shadow-sm border border-rose-100 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-rose-600">
                {elapsed.months}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-medium text-stone-500 mt-0.5 sm:mt-1">
                {elapsed.months === 1 ? 'Mes' : 'Meses'}
              </span>
            </div>

            <div className="p-2.5 sm:p-4 rounded-2xl bg-white shadow-sm border border-rose-100 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-rose-600">
                {elapsed.days}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-medium text-stone-500 mt-0.5 sm:mt-1">
                {elapsed.days === 1 ? 'Día' : 'Días'}
              </span>
            </div>

            <div className="p-2.5 sm:p-4 rounded-2xl bg-white shadow-sm border border-rose-100 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-rose-600">
                {String(elapsed.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-medium text-stone-500 mt-0.5 sm:mt-1">
                Horas
              </span>
            </div>

            <div className="p-2.5 sm:p-4 rounded-2xl bg-white shadow-sm border border-rose-100 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-rose-600">
                {String(elapsed.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-medium text-stone-500 mt-0.5 sm:mt-1">
                Minutos
              </span>
            </div>

            <div className="p-2.5 sm:p-4 rounded-2xl bg-white shadow-sm border border-rose-100 flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-rose-600 tabular-nums">
                {String(elapsed.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-medium text-stone-500 mt-0.5 sm:mt-1">
                Segundos
              </span>
            </div>
          </div>

          <p className="mt-4 sm:mt-5 text-xs text-rose-800/80 font-medium">
            ({heroTexts.counterSubtextPrefix}{' '}
            <span className="font-bold text-rose-700">{elapsed.totalDays}</span>{' '}
            {heroTexts.counterSubtextSuffix})
          </p>
        </motion.div>

        {/* Milestone Quick Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
          {/* Next Anniversary Countdown */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm text-left flex items-start gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 rounded-xl bg-champagne-100 text-champagne-500 shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-0.5">
                {heroTexts.anniversaryCardTitle} #{anniversary.anniversaryNumber}
              </span>
              {anniversary.isToday ? (
                <p className="text-sm sm:text-base font-bold text-rose-600">
                  🎉 ¡HOY ES NUESTRO ANIVERSARIO! ¡Feliz día mi amor! 💖
                </p>
              ) : (
                <p className="text-xs sm:text-sm font-semibold text-stone-700">
                  Faltan <span className="text-rose-600 font-bold">{anniversary.days}</span>d,{' '}
                  <span className="text-rose-600 font-bold">{anniversary.hours}</span>h y{' '}
                  <span className="text-rose-600 font-bold">{anniversary.minutes}</span>m
                </p>
              )}
              <span className="text-[11px] text-stone-500 mt-1 block">
                {heroTexts.anniversaryCardSubtitle}
              </span>
            </div>
          </div>

          {/* Vaiolet Quick Status */}
          <a
            href="#vaiolet"
            className="p-4 sm:p-5 rounded-2xl bg-white border border-rose-200 shadow-sm text-left flex items-start gap-3 sm:gap-4 hover:border-rose-300 transition-colors group"
          >
            <div className="p-2.5 sm:p-3 rounded-xl bg-rose-100 text-rose-500 shrink-0 group-hover:scale-105 transition-transform">
              <Baby className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              {daughter.status === 'born' ? (
                <>
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-rose-600 mb-0.5 flex items-center gap-1.5">
                    <span>
                      {heroTexts.daughterBornCardBadge ||
                        `¡${daughter.name} ya está con nosotros!`}
                    </span>
                    <Sparkles className="w-3 h-3 text-rose-500" />
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-stone-800">
                    {bornAgeHeadline}
                  </p>
                  <span className="text-[11px] text-stone-500 mt-1 block group-hover:text-rose-600 transition-colors">
                    {heroTexts.daughterBornCardSubtitle ||
                      'Ver su edad en vivo, hitos y fotos →'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-rose-600 mb-0.5 flex items-center gap-1.5">
                    <span>{heroTexts.daughterCardBadge}</span>
                    <Hourglass className="w-3 h-3 animate-spin text-rose-400" />
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-stone-800">
                    {heroTexts.daughterCardTitle}
                  </p>
                  <span className="text-[11px] text-stone-500 mt-1 block group-hover:text-rose-600 transition-colors">
                    {heroTexts.daughterCardSubtitle}
                  </span>
                </>
              )}
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};
