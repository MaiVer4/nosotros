import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Heart, 
  Search, 
  Sparkles, 
  Grid, 
  GitCommit, 
  Video, 
  Image as ImageIcon,
  Edit3,
  Trash2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Memory, MediaItem, TimelineSectionConfig } from '../types';
import { getVideoThumbnailUrl } from '../utils/mediaProcessor';

interface TimelineSectionProps {
  memories: Memory[];
  timelineConfig: TimelineSectionConfig;
  onSelectMedia: (media: MediaItem) => void;
  onToggleFavorite: (id: string) => void;
  isLiveEditMode?: boolean;
  onEditSection?: () => void;
  onEditMemory?: (id: string) => void;
  onDeleteMemory?: (id: string) => void;
  onAddMemory?: () => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  memories,
  timelineConfig,
  onSelectMedia,
  onToggleFavorite,
  isLiveEditMode = false,
  onEditSection,
  onEditMemory,
  onDeleteMemory,
  onAddMemory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

  const categories = timelineConfig?.categories?.length
    ? timelineConfig.categories
    : [
        { id: 'todos', label: 'Todos' },
        { id: 'inicio', label: 'Inicios' },
        { id: 'hito', label: 'Hitos' },
        { id: 'embarazo', label: 'Embarazo' },
        { id: 'vaiolet', label: 'Vaiolet 🌸' },
        { id: 'viaje', label: 'Viajes' },
        { id: 'favoritos', label: 'Favoritos ⭐' },
      ];

