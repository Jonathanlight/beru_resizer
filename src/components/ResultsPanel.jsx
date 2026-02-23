import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatBytes, reductionPercent } from '../utils/format'

/**
 * Shows resize results with before/after comparisons.
 */
export default function ResultsPanel({ results, outputDir, onReset }) {
  if (!results || results.length === 0) return null

  const successCount = results.filter((r) => r.success).length
  const totalSaved = results
    .filter((r) => r.success)
    .reduce((sum, r) => sum + (r.originalSize - r.newSize), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-3"
    >
      {/* Summary */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-xs font-medium text-white/60">
            {successCount}/{results.length} resized
          </span>
          {totalSaved > 0 && (
            <span className="text-[11px] font-mono text-emerald-400/60">
              ({formatBytes(Math.abs(totalSaved))} {totalSaved > 0 ? 'saved' : 'added'})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {outputDir && (
            <button
              onClick={() => window.electronAPI?.openPath(outputDir)}
              className="text-[11px] text-neon-cyan/60 hover:text-neon-cyan transition-colors"
            >
              Open folder
            </button>
          )}
          <button
            onClick={onReset}
            className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
          >
            New batch
          </button>
        </div>
      </div>

      {/* Results list */}
      <div className="flex flex-col gap-1 max-h-[240px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {results.map((r, i) => (
            <motion.div
              key={r.originalName + i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md border
                ${r.success
                  ? 'monarch-card'
                  : 'bg-red-500/[0.04] border border-red-500/10'
                }
              `}
            >
              {/* Status dot */}
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                r.success ? 'bg-emerald-500' : 'bg-red-500'
              }`} />

              {/* Name */}
              <span className="text-xs text-white/60 truncate flex-1 min-w-0">
                {r.originalName}
              </span>

              {r.success ? (
                <div className="flex items-center gap-3 shrink-0">
                  {/* Dimensions */}
                  <span className="text-[11px] font-mono text-white/30">
                    {r.newWidth}×{r.newHeight}
                  </span>
                  {/* Size change */}
                  <span className={`text-[11px] font-mono ${
                    r.newSize < r.originalSize ? 'text-emerald-400/60' : 'text-amber-400/60'
                  }`}>
                    {formatBytes(r.newSize)}
                    <span className="text-white/20 ml-1">
                      ({r.newSize < r.originalSize ? '-' : '+'}{Math.abs(reductionPercent(r.originalSize, r.newSize))}%)
                    </span>
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-red-400/60 truncate max-w-[160px]">
                  {r.error}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
