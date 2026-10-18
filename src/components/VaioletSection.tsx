import React, { useState, useEffect, useRef } from 'react';
import {
  Baby,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  X,
  Edit3,
  Trash2,
  Upload,
  Video,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { DaughterInfo, MediaItem } from '../types';
import { calculateDaughterProgress } from '../utils/timeCalculations';
import { processMediaFile, getVideoThumbnailUrl } from '../utils/mediaProcessor';

interface VaioletSectionProps {
  daughter: DaughterInfo;
  onUpdateDaughter: (updated: DaughterInfo) => void;
  onSelectMedia: (media: MediaItem) => void;
  isLiveEditMode?: boolean;
  onEditSection?: () => void;
}

export const VaioletSection: React.FC<VaioletSectionProps> = ({
  daughter,
  onUpdateDaughter,
  onSelectMedia,
  isLiveEditMode = false,
  onEditSection,
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
    daughter.birthNote ||
      '¡El día más feliz del universo! Nuestra princesa Vaiolet llegó para cambiar nuestras vidas.'
  );
  const [isUploadingQuick, setIsUploadingQuick] = useState(false);
  const quickUploadRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setProgress(
      calculateDaughterProgress(
        daughter.status,
        daughter.refDate,
        daughter.gestationWeeksAtRefDate,
        daughter.estimatedDueDate,
        daughter.birthDate
      )
    );
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
      particleCount: 100,
      spread: 80,
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

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingQuick(true);
    try {
      const added: MediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await processMediaFile(files[i]);
        added.push({
          id: `vai-up-${Date.now()}-${i}`,
          type: res.type,
          url: res.dataUrl,
          caption: 'Nuevo recuerdo de ' + daughter.name,
        });
      }
      onUpdateDaughter({
        ...daughter,
        ultrasoundImages: [...(daughter.ultrasoundImages || []), ...added],
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al subir archivo.');
    } finally {
      setIsUploadingQuick(false);
      if (quickUploadRef.current) quickUploadRef.current.value = '';
    }
  };

  const handleInlineCaptionChange = (idx: number, caption: string) => {
    const list = [...(daughter.ultrasoundImages || [])];
    list[idx] = { ...list[idx], caption };
    onUpdateDaughter({ ...daughter, ultrasoundImages: list });
  };

  const handleInlineDeleteMedia = (idx: number) => {
    if (!confirm('¿Eliminar esta foto/video de la galería?')) return;
    const list = (daughter.ultrasoundImages || []).filter((_, i) => i !== idx);
    onUpdateDaughter({ ...daughter, ultrasoundImages: list });
  };

  const barPct = daughter.customProgressPercentage ?? progress.percentage ?? 98;

  return (
    <section id="vaiolet" className="py-12 sm:py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {isLiveEditMode && onEditSection && (
          <div className="mb-4 flex justify-center">
            <button
              type="button"
              onClick={onEditSection}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-stone-900 hover:bg-rose-600 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Sección {daughter.name}, Checklist y Galería</span>
            </button>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-semibold uppercase tracking-wider mb-2.5">
            <Baby className="w-3.5 h-3.5 text-rose-500" />
            <span>{daughter.sectionBadge || 'Nuestra Mayor Bendición'}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-800 tracking-tight mb-2">
            {daughter.name}
          </h2>
          <p className="font-handwriting text-xl sm:text-2xl text-rose-600 px-2">
            {daughter.status === 'expecting'
              ? daughter.expectingSubtitle ||
                'La dulce espera que llena nuestros días de ilusión y emoción'
              : daughter.bornSubtitle ||
                'Nuestra princesa amada, la luz de nuestras miradas'}
          </p>
        </div>

        {/* Dynamic Card: Expecting vs Born */}
        {daughter.status === 'expecting' ? (
          <div className="p-5 sm:p-10 rounded-3xl smooth-card border border-rose-200 mb-8 sm:mb-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-rose-100">
              <div className="text-center lg:text-left">
                <span className="inline-block px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-bold mb-2.5">
                  {daughter.statusBadgeText || '✨ ESTADO ACTUAL: SEMANA 39'}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-800 mb-2">
                  {daughter.expectingHeadline ||
                    '¡Vaiolet está lista para llegar al mundo!'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
                  {daughter.pregnancyNote}
                </p>
              </div>

              <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center sm:text-right w-full sm:w-auto">
                  <span className="text-[10px] sm:text-xs uppercase font-semibold text-rose-400 block">
                    Fecha Probable de Parto
                  </span>
                  <span className="font-serif text-lg sm:text-2xl font-bold text-rose-700">
                    {daughter.estimatedDueDateLabel || '24 de Octubre de 2026'}
                  </span>
                  <span className="text-[10px] sm:text-xs text-rose-500 font-medium block mt-0.5">
                    {daughter.estimatedDueDateSubtext ||
                      '(En cualquier instante de hoy o estos días)'}
                  </span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all select-none"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>¡Ya nació {daughter.name}! Registrar llegada</span>
                </motion.button>
              </div>
            </div>

            {/* Pregnancy Progress Bar */}
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between items-center text-[11px] sm:text-xs font-semibold text-stone-600 mb-2">
                <span>Inicio (Semana 1)</span>
                <span className="text-rose-600 font-bold">
                  Semana {progress.currentWeeks} (+{progress.currentDays}d) — {barPct}%
                </span>
                <span>Parto (Semana 40)</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-rose-100">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: `${Math.min(100, Math.max(0, barPct))}%` }}
                />
              </div>
            </div>

            {/* Dynamic Checklist */}
            {daughter.checklist && daughter.checklist.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {daughter.checklist.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-stone-800">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* MODO YA NACIÓ */
          <div className="p-5 sm:p-10 rounded-3xl bg-white smooth-card border-2 border-rose-200 mb-8 sm:mb-12">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {daughter.bornBadgeText || '¡Nuestra Princesa ya está en casa!'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRevertToExpecting}
                className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Modo dulce espera</span>
              </button>
            </div>

            <h3 className="font-serif text-2xl sm:text-4xl font-bold text-stone-800 mb-2">
              {daughter.bornHeadline || `Bienvenida al mundo, ${daughter.name} 🌸`}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl mb-6 sm:mb-8">
              {daughter.birthNote}
            </p>

            {/* Age counter */}
            <div className="p-4 sm:p-6 rounded-2xl bg-rose-50/60 border border-rose-100 mb-6 sm:mb-8">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-400 block text-center mb-3 sm:mb-4">
                Tiempo de vida de nuestra pequeña {daughter.name}
              </span>
              <div className="flex justify-center items-center gap-4 sm:gap-6 text-center">
                <div>
                  <span className="font-serif text-3xl sm:text-5xl font-bold text-rose-600">
                    {progress.totalDays ?? 0}
                  </span>
                  <span className="text-[10px] sm:text-xs uppercase font-medium text-stone-500 block mt-0.5 sm:mt-1">
                    Días
                  </span>
                </div>
                <div className="text-2xl text-stone-300 font-serif">:</div>
                <div>
                  <span className="font-serif text-3xl sm:text-5xl font-bold text-rose-600">
                    {progress.hours ?? 0}
                  </span>
                  <span className="text-[10px] sm:text-xs uppercase font-medium text-stone-500 block mt-0.5 sm:mt-1">
                    Horas
                  </span>
                </div>
                <div className="text-2xl text-stone-300 font-serif">:</div>
                <div>
                  <span className="font-serif text-3xl sm:text-5xl font-bold text-rose-600">
                    {progress.minutes ?? 0}
                  </span>
                  <span className="text-[10px] sm:text-xs uppercase font-medium text-stone-500 block mt-0.5 sm:mt-1">
                    Minutos
                  </span>
                </div>
              </div>
            </div>

            {/* Birth Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="p-3 sm:p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] sm:text-xs font-medium text-stone-400 block mb-0.5">
                  Fecha de llegada
                </span>
                <span className="font-serif text-sm sm:text-lg font-bold text-stone-800">
                  {daughter.birthDate
                    ? new Date(daughter.birthDate).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Hoy'}
                </span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] sm:text-xs font-medium text-stone-400 block mb-0.5">
                  Peso al nacer
                </span>
                <span className="font-serif text-sm sm:text-lg font-bold text-rose-600">
                  {daughter.birthWeight || '3.25 kg'}
                </span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-stone-50 border border-stone-200/80 col-span-2 sm:col-span-1">
                <span className="text-[10px] sm:text-xs font-medium text-stone-400 block mb-0.5">
                  Estatura
                </span>
                <span className="font-serif text-sm sm:text-lg font-bold text-rose-600">
                  {daughter.birthLength || '49 cm'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Gallery */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
            <h4 className="font-serif text-lg sm:text-xl font-bold text-stone-800 flex items-center gap-2">
              <span>{daughter.galleryTitle || 'Galería de la Dulce Espera'}</span>
              <span className="text-[11px] font-sans font-normal text-stone-400">
                (Toca para agrandar)
              </span>
            </h4>

            {isLiveEditMode && (
              <div>
                <input
                  ref={quickUploadRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleQuickUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingQuick}
                  onClick={() => quickUploadRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm"
                >
                  {isUploadingQuick ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Subir Foto a {daughter.name}</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {daughter.ultrasoundImages?.map((media, idx) => {
              const ytThumb = getVideoThumbnailUrl(media.url);

              return (
                <motion.div
                  key={media.id || idx}
                  whileTap={isLiveEditMode ? undefined : { scale: 0.98 }}
                  className="group relative p-2.5 sm:p-3 bg-white rounded-2xl polaroid-card hover:border-rose-300 transition-colors"
                >
                  <div
                    onClick={() => onSelectMedia(media)}
                    className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 cursor-pointer"
                  >
                    {media.type === 'video' ? (
                      ytThumb ? (
                        <img
                          src={ytThumb}
                          alt={media.caption || 'Video'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={media.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                      )
                    ) : (
                      <img
                        src={media.url}
                        alt={media.caption || `Foto de ${daughter.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}

                    {media.type === 'video' && (
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center text-white">
                        <Video className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {isLiveEditMode ? (
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <input
                        type="text"
                        value={media.caption || ''}
                        onChange={(e) =>
                          handleInlineCaptionChange(idx, e.target.value)
                        }
                        placeholder="Texto de la foto..."
                        className="flex-1 px-2 py-1 rounded-lg border border-rose-200 text-xs bg-rose-50/40 focus:outline-none focus:ring-1 focus:ring-rose-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleInlineDeleteMedia(idx)}
                        title="Eliminar foto"
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="font-handwriting text-sm sm:text-base text-stone-700 text-center mt-2.5 line-clamp-2">
                      {media.caption}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Registrar Nacimiento */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md p-6 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-rose-100 max-h-[90dvh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-800 mb-1">
                💖 ¡Registrar Llegada de {daughter.name}!
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Ingresa los datos del día más feliz de sus vidas.
              </p>

              <form onSubmit={handleRegisterBirth} className="space-y-3.5">
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
                      Estatura
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
                    Mensaje de mamá y papá
                  </label>
                  <textarea
                    rows={3}
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
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
                    Guardar y Festejar 🎉
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
