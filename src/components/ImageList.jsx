import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatBytes, formatDimensions } from '../utils/format'

/**
 * List of loaded images with thumbnails, metadata, and remove action.
 */
export default function ImageList({ images, onRemove, onClear }) {
  if (images.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
          {images.length} image{images.length > 1 ? 's' : ''} loaded
        </span>
        <button
          onClick={onClear}
          className="text-xs text-white/30 hover:text-red-400 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Image list */}
      <div className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {images.map((img) => (
            <motion.div
              key={img.path}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 p-2 rounded-md monarch-card group"
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded overflow-hidden bg-abyss-100 shrink-0">
                {img.thumbnail ? (
                  <img
                    src={img.thumbnail}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/70 truncate">
                  {img.name}
                </p>
                <p className="text-[11px] text-white/30 font-mono">
                  {formatDimensions(img.width, img.height)} · {formatBytes(img.size)} · {img.format?.toUpperCase()}
                </p>
              </div>

              {/* Remove */}
              <button
                onClick={() => onRemove(img.path)}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/10 transition-all shrink-0"
                aria-label="Remove"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" className="text-white/30 hover:text-red-400">
                  <line x1="2" y1="2" x2="10" y2="10" />
                  <line x1="10" y1="2" x2="2" y2="10" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
