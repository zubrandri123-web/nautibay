// Client-side image compression before upload. Phone photos routinely land
// at 3-8 MB; a listing photo is never displayed larger than ~1600px on
// screen, so anything beyond that is wasted space on the free storage tier.
// Resizing + re-encoding as JPEG in the browser (via <canvas>) needs no
// extra dependency and typically gets a photo down to ~150-300 KB with no
// visible quality loss at web sizes.
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.8;

export async function compressImage(file: File): Promise<File> {
  // Skip formats canvas re-encoding would just make worse or that aren't
  // photos to begin with.
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob || blob.size >= file.size) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}
