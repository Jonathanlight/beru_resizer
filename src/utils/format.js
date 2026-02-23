/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * Format dimensions string
 */
export function formatDimensions(w, h) {
  return `${w} × ${h}`
}

/**
 * Calculate size reduction percentage
 */
export function reductionPercent(original, resized) {
  if (!original || !resized) return 0
  return Math.round(((original - resized) / original) * 100)
}
