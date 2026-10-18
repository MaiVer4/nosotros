import React, { useState, useRef } from 'react';
import {
  Upload,
  Trash2,
  Link as LinkIcon,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Video,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import type { MediaItem } from '../types';
import {
  processMediaFile,
  getEmbeddedVideoUrl,
  getVideoThumbnailUrl,
  formatBytes,
} from '../utils/mediaProcessor';

interface MediaManagerEditorProps {
  items: MediaItem[];
  onChange: (updated: MediaItem[]) => void;
  label?: string;
}

export const MediaManagerEditor: React.FC<MediaManagerEditorProps> = ({
  items,
  onChange,
  label = 'Fotos y Videos',
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [externalCaption, setExternalCaption] = useState('');
  const [externalType, setExternalType] = useState<'image' | 'video'>('image');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setStatusMsg(null);

    const newMediaItems: MediaItem[] = [];
    let totalSavedBytes = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const processed = await processMediaFile(file);
        totalSavedBytes += Math.max(0, processed.originalSize - processed.compressedSize);
        newMediaItems.push({
          id: `media-${Date.now()}-${i}`,
          type: processed.type,
          url: processed.dataUrl,
          caption: '',
        });
      }

      onChange([...items, ...newMediaItems]);
      if (totalSavedBytes > 0) {
        setStatusMsg(
          `¡${newMediaItems.length} archivo(s) optimizado(s)! (Ahorraste ${formatBytes(totalSavedBytes)})`
        );
      } else {
        setStatusMsg(`¡${newMediaItems.length} archivo(s) añadido(s) correctamente!`);
      }
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al procesar archivo.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceIndex === null) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const processed = await processMediaFile(file);
      const updated = [...items];
      updated[replaceIndex] = {
        ...updated[replaceIndex],
        type: processed.type,
        url: processed.dataUrl,
      };
      onChange(updated);
      setStatusMsg('¡Imagen reemplazada y optimizada!');
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al reemplazar archivo.');
    } finally {
      setIsProcessing(false);
      setReplaceIndex(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleAddExternalUrl = () => {
    const trimmed = externalUrl.trim();
    if (!trimmed) return;

    const isEmbed = Boolean(getEmbeddedVideoUrl(trimmed));
    const isVideoExt = /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(trimmed);
    const detectedType: 'image' | 'video' =
      externalType === 'video' || isEmbed || isVideoExt ? 'video' : 'image';

    const newItem: MediaItem = {
      id: `media-url-${Date.now()}`,
      type: detectedType,
      url: trimmed,
      caption: externalCaption.trim() || undefined,
    };

    onChange([...items, newItem]);
    setExternalUrl('');
    setExternalCaption('');
    setShowUrlInput(false);
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      caption,
    };
    onChange(updated);
  };

  const handleUrlDirectChange = (index: number, url: string) => {
    const updated = [...items];
    const isEmbed = Boolean(getEmbeddedVideoUrl(url));
    const isVideoExt = /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);
    updated[index] = {
      ...updated[index],
      url,
      type: isEmbed || isVideoExt ? 'video' : updated[index].type,
    };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
          {label} ({items.length})
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden file input for adding multiple files */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Hidden file input for replacing a single file */}
          <input
            ref={replaceInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleReplaceFile}
            className="hidden"
          />

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
          >
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>Subir Foto / Video</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-all"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Pegar Enlace / YouTube</span>
          </button>
        </div>
      </div>

      {/* Status / Error notifications */}
      {statusMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* External URL Adder Box */}
      {showUrlInput && (
        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">
              Añadir por enlace (Imagen, YouTube, Drive o MP4)
            </span>
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setExternalType('image')}
                className={`px-2 py-0.5 rounded-md font-medium ${
                  externalType === 'image'
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-stone-600'
                }`}
              >
                Foto
              </button>
              <button
                type="button"
                onClick={() => setExternalType('video')}
                className={`px-2 py-0.5 rounded-md font-medium ${
                  externalType === 'video'
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-stone-600'
                }`}
              >
                Video
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder="https://... (Enlace de foto, YouTube, Google Drive, etc.)"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
          />

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Texto / pie de foto para esta imagen o video..."
              value={externalCaption}
              onChange={(e) => setExternalCaption(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <button
              type="button"
              onClick={handleAddExternalUrl}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0"
            >
              Añadir
            </button>
          </div>
        </div>
      )}

      {/* List of Media Items */}
      {items.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-6 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/30 hover:bg-rose-50/60 text-center cursor-pointer transition-colors"
        >
          <ImageIcon className="w-7 h-7 text-rose-300 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-stone-600">
            No hay fotos ni videos aquí todavía. Toca para subir desde tu galería o PC.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const ytThumb = getVideoThumbnailUrl(item.url);
            const embedUrl = getEmbeddedVideoUrl(item.url);

            return (
              <div
                key={item.id || idx}
                className="p-3 rounded-2xl bg-stone-50 border border-stone-200/90 flex flex-col sm:flex-row items-start sm:items-center gap-3"
              >
                {/* Thumbnail Preview */}
                <div className="relative w-full sm:w-24 h-36 sm:h-20 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300">
                  {item.type === 'video' ? (
                    ytThumb ? (
                      <img
                        src={ytThumb}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : embedUrl ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-stone-800 text-white text-[10px] p-1 text-center">
                        <Video className="w-5 h-5 mb-0.5 text-rose-400" />
                        <span>Video Embebido</span>
                      </div>
                    ) : (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    )
                  ) : (
                    <img
                      src={item.url}
                      alt={item.caption || `Imagen ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold uppercase">
                    {item.type === 'video' ? '🎥 Video' : '📷 Foto'} #{idx + 1}
                  </span>
                </div>

                {/* Caption & URL inputs */}
                <div className="flex-1 w-full space-y-1.5">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-stone-400 mb-0.5">
                      Texto / Pie de foto de esta imagen:
                    </label>
                    <input
                      type="text"
                      placeholder="Escribe la descripción o frase que aparece debajo de la foto..."
                      value={item.caption || ''}
                      onChange={(e) => handleCaptionChange(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  {/* Allow editing URL if not a huge base64 string, or show badge if uploaded file */}
                  {item.url.startsWith('data:') ? (
                    <div className="flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <span>✅ Archivo subido desde tu dispositivo</span>
                      <button
                        type="button"
                        onClick={() => {
                          setReplaceIndex(idx);
                          replaceInputRef.current?.click();
                        }}
                        className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:underline"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Cambiar foto</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => handleUrlDirectChange(idx, e.target.value)}
                        placeholder="URL de la foto o video"
                        className="flex-1 px-2.5 py-1 rounded-lg border border-stone-200 text-[11px] text-stone-500 bg-white focus:outline-none focus:ring-1 focus:ring-rose-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setReplaceIndex(idx);
                          replaceInputRef.current?.click();
                        }}
                        title="Subir otra foto en lugar de esta"
                        className="px-2.5 py-1 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-[11px] font-medium shrink-0 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Cambiar</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Action buttons: Move Up / Move Down / Delete */}
                <div className="flex sm:flex-col items-center justify-end gap-1 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-200/60">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    title="Subir posición"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    title="Bajar posición"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    title="Eliminar esta foto/video"
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
