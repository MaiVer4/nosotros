import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MediaItem } from '../types';
import { getEmbeddedVideoUrl } from '../utils/mediaProcessor';

interface MediaLightboxProps {
  media: MediaItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalCount?: number;
  contextTitle?: string;
  contextDate?: string;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  media,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  currentIndex,
  totalCount,
  contextTitle,
  contextDate,
}) => {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleClose = () => {
    setIsZoomed(false);
    onClose();
  };

  useEffect(() => {
    if (!media) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZoomed(false);
        onClose();
      }
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) {
        setIsZoomed(false);
        onPrev();
      }
      if (e.key === 'ArrowRight' && hasNext && onNext) {
        setIsZoomed(false);
        onNext();
      }
      if ((e.key === 'z' || e.key === '+') && media.type !== 'video') {
        setIsZoomed((z) => !z);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [media, onClose, onPrev, onNext, hasPrev, hasNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null || isZoomed)
      return;

    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 50 && hasPrev && onPrev) {
        setIsZoomed(false);
        onPrev();
      } else if (diffX < -50 && hasNext && onNext) {
        setIsZoomed(false);
        onNext();
      }
    } else if (diffY > 80) {
      handleClose();
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const embedUrl =
    media && media.type === 'video' ? getEmbeddedVideoUrl(media.url) : null;

  return (
    <AnimatePresence>
      {media && (
        <motion.div
          key="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-3 sm:p-4 bg-black/92 backdrop-blur-xs select-none"
        >
          {/* Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 left-0 right-0 px-3 sm:px-6 py-3 flex items-center justify-between gap-3 bg-gradient-to-b from-black/75 to-transparent z-20"
          >
            <div className="min-w-0 text-white">
              {(contextTitle || contextDate) && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm">
                  {contextTitle && (
                    <span className="font-serif font-semibold truncate max-w-[55vw]">
                      {contextTitle}
                    </span>
                  )}
                  {contextDate && (
                    <span className="text-rose-300 text-[11px] font-medium">
                      • {contextDate}
                    </span>
                  )}
                </div>
              )}
              {typeof currentIndex === 'number' && typeof totalCount === 'number' && (
                <span className="text-[11px] text-white/70 font-medium">
                  {currentIndex + 1} / {totalCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {media.type !== 'video' && (
                <button
                  type="button"
                  onClick={() => setIsZoomed((z) => !z)}
                  className="p-2.5 rounded-full text-white/80 hover:text-white bg-black/40 hover:bg-black/60 transition-colors"
                  title={isZoomed ? 'Alejar' : 'Acercar (Zoom)'}
                >
                  {isZoomed ? (
                    <ZoomOut className="w-5 h-5" />
                  ) : (
                    <ZoomIn className="w-5 h-5" />
                  )}
                </button>
              )}

              {!embedUrl && (
                <a
                  href={media.url}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="p-2.5 rounded-full text-white/80 hover:text-white bg-black/40 hover:bg-black/60 transition-colors"
                  title="Descargar archivo"
                >
                  <Download className="w-5 h-5" />
                </a>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="p-2.5 rounded-full text-white/80 hover:text-white bg-black/40 hover:bg-black/60 transition-colors"
                title="Cerrar (Desliza hacia abajo o Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Prev button */}
          {hasPrev && onPrev && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(false);
                onPrev();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full text-white/80 hover:text-white bg-black/40 hover:bg-black/60 transition-colors z-20"
              title="Anterior"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {/* Next button */}
          {hasNext && onNext && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(false);
                onNext();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full text-white/80 hover:text-white bg-black/40 hover:bg-black/60 transition-colors z-20"
              title="Siguiente"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {/* Media content */}
          <motion.div
            key={media.url}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85dvh] flex flex-col items-center mt-8"
          >
            {media.type === 'video' ? (
              embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={media.caption || 'Video'}
                  className="w-[88vw] max-w-3xl aspect-video rounded-2xl shadow-2xl border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={media.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-w-full max-h-[72dvh] rounded-2xl shadow-2xl"
                />
              )
            ) : (
              <div
                className={`overflow-auto max-w-[92vw] max-h-[74dvh] rounded-2xl ${
                  isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onDoubleClick={() => setIsZoomed((z) => !z)}
              >
                <img
                  src={media.url}
                  alt={media.caption || 'Recuerdo'}
                  className={`rounded-2xl shadow-2xl transition-transform duration-200 ${
                    isZoomed
                      ? 'scale-150 origin-center max-w-none max-h-none w-auto h-[72dvh]'
                      : 'max-w-full max-h-[72dvh] object-contain'
                  }`}
                />
              </div>
            )}

            {media.caption && (
              <p className="mt-3 text-center font-handwriting text-rose-200 text-base sm:text-xl px-4 max-w-xl">
                {media.caption}
              </p>
            )}

            <p className="text-[11px] text-white/40 mt-1 block sm:hidden">
              Desliza ← / → para navegar • Desliza ↓ para cerrar
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
