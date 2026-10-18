import React, { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
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
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  media,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) => {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 50 && hasPrev && onPrev) {
        onPrev();
      } else if (diffX < -50 && hasNext && onNext) {
        onNext();
      }
    } else {
      if (diffY > 80) {
        onClose();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!media) return null;

  const embedUrl = media.type === 'video' ? getEmbeddedVideoUrl(media.url) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/92 backdrop-blur-xs select-none"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 p-3 rounded-full text-white/80 hover:text-white bg-black/40 hover:bg-black/60 transition-colors z-20"
          title="Cerrar (Desliza hacia abajo o Esc)"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Prev button */}
        {hasPrev && onPrev && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
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
          className="relative max-w-4xl max-h-[88dvh] flex flex-col items-center"
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
                className="max-w-full max-h-[75dvh] rounded-2xl shadow-2xl"
              />
            )
          ) : (
            <img
              src={media.url}
              alt={media.caption || 'Recuerdo'}
              className="max-w-full max-h-[75dvh] object-contain rounded-2xl shadow-2xl"
            />
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
    </AnimatePresence>
  );
};
