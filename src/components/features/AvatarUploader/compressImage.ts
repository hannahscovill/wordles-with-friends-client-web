const MAX_FILE_SIZE: number = 2 * 1024 * 1024; // 2MB
const MAX_DIMENSION: number = 1024;
const INITIAL_QUALITY: number = 0.9;
const MIN_QUALITY: number = 0.5;
const QUALITY_STEP: number = 0.1;

/**
 * Load a File as an HTMLImageElement.
 */
const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img: HTMLImageElement = new Image();
    const url: string = URL.createObjectURL(file);
    img.onload = (): void => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (): void => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression.'));
    };
    img.src = url;
  });

/**
 * Draw an image onto a canvas, scaling down if either dimension exceeds MAX_DIMENSION.
 * Returns the canvas with the drawn image.
 */
const drawToCanvas = (img: HTMLImageElement): HTMLCanvasElement => {
  let { width, height } = img;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale: number = Math.min(
      MAX_DIMENSION / width,
      MAX_DIMENSION / height,
    );
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
  // Fill white background (in case of PNG with transparency → JPEG)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return canvas;
};

/**
 * Export a canvas as a JPEG Blob at the given quality.
 */
const canvasToBlob = (
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob: Blob | null) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas compression failed.'));
      },
      'image/jpeg',
      quality,
    );
  });

/**
 * Compress an image file to fit under the 2MB upload limit.
 *
 * Strategy:
 * 1. If the file is already under 2MB, return it unchanged.
 * 2. Resize to max 1024x1024 (preserving aspect ratio).
 * 3. Export as JPEG, reducing quality iteratively until under 2MB.
 * 4. If even minimum quality exceeds 2MB, throw an error.
 */
export const compressImage = async (file: File): Promise<File> => {
  if (file.size <= MAX_FILE_SIZE) {
    return file;
  }

  const img: HTMLImageElement = await loadImage(file);
  const canvas: HTMLCanvasElement = drawToCanvas(img);

  let quality: number = INITIAL_QUALITY;
  let blob: Blob = await canvasToBlob(canvas, quality);

  while (blob.size > MAX_FILE_SIZE && quality > MIN_QUALITY) {
    quality -= QUALITY_STEP;
    blob = await canvasToBlob(canvas, quality);
  }

  if (blob.size > MAX_FILE_SIZE) {
    throw new Error(
      'Image is too large to compress. Please use a smaller image.',
    );
  }

  const compressedName: string = file.name.replace(/\.\w+$/, '.jpg');
  return new File([blob], compressedName, { type: 'image/jpeg' });
};
