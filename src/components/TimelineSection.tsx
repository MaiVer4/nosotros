import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Heart, 
  Search, 
  Sparkles, 
  Grid, 
  GitCommit, 
  Video, 
  Image as ImageIcon 
} from 'lucide-react';
import type { Memory, MediaItem } from '../types';

interface TimelineSectionProps {
  memories: Memory[];
  onSelectMedia: (media: MediaItem) => void;
  onToggleFavorite: (id: string) => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  memories,
  onSelectMedia,
  onToggleFavorite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

  // Category labels and icons
  const categories = [
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
        // Category filter
        if (selectedCategory === 'favoritos') {
          if (!mem.isFavorite) return false;
        } else if (selectedCategory !== 'todos') {
          if (mem.category !== selectedCategory) return false;
        }

        // Search filter
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
    <section id="historia" className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Nuestra Historia en Recuerdos</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-800 tracking-tight mb-3">
            Línea del Tiempo
          </h2>
          <p className="font-handwriting text-2xl text-rose-600">
            Cada instante, cada fotografía y cada paso que hemos dado juntos
          </p>
        </div>

        {/* Controls: Search, Filter pills, and View Toggle */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar un recuerdo o lugar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-stone-200/80 bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all placeholder:text-stone-400"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-full bg-stone-100 border border-stone-200/60 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
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
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-white/80 hover:bg-rose-50 text-stone-600 border border-stone-200/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results counter */}
        {filteredMemories.length === 0 ? (
          <div className="p-12 text-center bg-white/60 rounded-3xl border border-dashed border-rose-200">
            <Heart className="w-10 h-10 text-rose-300 mx-auto mb-3" />
            <p className="font-serif text-lg text-stone-700">No encontramos recuerdos para este filtro</p>
            <p className="text-xs text-stone-400 mt-1">Prueba con otra palabra clave o agrega un nuevo recuerdo</p>
          </div>
        ) : viewMode === 'timeline' ? (
          /* VISTA: LÍNEA DE TIEMPO VERTICAL */
          <div className="relative border-l-2 border-rose-200 ml-4 sm:ml-32 space-y-12">
            {filteredMemories.map((mem) => {
              const dateObj = new Date(mem.date);
              const formattedDate = dateObj.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div key={mem.id} className="relative pl-6 sm:pl-10 group">
                  {/* Central Node marker */}
                  <div className="absolute -left-[17px] top-4 w-8 h-8 rounded-full bg-white border-4 border-rose-400 shadow-md flex items-center justify-center group-hover:border-rose-600 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                  </div>

                  {/* Left Date label for desktop */}
                  <div className="hidden sm:block absolute -left-32 top-5 text-right w-24">
                    <span className="font-serif text-sm font-bold text-rose-700 block">
                      {formattedDate}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider text-stone-400">
                      {mem.category}
                    </span>
                  </div>

                  {/* Memory Card */}
                  <div className="p-5 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-md polaroid-shadow border border-stone-200/80 hover:border-rose-200 transition-all">
                    {/* Header of the memory card */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="sm:hidden flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-rose-600">{formattedDate}</span>
                          <span className="text-stone-300">•</span>
                          <span className="text-[10px] uppercase tracking-wider text-stone-400">
                            {mem.category}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-800">
                          {mem.title}
                        </h3>
                        {mem.location && (
                          <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                            <span>{mem.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(mem.id)}
                        title={mem.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                        className={`p-2 rounded-full transition-colors ${
                          mem.isFavorite
                            ? 'text-rose-500 bg-rose-50'
                            : 'text-stone-300 hover:text-rose-400 hover:bg-stone-50'
                        }`}
                      >
                        <Heart
                          className={`w-5 h-5 ${mem.isFavorite ? 'fill-rose-500' : ''}`}
                        />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-stone-600 leading-relaxed mb-4">
                      {mem.description}
                    </p>

                    {/* Media Items (Photos/Videos) */}
                    {mem.media.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {mem.media.map((med, idx) => (
                          <div
                            key={idx}
                            onClick={() => onSelectMedia(med)}
                            className="group/media relative rounded-2xl overflow-hidden aspect-video bg-stone-100 cursor-pointer border border-stone-200"
                          >
                            {med.type === 'video' ? (
                              <div className="w-full h-full relative">
                                <video
                                  src={med.url}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                                  <Video className="w-8 h-8" />
                                </div>
                              </div>
                            ) : (
                              <img
                                src={med.url}
                                alt={med.caption || mem.title}
                                className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity flex items-end p-3 text-white text-xs">
                              <span>{med.caption || 'Ver en pantalla completa'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    {mem.tags && mem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100">
                        {mem.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* VISTA: CUADRÍCULA ESTILO POLAROID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMemories.map((mem) => {
              const primaryMedia = mem.media[0];
              const dateObj = new Date(mem.date);
              const formattedDate = dateObj.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={mem.id}
                  className="p-4 bg-white rounded-3xl polaroid-shadow border border-stone-200/80 flex flex-col justify-between hover:-translate-y-1 transition-all"
                >
                  <div>
                    {/* Media Thumbnail */}
                    <div
                      onClick={() => primaryMedia && onSelectMedia(primaryMedia)}
                      className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 mb-4 cursor-pointer group"
                    >
                      {primaryMedia ? (
                        <img
                          src={primaryMedia.url}
                          alt={mem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(mem.id);
                          }}
                          className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-stone-400 hover:text-rose-500 shadow-sm"
                        >
                          <Heart
                            className={`w-4 h-4 ${mem.isFavorite ? 'text-rose-500 fill-rose-500' : ''}`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                      <span>{formattedDate}</span>
                      <span className="uppercase tracking-wider text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-semibold">
                        {mem.category}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-stone-800 mb-2">
                      {mem.title}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4">
                      {mem.description}
                    </p>
                  </div>

                  {mem.location && (
                    <div className="flex items-center gap-1 text-[11px] text-stone-400 pt-2 border-t border-stone-100">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>{mem.location}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
