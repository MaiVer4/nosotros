import React, { useState, useEffect } from 'react';
import { Baby, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { DaughterInfo, MediaItem } from '../types';
import { calculateDaughterProgress } from '../utils/timeCalculations';

interface VaioletSectionProps {
  daughter: DaughterInfo;
  onUpdateDaughter: (updated: DaughterInfo) => void;
  onSelectMedia: (media: MediaItem) => void;
}

export const VaioletSection: React.FC<VaioletSectionProps> = ({
  daughter,
  onUpdateDaughter,
  onSelectMedia,
}) => {
  const [progress, setProgress] = useState(() =>
    calculateDaughterProgress(
      daughter.status,
      daughter.refDate,
      daughter.gestationWeeksAtRefDate,
      daughter.estimatedDueDate,
      daughter.birthDate
    )
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formBirthDate, setFormBirthDate] = useState(
    daughter.birthDate || new Date().toISOString().slice(0, 16)
  );
  const [formWeight, setFormWeight] = useState(daughter.birthWeight || '3.25 kg');
  const [formLength, setFormLength] = useState(daughter.birthLength || '49 cm');
  const [formNote, setFormNote] = useState(
    daughter.birthNote || '¡El día más feliz del universo! Nuestra princesa Vaiolet llegó para cambiar nuestras vidas.'
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(
        calculateDaughterProgress(
          daughter.status,
          daughter.refDate,
          daughter.gestationWeeksAtRefDate,
          daughter.estimatedDueDate,
          daughter.birthDate
        )
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [daughter]);

  const handleRegisterBirth = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DaughterInfo = {
      ...daughter,
      status: 'born',
      birthDate: formBirthDate,
      birthWeight: formWeight,
      birthLength: formLength,
      birthNote: formNote,
    };
    onUpdateDaughter(updated);
    setIsModalOpen(false);

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#f43f68', '#fecdd6', '#ffd700', '#fb718d', '#ffffff'],
    });
  };

  const handleRevertToExpecting = () => {
    if (confirm('¿Quieres volver al modo de dulce espera (embarazo)?')) {
      const updated: DaughterInfo = {
        ...daughter,
        status: 'expecting',
      };
      onUpdateDaughter(updated);
    }
  };

  return (
    <section id="vaiolet" className="py-16 px-4 bg-gradient-to-b from-transparent via-rose-50/60 to-transparent">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Baby className="w-4 h-4 text-rose-500" />
            <span>Nuestra Mayor Bendición</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-800 tracking-tight mb-3">
            {daughter.name}
          </h2>
          <p className="font-handwriting text-2xl text-rose-600">
            {daughter.status === 'expecting'
              ? 'La dulce espera que llena nuestros días de ilusión y emoción'
              : 'Nuestra princesa amada, la luz de nuestras miradas'}
          </p>
        </div>

        {/* Dynamic Card: Expecting vs Born */}
        {daughter.status === 'expecting' ? (
          /* MODO EMBARAZO (SEMANA 39) */
          <div className="p-6 sm:p-10 rounded-3xl bg-white/90 backdrop-blur-md romantic-shadow border border-rose-200 mb-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8 pb-8 border-b border-rose-100">
              <div className="text-center lg:text-left">
                <span className="inline-block px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold mb-3">
                  ✨ ESTADO ACTUAL: SEMANA 39
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-800 mb-2">
                  ¡Vaiolet está lista para llegar al mundo!
                </h3>
                <p className="text-sm text-stone-600 max-w-xl">
                  {daughter.pregnancyNote ||
                    '39 semanas de pataditas, amor infinito y dos papás contando las horas para abrazarte por primera vez.'}
                </p>
              </div>

              {/* Countdown badge & trigger */}
              <div className="flex flex-col items-center sm:items-end gap-3">
                <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-center sm:text-right">
                  <span className="text-xs uppercase font-semibold text-rose-400 block">
                    Fecha Probable de Parto
                  </span>
                  <span className="font-serif text-xl sm:text-2xl font-bold text-rose-700">
                    24 de Octubre de 2026
                  </span>
                  <span className="text-xs text-rose-500 font-medium block mt-1">
                    (Puede ser en cualquier instante de hoy o estos días)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>¡Ya nació Vaiolet! Registrar llegada</span>
                </button>
              </div>
            </div>

            {/* Pregnancy Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center text-xs font-semibold text-stone-600 mb-2">
                <span>Inicio (Semana 1)</span>
                <span className="text-rose-600 font-bold">
                  Semana {progress.currentWeeks} (+{progress.currentDays} días) — 98% Completado
                </span>
                <span>Parto (Semana 40)</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-rose-100">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: '98%' }}
                />
              </div>
            </div>

            {/* Checklist: Preparativos para el gran día */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-stone-800">Maleta del hospital lista</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Ropita de primera puesta de Vaiolet, mantitas y todo preparado para salir.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-stone-800">Su cunita y habitación</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Un rincón lleno de calidez, almohaditas y mucho amor para su primer descanso.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-stone-800">Papá y Mamá listos</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Maicol y Vanessa unidos, con el corazón acelerado para recibir al amor de sus vidas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MODO YA NACIÓ (CELEBRACIÓN Y EDAD DE VAIOLET) */
          <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-white via-rose-50/60 to-champagne-50/70 backdrop-blur-md romantic-shadow border-2 border-rose-200 mb-12">
            <div className="flex justify-between items-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>¡Nuestra Princesa ya está en casa!</span>
              </div>
              <button
                type="button"
                onClick={handleRevertToExpecting}
                className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 transition-colors"
                title="Volver a ver el modo dulce espera"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Ver modo embarazo</span>
              </button>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-stone-800 mb-2">
              Bienvenida al mundo, Vaiolet 🌸
            </h3>
            <p className="text-sm text-stone-600 max-w-xl mb-8">
              {daughter.birthNote ||
                'Desde el segundo en que escuchamos tu llanto supimos que nuestras vidas jamás volverían a ser las mismas.'}
            </p>

            {/* Age counter */}
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-rose-100 mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block text-center mb-4">
                Tiempo de vida de nuestra pequeña Vaiolet
              </span>
              <div className="flex justify-center items-center gap-6 text-center">
                <div>
                  <span className="font-serif text-3xl sm:text-5xl font-bold text-rose-600">
                    {progress.totalDays ?? 0}
                  </span>
                  <span className="text-xs uppercase font-medium text-stone-500 block mt-1">
                    Días de vida
                  </span>
                </div>
                <div className="text-2xl text-stone-300 font-serif">:</div>
                <div>
                  <span className="font-serif text-3xl sm:text-5xl font-bold text-rose-600">
                    {progress.hours ?? 0}
                  </span>
                  <span className="text-xs uppercase font-medium text-stone-500 block mt-1">
                    Horas
                  </span>
                </div>
                <div className="text-2xl text-stone-300 font-serif">:</div>
                <div>
                  <span className="font-serif text-3xl sm:text-5xl font-bold text-rose-600">
                    {progress.minutes ?? 0}
                  </span>
                  <span className="text-xs uppercase font-medium text-stone-500 block mt-1">
                    Minutos
                  </span>
                </div>
              </div>
            </div>

            {/* Birth Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-white border border-rose-100">
                <span className="text-xs font-medium text-stone-400 block mb-1">Fecha de llegada</span>
                <span className="font-serif text-lg font-bold text-stone-800">
                  {daughter.birthDate ? new Date(daughter.birthDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Hoy'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-rose-100">
                <span className="text-xs font-medium text-stone-400 block mb-1">Peso al nacer</span>
                <span className="font-serif text-lg font-bold text-rose-600">
                  {daughter.birthWeight || '3.25 kg'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-rose-100 col-span-2 sm:col-span-1">
                <span className="text-xs font-medium text-stone-400 block mb-1">Estatura</span>
                <span className="font-serif text-lg font-bold text-rose-600">
                  {daughter.birthLength || '49 cm'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Gallery of Bump / Ultrasound photos */}
        <div>
          <h4 className="font-serif text-xl font-bold text-stone-800 mb-4 text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
            <span>Galería de la Dulce Espera de Vaiolet</span>
            <span className="text-xs font-sans font-normal text-stone-400">
              (Haz clic en cualquier foto para verla en grande)
            </span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {daughter.ultrasoundImages?.map((media, idx) => (
              <div
                key={idx}
                onClick={() => onSelectMedia(media)}
                className="group relative p-3 bg-white rounded-2xl polaroid-shadow border border-stone-200/80 cursor-pointer hover:-translate-y-1 transition-all"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100">
                  <img
                    src={media.url}
                    alt={media.caption || 'Foto de Vaiolet'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                    Ver en pantalla completa
                  </div>
                </div>
                <p className="font-handwriting text-base text-stone-700 text-center mt-3 line-clamp-1">
                  {media.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Registrar Nacimiento de Vaiolet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md p-6 bg-white rounded-3xl shadow-2xl border border-rose-100">
            <h3 className="font-serif text-2xl font-bold text-stone-800 mb-1">
              💖 ¡Registrar Nacimiento de Vaiolet!
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Completa los datos de llegada de nuestra princesa. Podrás editarlos o volver al modo embarazo cuando desees.
            </p>

            <form onSubmit={handleRegisterBirth} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">
                  Fecha y hora de nacimiento
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formBirthDate}
                  onChange={(e) => setFormBirthDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">
                    Peso
                  </label>
                  <input
                    type="text"
                    placeholder="ej. 3.25 kg"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">
                    Estatura / Talla
                  </label>
                  <input
                    type="text"
                    placeholder="ej. 49 cm"
                    value={formLength}
                    onChange={(e) => setFormLength(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">
                  Mensaje o primera emoción de papá y mamá
                </label>
                <textarea
                  rows={3}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Guardar y Celebrar 🎉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
