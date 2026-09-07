/**
 * Compression d'image côté navigateur, avant envoi à la Server Action.
 *
 * Pourquoi : une photo prise au téléphone pèse 3 à 12 Mo. Même avec
 * `serverActions.bodySizeLimit` relevé, l'envoyer telle quelle est lent et
 * inutile — le livret ne l'affiche jamais au-delà de ~1600 px de large.
 *
 * Stratégie : on réduit le plus grand côté à 1600 px, on ré-encode en WebP
 * (repli JPEG), et on garde le fichier d'origine s'il était déjà plus petit.
 */

const MAX_EDGE = 1600;
const WEBP_QUALITY = 0.82;
const JPEG_QUALITY = 0.85;
/** En dessous, une image déjà petite n'a rien à gagner à être ré-encodée. */
const SKIP_BELOW_BYTES = 300 * 1024;

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

function estFichierImage(file: File): boolean {
  if (file.type && file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|avif|heic|heif|bmp|tiff?)$/i.test(file.name);
}

function chargerViaElementImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

export async function compressImage(file: File): Promise<File> {
  if (typeof window === "undefined") return file;
  // Les formats vectoriels et animés se dégradent à la rastérisation.
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;
  if (!estFichierImage(file)) return file;

  // 1. Tenter le décodage moderne via createImageBitmap
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));

    if (scale === 1 && file.size < SKIP_BELOW_BYTES) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    let blob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
    let extension = "webp";
    if (!blob) {
      blob = await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY);
      extension = "jpg";
    }
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.${extension}`, { type: blob.type, lastModified: Date.now() });
  } catch {
    // 2. Repli éprouvé : chargement via HTMLImageElement (Safari Mac décodant HEIC/JPEG haute def)
    try {
      const img = await chargerViaElementImage(file);
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!w || !h) return file;

      const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
      if (scale === 1 && file.size < SKIP_BELOW_BYTES) return file;

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);

      const ctx = canvas.getContext("2d");
      if (!ctx) return file;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let blob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
      let extension = "webp";
      if (!blob) {
        blob = await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY);
        extension = "jpg";
      }
      if (!blob || blob.size >= file.size) return file;

      const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
      return new File([blob], `${baseName}.${extension}`, { type: blob.type, lastModified: Date.now() });
    } catch (fallbackError) {
      console.warn("Compression impossible, envoi du fichier d'origine", fallbackError);
      return file;
    }
  }
}

/** Taille maximale acceptée après compression (25 Mo pour accueillir les fichiers bruts Mac). */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
