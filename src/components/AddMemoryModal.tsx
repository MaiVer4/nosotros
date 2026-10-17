import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Memory, MemoryCategory } from '../types';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMemory: (memory: Memory) => void;
}

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({
  isOpen,
  onClose,
  onAddMemory,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<MemoryCategory>('hito');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaCaption, setMediaCaption] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newMemory: Memory = {
      id: `mem-${Date.now()}`,
      title,
      date,
      category,
      description,
      location: location.trim() ? location.trim() : undefined,
      isFavorite,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      media: mediaUrl.trim()
        ? [
            {
              type: mediaUrl.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image',
              url: mediaUrl.trim(),
              caption: mediaCaption.trim() ? mediaCaption.trim() : undefined,
            },
          ]
        : [],
    };

    onAddMemory(newMemory);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f43f68', '#fecdd6', '#fb718d'],
    });

    onClose();
  };

  const handleCopyCode = () => {
    const memoryObj = {
      id: `mem-${Date.now()}`,
      title,
      date,
      category,
      isFavorite,
      location: location || undefined,
      description,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      media: mediaUrl
        ? [
            {
              type: mediaUrl.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image',
              url: mediaUrl,
              caption: mediaCaption || undefined,
            },
          ]
        : [],
    };

    navigator.clipboard.writeText(JSON.stringify(memoryObj, null, 2) + ',');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border border-rose-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nuevo Recuerdo</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-stone-800">
            Añadir Momento a Nuestra Historia
          </h3>
          <p className="text-xs text-stone-500">
            Guarda una fecha, anécdota o fotografía especial para verla en la línea de tiempo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">
                Título del Recuerdo *
              </label>
              <input
                type="text"
                required
                placeholder="ej. Nuestro viaje a la playa"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">
                Fecha del Suceso *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
              >
                <option value="inicio">Nuestros Inicios</option>
                <option value="hito">Hito de Pareja</option>
                <option value="embarazo">El Embarazo</option>
                <option value="vaiolet">Nuestra Hija Vaiolet 🌸</option>
                <option value="viaje">Viajes y Escapadas</option>
                <option value="cita">Citas y Salidas</option>
                <option value="especial">Momento Especial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">
                Lugar / Ubicación (Opcional)
              </label>
              <input
                type="text"
                placeholder="ej. En nuestro lugar favorito"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">
              Descripción / Historia del Momento *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Cuéntanos qué pasó, qué sintieron o qué dijeron..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">
                URL o ruta de Foto / Video
              </label>
              <input
                type="text"
                placeholder="https://... o /media/mi-foto.jpg"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">
                Pie de Foto (Epígrafe)
              </label>
              <input
                type="text"
                placeholder="ej. Sonriendo como siempre"
                value={mediaCaption}
                onChange={(e) => setMediaCaption(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex-1 mr-4">
              <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">
                Etiquetas (separadas por coma)
              </label>
              <input
                type="text"
                placeholder="Amor, Playa, Risa"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer mt-5">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 border-stone-300"
              />
              <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Favorito ⭐</span>
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={handleCopyCode}
              className="py-2.5 px-4 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
            >
              {copiedCode ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? '¡Código Copiado!' : 'Copiar código para Git'}</span>
            </button>

            <div className="flex-1 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Guardar Recuerdo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
