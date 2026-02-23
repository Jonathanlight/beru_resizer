import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EnergyLoader from './EnergyLoader'

/**
 * Full-screen overlay shown during resize operation.
 * Displays the energy loader with progress info.
 */
export default function ProgressOverlay({ isVisible, progress, current, total, fileName }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-abyss/90 backdrop-blur-sm"
        >
          {/* Energy loader */}
          <EnergyLoader
            progress={total > 0 ? (current / total) * 100 : 0}
            label={fileName ? `Processing ${fileName}` : 'Initializing...'}
          />

          {/* Counter */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 flex items-center gap-2"
          >
            <span className="text-xs font-mono text-neon-violet/80">
              {current} / {total}
            </span>
          </motion.div>

          {/* Progress bar */}
          <div className="mt-4 w-48 progress-aura">
            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-neon-violet to-neon-cyan"
                initial={{ width: 0 }}
                animate={{ width: `${total > 0 ? (current / total) * 100 : 0}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
