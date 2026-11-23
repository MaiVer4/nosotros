import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { Memory, MemoryCategory, MediaItem, CategoryItem } from '../types';
import { MediaManagerEditor } from './MediaManagerEditor';

interface AddMemoryModalProps {
  isOpen: boolean;
  categories: CategoryItem[];
  onClose: () => void;
  onAddMemory: (memory: Memory) => void;
}

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({
  isOpen,
  categories,
  onClose,
  onAddMemory,
}) => {
  const selectableCategories = categories.filter(
    (c) => c.id !== 'todos' && c.id !== 'favoritos'
  );
  const defaultCategory =
    selectableCategories.find((c) => c.id === 'vaiolet')?.id ||
    selectableCategories[0]?.id ||
    'especial';

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<MemoryCategory>(defaultCategory);
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const buildMemoryObject = (): Memory => ({
    id: `mem-${crypto.randomUUID()}`,
    title: title.trim(),
    date,
    category,
    description: description.trim(),
    location: location.trim() ? location.trim() : undefined,
    isFavorite,
    tags: tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    media,
  });

  const resetForm = () => {
    setTitle('');
    setDate(new Date().toISOString().slice(0, 10));
    setCategory(defaultCategory);
    setDescription('');
    setMedia([]);
    setLocation('');
    setTags('');
    setIsFavorite(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMemory = buildMemoryObject();
    onAddMemory(newMemory);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f43f68', '#fecdd6', '#fb718d'],
    });
    resetForm();
    onClose();
  };

  const handleCopyCode = () => {
    const memoryObj = buildMemoryObject();
    navigator.clipboard.writeText(JSON.stringify(memoryObj, null, 2) + ',');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto p-5 sm:p-8 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-rose-100"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nuevo Recuerdo</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-800">
              Añadir Momento a Nuestra Historia
            </h3>
            <p className="text-xs text-stone-500">
              Sube fotos o videos directo desde tu celular o PC y guarda una fecha especial en la línea de tiempo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                  Título del Recuerdo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. El primer mes de Vaiolet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                  Fecha del Suceso *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                >
                  {selectableCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                  Lugar / Ubicación (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej. Pereira, Risaralda"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                Descripción / Historia del Momento *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Cuéntanos qué pasó, qué sintieron o qué dijeron..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            {/* Direct Device Upload & URL Media Manager */}
            <div className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-100">
              <MediaManagerEditor
                items={media}
                onChange={setMedia}
                label="Fotos y Videos del Recuerdo"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex-1 mr-3 sm:mr-4">
                <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  type="text"
                  placeholder="Vaiolet, Familia, Amor"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 border-stone-300"
                />
                <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Favorito</span>
                </span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={handleCopyCode}
                className="py-2.5 px-4 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedCode ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedCode ? '¡Código Copiado!' : 'Copiar JSON'}</span>
              </button>

              <div className="flex-1 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Guardar Recuerdo
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
