/**
 * Shrinks an uploaded photo before it goes to storage: longest side at most `maxSide`, saved as WebP,
 * which keeps a background-removed photo transparent. Falls back to a resized PNG where the browser
 * can't write WebP, and to the original file when neither comes out smaller.
 */
export async function shrinkImageFile(file, { maxSide = 1200, quality = 0.85 } = {}) {
  if (!file?.type?.startsWith('image/') || /gif|svg/.test(file.type)) return file

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  context.imageSmoothingQuality = 'high'
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()

  const encode = (type) => new Promise((resolve) => canvas.toBlob(resolve, type, quality))
  let blob = await encode('image/webp')
  // Safari hands back a PNG when asked for WebP.
  if (blob?.type !== 'image/webp') blob = scale < 1 ? await encode('image/png') : null
  if (!blob || blob.size >= file.size) return file

  const extension = blob.type === 'image/webp' ? 'webp' : 'png'
  const name = `${file.name.replace(/\.[^.]+$/, '') || 'photo'}.${extension}`
  return new File([blob], name, { type: blob.type })
}