  const filteredMemories = useMemo(() => {
    return memories
      .filter((mem) => {
        if (selectedCategory === 'favoritos') {
          if (!mem.isFavorite) return false;
        } else if (selectedCategory !== 'todos') {
          if (mem.category !== selectedCategory) return false;
        }

        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          const matchesTitle = mem.title.toLowerCase().includes(q);
          const matchesDesc = mem.description.toLowerCase().includes(q);
          const matchesLoc = mem.location?.toLowerCase().includes(q);
          const matchesTags = mem.tags?.some((t) => t.toLowerCase().includes(q));
          return matchesTitle || matchesDesc || matchesLoc || matchesTags;
        }

        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [memories, selectedCategory, searchTerm]);

  return (
    <section id="historia" className="py-12 sm:py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Live Edit Mode Controls */}
        {isLiveEditMode && (
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
            {onEditSection && (
              <button
                type="button"
                onClick={onEditSection}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-stone-900 hover:bg-rose-600 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Textos y Categorías de la Sección</span>
              </button>
            )}
            {onAddMemory && (
              <button
                type="button"
                onClick={onAddMemory}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Crear Nuevo Recuerdo</span>
              </button>
            )}
          </div>
        )}

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-semibold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>{timelineConfig?.sectionBadge || 'Nuestra Historia en Recuerdos'}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-800 tracking-tight mb-2">
            {timelineConfig?.sectionTitle || 'Línea del Tiempo'}
          </h2>
          <p className="font-handwriting text-xl sm:text-2xl text-rose-600 px-2">
            {timelineConfig?.sectionSubtitle || 'Cada instante, cada fotografía y cada paso que hemos dado juntos'}
          </p>
        </div>

        {/* Controls: Search, View Mode and Filter Pills */}
        <div className="mb-8 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar recuerdos o lugares..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-stone-400"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-full bg-stone-100 border border-stone-200/60 text-xs font-medium w-full sm:w-auto justify-center">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-white text-rose-600 shadow-sm font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>Línea del Tiempo</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-rose-600 shadow-sm font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Muro de Fotos</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-white hover:bg-rose-50 text-stone-600 border border-stone-200/80'
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Results Container */}
        {filteredMemories.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-rose-200">
            <Heart className="w-8 h-8 text-rose-300 mx-auto mb-2" />
            <p className="font-serif text-base text-stone-700">No encontramos recuerdos para este filtro</p>
            <p className="text-xs text-stone-400 mt-0.5">Prueba con otra palabra clave o agrega un nuevo recuerdo</p>
          </div>
        ) : viewMode === 'timeline' ? (
          /* VISTA: LÍNEA DE TIEMPO VERTICAL */
          <div className="relative border-l-2 border-rose-200 ml-3 sm:ml-32 space-y-8 sm:space-y-12">
            <AnimatePresence mode="popLayout">
              {filteredMemories.map((mem) => {
                const dateObj = new Date(mem.date);
                const formattedDate = dateObj.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <motion.div
                    key={mem.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                    className="relative pl-5 sm:pl-10 group"
                  >
                    {/* Node marker */}
                    <div className="absolute -left-[13px] top-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border-4 border-rose-400 shadow-sm flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    </div>

                    {/* Outer date column on desktop */}
                    <div className="hidden sm:block absolute -left-32 top-4 text-right w-24">
                      <span className="font-serif text-sm font-bold text-rose-700 block">
                        {formattedDate}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400">
                        {mem.category}
                      </span>
                    </div>

                    {/* Memory Card */}
                    <div className="p-4 sm:p-6 rounded-3xl smooth-card border border-stone-200/90 relative">
                      {/* Live Edit Mode Actions Bar on top of card */}
                      {isLiveEditMode && (
                        <div className="mb-3 p-2 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-rose-800">
                            🛠️ Opciones de Administrador
                          </span>
                          <div className="flex items-center gap-1.5">
                            {onEditMemory && (
                              <button
                                type="button"
                                onClick={() => onEditMemory(mem.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-rose-600 text-white text-[11px] font-semibold"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Editar Recuerdo & Fotos</span>
                              </button>
                            )}
                            {onDeleteMemory && (
                              <button
                                type="button"
                                onClick={() => onDeleteMemory(mem.id)}
                                title="Eliminar este recuerdo"
                                className="p-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3 mb-2 sm:mb-3">
                        <div>
                          {/* Mobile Date Header */}
                          <div className="sm:hidden flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-rose-600">{formattedDate}</span>
                            <span className="text-stone-300">•</span>
                            <span className="text-[10px] uppercase tracking-wider text-stone-400">
                              {mem.category}
                            </span>
                          </div>

                          <h3 className="font-serif text-lg sm:text-2xl font-bold text-stone-800">
                            {mem.title}
                          </h3>
                          {mem.location && (
                            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-stone-500 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-rose-400" />
                              <span>{mem.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Favorite Button */}
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          type="button"
                          onClick={() => onToggleFavorite(mem.id)}
                          className={`p-2 rounded-full transition-colors ${
                            mem.isFavorite
                              ? 'text-rose-500 bg-rose-50'
                              : 'text-stone-300 hover:text-rose-400 hover:bg-stone-50'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${mem.isFavorite ? 'fill-rose-500' : ''}`}
                          />
                        </motion.button>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-3 sm:mb-4">
                        {mem.description}
                      </p>

                      {/* Media preview */}
                      {mem.media.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                          {mem.media.map((med, idx) => {
                            const ytThumb = getVideoThumbnailUrl(med.url);

                            return (
                              <motion.div
                                key={med.id || idx}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSelectMedia(med)}
                                className="group/media relative rounded-2xl overflow-hidden aspect-video bg-stone-100 cursor-pointer border border-stone-200"
                              >
                                {med.type === 'video' ? (
                                  ytThumb ? (
                                    <img
                                      src={ytThumb}
                                      alt={med.caption || mem.title}
                                      className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-full h-full relative">
                                      <video
                                        src={med.url}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )
                                ) : (
                                  <img
                                    src={med.url}
                                    alt={med.caption || mem.title}
                                    className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                  />
                                )}

                                {med.type === 'video' && (
                                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center text-white">
                                    <Video className="w-7 h-7" />
                                  </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity flex items-end p-2.5 text-white text-[11px]">
                                  <span>{med.caption || 'Ver archivo'}</span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {/* Tags */}
                      {mem.tags && mem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-stone-100">
                          {mem.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* VISTA: CUADRÍCULA ESTILO POLAROID */
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredMemories.map((mem) => {
                const primaryMedia = mem.media[0];
                const dateObj = new Date(mem.date);
                const formattedDate = dateObj.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const ytThumb = primaryMedia ? getVideoThumbnailUrl(primaryMedia.url) : null;

                return (
                  <motion.div
                    key={mem.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                    className="p-3.5 sm:p-4 bg-white rounded-3xl polaroid-card flex flex-col justify-between relative"
                  >
                    <div>
                      {/* Live Edit Mode Actions */}
                      {isLiveEditMode && (
                        <div className="mb-2 p-1.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-1">
                          {onEditMemory && (
                            <button
                              type="button"
                              onClick={() => onEditMemory(mem.id)}
                              className="px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] font-semibold flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                          )}
                          {onDeleteMemory && (
                            <button
                              type="button"
                              onClick={() => onDeleteMemory(mem.id)}
                              className="p-1 rounded-md text-red-500 hover:bg-red-100"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Media Thumbnail */}
                      <div
                        onClick={() => primaryMedia && onSelectMedia(primaryMedia)}
                        className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 mb-3 cursor-pointer group"
                      >
                        {primaryMedia ? (
                          primaryMedia.type === 'video' ? (
                            ytThumb ? (
                              <img
                                src={ytThumb}
                                alt={mem.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <video
                                src={primaryMedia.url}
                                className="w-full h-full object-cover"
                                muted
                              />
                            )
                          ) : (
                            <img
                              src={primaryMedia.url}
                              alt={mem.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300">
                            <ImageIcon className="w-10 h-10" />
                          </div>
                        )}

                        {primaryMedia?.type === 'video' && (
                          <div className="absolute inset-0 bg-black/25 flex items-center justify-center text-white">
                            <Video className="w-8 h-8" />
                          </div>
                        )}

                        <div className="absolute top-2 right-2">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(mem.id);
                            }}
                            className="p-1.5 rounded-full bg-white/90 text-stone-400 hover:text-rose-500 shadow-sm"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${mem.isFavorite ? 'text-rose-500 fill-rose-500' : ''}`}
                            />
                          </motion.button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                        <span>{formattedDate}</span>
                        <span className="uppercase tracking-wider text-[9px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-semibold">
                          {mem.category}
                        </span>
                      </div>

                      <h3 className="font-serif text-base sm:text-lg font-bold text-stone-800 mb-1.5">
                        {mem.title}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-3">
                        {mem.description}
                      </p>
                    </div>

                    {mem.location && (
                      <div className="flex items-center gap-1 text-[10px] text-stone-400 pt-2 border-t border-stone-100">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        <span>{mem.location}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
};
