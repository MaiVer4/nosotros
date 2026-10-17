import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MediaItem } from '../types';

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  if (!media) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors z-10"
        title="Cerrar (Esc)"
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
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <ChevronLeft className="w-8 h-8" />
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
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Media content */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
      >
        {media.type === 'video' ? (
          <video
            src={media.url}
            controls
            autoPlay
            className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl"
          />
        ) : (
          <img
            src={media.url}
            alt={media.caption || 'Recuerdo'}
            className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
          />
        )}

        {media.caption && (
          <p className="mt-4 text-center text-sm font-handwriting text-rose-200 text-lg px-4 max-w-xl">
            {media.caption}
          </p>
        )}
      </div>
    </div>
  );
};
