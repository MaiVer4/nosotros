import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Award,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { BabyMilestone, MediaItem } from '../types';
import { formatSpanishDate } from '../utils/timeCalculations';
import { processMediaFile } from '../utils/mediaProcessor';

interface VaioletMilestonesProps {
  daughterName: string;
  milestones: BabyMilestone[];
  canEdit: boolean;
  onChangeMilestones: (updated: BabyMilestone[]) => void;
  onSelectMedia: (
    items: MediaItem[],
    index: number,
    context?: { title?: string; date?: string }
  ) => void;
}

const PRESET_ICONS = ['🌸', '😊', '🍼', '🎀', '🦷', '👣', '🗣️', '🎂', '💖', '✨'];
const getTodayIsoDate = (): string => new Date().toISOString().slice(0, 10);

export const VaioletMilestones: React.FC<VaioletMilestonesProps> = ({
  daughterName,
  milestones,
  canEdit,
  onChangeMilestones,
  onSelectMedia,
}) => {
  const [filter, setFilter] = useState<'all' | 'achieved' | 'upcoming'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMonth, setNewMonth] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newIcon, setNewIcon] = useState('🌸');
  const [newAchieved, setNewAchieved] = useState(true);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const achievedCount = milestones.filter((m) => m.achieved).length;
  const pct =
    milestones.length > 0
      ? Math.round((achievedCount / milestones.length) * 100)
      : 0;

  const filtered = milestones.filter((m) => {
    if (filter === 'achieved') return m.achieved;
    if (filter === 'upcoming') return !m.achieved;
    return true;
  });

  const handleToggleAchieved = (id: string) => {
    const target = milestones.find((m) => m.id === id);
    const becomingAchieved = target ? !target.achieved : false;
    const todayStr = getTodayIsoDate();

    const updated = milestones.map((m) =>
      m.id === id
        ? {
            ...m,
            achieved: !m.achieved,
            date: !m.achieved && !m.date ? todayStr : m.date,
          }
        : m
    );
    onChangeMilestones(updated);

    if (becomingAchieved) {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f43f68', '#fecdd6', '#fb718d', '#d7b77f'],
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar este hito de Vaiolet?')) return;
    onChangeMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const processed = await processMediaFile(file);
      setNewMediaUrl(processed.dataUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo procesar la foto.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: BabyMilestone = {
      id: `ms-${crypto.randomUUID()}`,
      title: newTitle.trim(),
      monthNumber: newMonth ? Number(newMonth) : undefined,
      date: newDate || undefined,
      weight: newWeight.trim() || undefined,
      height: newHeight.trim() || undefined,
      note: newNote.trim() || `Un momento inolvidable de ${daughterName}.`,
      icon: newIcon || '🌸',
      achieved: newAchieved,
      mediaUrl: newMediaUrl.trim() || undefined,
    };

    onChangeMilestones([...milestones, item]);
    if (newAchieved) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f43f68', '#fecdd6', '#d7b77f'],
      });
    }

    setNewTitle('');
    setNewMonth('');
    setNewDate('');
    setNewWeight('');
    setNewHeight('');
    setNewNote('');
    setNewMediaUrl('');
    setNewAchieved(true);
    setIsAdding(false);
  };

  return (
    <div className="mb-8 sm:mb-12 p-5 sm:p-8 rounded-3xl smooth-card border border-rose-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Diario de Primer Año</span>
          </div>
          <h4 className="font-serif text-xl sm:text-2xl font-bold text-stone-800">
            Cumplemeses & Hitos de {daughterName}
          </h4>
          <p className="text-xs text-stone-500 mt-0.5">
            {achievedCount} de {milestones.length} hitos registrados ({pct}%)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-full bg-stone-100 border border-stone-200/70 text-[11px] font-medium">
            {(
              [
                { id: 'all', label: 'Todos' },
                { id: 'achieved', label: 'Logrados ✨' },
                { id: 'upcoming', label: 'Por venir 🌱' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  filter === tab.id
                    ? 'bg-white text-rose-600 shadow-sm font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => setIsAdding((v) => !v)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition-all"
            >
              {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isAdding ? 'Cerrar' : 'Añadir Hito'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-rose-100 mb-6">
        <div
          className="h-full bg-gradient-to-r from-rose-400 via-rose-500 to-champagne-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Inline Add Form */}
      <AnimatePresence>
        {canEdit && isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddMilestone}
            className="mb-6 p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                  Título del Hito o Cumplemes *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Primer Mes de Vaiolet / Primera Sonrisa"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                  Mes # (Opcional)
                </label>
                <input
                  type="number"
                  min={0}
                  max={36}
                  placeholder="ej. 1"
                  value={newMonth}
                  onChange={(e) => setNewMonth(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                  Peso (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej. 4.1 kg"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                  Estatura (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej. 53 cm"
                  value={newHeight}
                  onChange={(e) => setNewHeight(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                  Ícono
                </label>
                <div className="flex items-center gap-1 flex-wrap bg-white p-1 rounded-xl border border-stone-200">
                  {PRESET_ICONS.slice(0, 5).map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewIcon(ic)}
                      className={`w-6 h-6 rounded-lg text-sm flex items-center justify-center ${
                        newIcon === ic ? 'bg-rose-100 ring-1 ring-rose-400' : ''
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase text-stone-500 mb-1">
                Nota o anécdota
              </label>
              <textarea
                rows={2}
                placeholder="Cómo vivieron este día especial..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-600 text-xs font-semibold cursor-pointer hover:bg-rose-50">
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{newMediaUrl ? 'Foto cargada ✓' : 'Subir foto del hito'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadPhoto}
                    className="hidden"
                  />
                </label>

                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAchieved}
                    onChange={(e) => setNewAchieved(e.target.checked)}
                    className="rounded text-rose-500"
                  />
                  <span>Ya logrado</span>
                </label>
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm"
              >
                Guardar Hito
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filtered.map((ms) => (
          <div
            key={ms.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              ms.achieved
                ? 'bg-white border-rose-200 shadow-sm'
                : 'bg-stone-50/70 border-stone-200/80'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-lg shrink-0">
                    {ms.icon || '🌸'}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ms.monthNumber !== undefined && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          {ms.monthNumber === 0 ? 'Día 0' : `Mes ${ms.monthNumber}`}
                        </span>
                      )}
                      {ms.date && (
                        <span className="text-[10px] font-medium text-stone-400">
                          {formatSpanishDate(ms.date)}
                        </span>
                      )}
                    </div>
                    <h5 className="font-serif text-sm sm:text-base font-bold text-stone-800 leading-snug mt-0.5">
                      {ms.title}
                    </h5>
                  </div>
                </div>

                {canEdit ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleAchieved(ms.id)}
                      title={ms.achieved ? 'Marcar por venir' : 'Marcar logrado'}
                      className={`p-1 rounded-full transition-colors ${
                        ms.achieved
                          ? 'text-emerald-500 hover:bg-emerald-50'
                          : 'text-stone-300 hover:text-rose-500 hover:bg-rose-50'
                      }`}
                    >
                      {ms.achieved ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ms.id)}
                      title="Eliminar hito"
                      className="p-1 rounded-full text-stone-300 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span
                    className={`shrink-0 ${
                      ms.achieved ? 'text-emerald-500' : 'text-stone-300'
                    }`}
                  >
                    {ms.achieved ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </span>
                )}
              </div>

              {(ms.weight || ms.height) && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ms.weight && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-champagne-100 text-stone-700">
                      ⚖️ {ms.weight}
                    </span>
                  )}
                  {ms.height && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-champagne-100 text-stone-700">
                      📏 {ms.height}
                    </span>
                  )}
                </div>
              )}

              <p className="text-xs text-stone-600 leading-relaxed">{ms.note}</p>
            </div>

            {ms.mediaUrl && (
              <div
                onClick={() =>
                  onSelectMedia(
                    [
                      {
                        type: 'image',
                        url: ms.mediaUrl!,
                        caption: `${ms.title} — ${ms.note}`,
                      },
                    ],
                    0,
                    {
                      title: ms.title,
                      date: ms.date ? formatSpanishDate(ms.date) : undefined,
                    }
                  )
                }
                className="mt-3 rounded-xl overflow-hidden aspect-video bg-stone-100 cursor-pointer border border-rose-100 group"
              >
                <img
                  src={ms.mediaUrl}
                  alt={ms.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
