/**
 * Smart client-side image compression & video URL parser
 */

export interface ProcessedMediaResult {
  dataUrl: string;
  type: 'image' | 'video';
  originalSize: number;
  compressedSize: number;
  fileName: string;
}

/**
 * Compresses an image file using HTML5 Canvas (WebP / JPEG fallback)
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<ProcessedMediaResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen no válido.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el compresor gráfico.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        let ext = 'webp';
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          ext = 'jpg';
        }

        const base64Length = dataUrl.split(',')[1]?.length || 0;
        const compressedSize = Math.round((base64Length * 3) / 4);
        const cleanBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');

        resolve({
          dataUrl,
          type: 'image',
          originalSize: file.size,
          compressedSize,
          fileName: `${cleanBase}.${ext}`,
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a short video file into a Data URL (limits to 22MB for GitHub API compatibility)
 */
export async function processVideoFile(
  file: File,
  maxSizeMB = 22
): Promise<ProcessedMediaResult> {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(
      `El video pesa ${(file.size / (1024 * 1024)).toFixed(1)} MB. Para subir directamente a GitHub el máximo es ${maxSizeMB} MB. Para videos más largos, súbelo a YouTube (No listado) o Google Drive y pega el enlace.`
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo de video.'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      resolve({
        dataUrl,
        type: 'video',
        originalSize: file.size,
        compressedSize: file.size,
        fileName: cleanName,
      });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Processes either an image or video File
 */
export async function processMediaFile(file: File): Promise<ProcessedMediaResult> {
  if (file.type.startsWith('video/')) {
    return processVideoFile(file);
  }
  if (file.type.startsWith('image/')) {
    return compressImageFile(file);
  }
  throw new Error('Tipo de archivo no soportado. Selecciona una foto o un video.');
}

/**
 * Detects if a URL is an embeddable video (YouTube, Vimeo, Google Drive)
 */
export function getEmbeddedVideoUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // YouTube standard, short, or shorts URL
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Google Drive file link -> preview embed
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  return null;
}

/**
 * Extracts YouTube thumbnail if available for grid previews
 */
export function getVideoThumbnailUrl(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
