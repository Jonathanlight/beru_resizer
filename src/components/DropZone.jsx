import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/avif']
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.avif']

/**
 * Drag & drop zone + upload button for image selection.
 * Provides visual feedback during drag hover.
 */
export default function DropZone({ onFilesSelected, disabled }) {
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const handleFiles = useCallback(
    (paths) => {
      if (disabled) return
      const valid = paths.filter((p) => {
        const ext = p.toLowerCase().slice(p.lastIndexOf('.'))
        return ACCEPTED_EXTENSIONS.includes(ext)
      })
      if (valid.length > 0) onFilesSelected(valid)
    },
    [onFilesSelected, disabled]
  )

  const onDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }, [])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      dragCounter.current = 0
      const files = Array.from(e.dataTransfer.files)
      const paths = files.map((f) => window.electronAPI?.getPathForFile(f)).filter(Boolean)
      handleFiles(paths)
    },
    [handleFiles]
  )

  const onClickUpload = useCallback(async () => {
    if (disabled) return
    const paths = await window.electronAPI?.openImages()
    if (paths?.length) handleFiles(paths)
  }, [handleFiles, disabled])

  return (
    <motion.div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClickUpload}
      className={`
        relative cursor-pointer rounded-lg border border-dashed transition-all duration-200 backdrop-blur-sm
        ${isDragging
          ? 'border-neon-cyan bg-neon-cyan/[0.04] drop-active'
          : 'border-neon-violet/[0.12] bg-abyss/40 hover:border-neon-violet/30 hover:bg-abyss/60 hover:shadow-[0_0_24px_rgba(124,58,237,0.06)]'
        }
        ${disabled ? 'opacity-40 pointer-events-none' : ''}
      `}
      whileHover={!disabled ? { scale: 1.005 } : {}}
      whileTap={!disabled ? { scale: 0.995 } : {}}
    >
      <div className="flex flex-col items-center justify-center py-10 px-6 gap-3">
        {/* Icon */}
        <AnimatePresence mode="wait">
          {isDragging ? (
            <motion.div
              key="drop"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="w-12 h-12 rounded-full bg-neon-cyan/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neon-cyan">
                  <path d="M12 3v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="w-12 h-12 rounded-full bg-neon-violet/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neon-violet">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text */}
        <div className="text-center">
          <p className="text-sm font-medium text-white/70">
            {isDragging ? 'Release to drop images' : 'Drop images here'}
          </p>
          <p className="text-xs text-white/30 mt-1">
            or click to browse — JPG, PNG, WebP, GIF, BMP, TIFF, AVIF
          </p>
        </div>
      </div>
    </motion.div>
  )
}
