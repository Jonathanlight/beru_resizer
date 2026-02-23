import React, { useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * Resize configuration panel:
 * - Mode toggle (percentage / dimensions)
 * - Percentage slider
 * - Width / Height inputs with aspect ratio lock
 * - Output format selector
 */
export default function ResizeControls({ settings, onChange, referenceImage }) {
  const { mode, percentage, width, height, keepAspect, format } = settings

  const update = useCallback(
    (partial) => onChange({ ...settings, ...partial }),
    [settings, onChange]
  )

  // When reference image changes and mode is dimensions, pre-fill dimensions
  useEffect(() => {
    if (referenceImage && mode === 'dimensions' && !width && !height) {
      update({ width: referenceImage.width, height: referenceImage.height })
    }
  }, [referenceImage]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleWidthChange = useCallback(
    (newW) => {
      const w = Math.max(1, parseInt(newW) || 0)
      if (keepAspect && referenceImage) {
        const ratio = referenceImage.height / referenceImage.width
        update({ width: w, height: Math.round(w * ratio) })
      } else {
        update({ width: w })
      }
    },
    [keepAspect, referenceImage, update]
  )

  const handleHeightChange = useCallback(
    (newH) => {
      const h = Math.max(1, parseInt(newH) || 0)
      if (keepAspect && referenceImage) {
        const ratio = referenceImage.width / referenceImage.height
        update({ width: Math.round(h * ratio), height: h })
      } else {
        update({ height: h })
      }
    },
    [keepAspect, referenceImage, update]
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 p-0.5 rounded-md bg-abyss/40 border border-neon-violet/[0.08]">
        {['percentage', 'dimensions'].map((m) => (
          <button
            key={m}
            onClick={() => update({ mode: m })}
            className={`
              flex-1 py-1.5 text-xs font-medium rounded transition-all duration-150
              ${mode === m
                ? 'bg-neon-violet/20 text-neon-violet-light border border-neon-violet/30'
                : 'text-white/40 hover:text-white/60 border border-transparent'
              }
            `}
          >
            {m === 'percentage' ? 'Percentage' : 'Dimensions'}
          </button>
        ))}
      </div>

      {/* Percentage mode */}
      {mode === 'percentage' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/40">Scale</label>
            <span className="text-sm font-mono font-medium text-neon-cyan">
              {percentage}%
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="200"
            value={percentage}
            onChange={(e) => update({ percentage: parseInt(e.target.value) })}
            className="w-full h-1 rounded-full appearance-none cursor-pointer
              bg-white/[0.06]
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3.5
              [&::-webkit-slider-thumb]:h-3.5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-neon-violet
              [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(124,58,237,0.5)]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-shadow
              [&::-webkit-slider-thumb]:hover:shadow-[0_0_16px_rgba(124,58,237,0.7)]
            "
          />
          <div className="flex justify-between text-[10px] text-white/20 font-mono">
            <span>1%</span>
            <span>100%</span>
            <span>200%</span>
          </div>
        </div>
      )}

      {/* Dimensions mode */}
      {mode === 'dimensions' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {/* Width */}
            <div className="flex-1">
              <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                Width
              </label>
              <input
                type="number"
                value={width || ''}
                onChange={(e) => handleWidthChange(e.target.value)}
                placeholder="px"
                className="w-full px-3 py-2 rounded-md monarch-input text-sm font-mono text-white/80 placeholder:text-white/20"
              />
            </div>

            {/* Lock button */}
            <button
              onClick={() => update({ keepAspect: !keepAspect })}
              className={`
                mt-4 w-8 h-8 flex items-center justify-center rounded-md border transition-all
                ${keepAspect
                  ? 'bg-neon-violet/10 border-neon-violet/30 text-neon-violet'
                  : 'bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50'
                }
              `}
              title={keepAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
            >
              {keepAspect ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 019.9-1" />
                </svg>
              )}
            </button>

            {/* Height */}
            <div className="flex-1">
              <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                Height
              </label>
              <input
                type="number"
                value={height || ''}
                onChange={(e) => handleHeightChange(e.target.value)}
                placeholder="px"
                className="w-full px-3 py-2 rounded-md monarch-input text-sm font-mono text-white/80 placeholder:text-white/20"
              />
            </div>
          </div>
        </div>
      )}

      {/* Output format */}
      <div>
        <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block">
          Output format
        </label>
        <div className="flex gap-1">
          {['original', 'jpeg', 'png', 'webp'].map((f) => (
            <button
              key={f}
              onClick={() => update({ format: f })}
              className={`
                flex-1 py-1.5 text-[11px] font-mono rounded-md border transition-all
                ${format === f
                  ? 'bg-neon-violet/10 border-neon-violet/30 text-neon-violet-light shadow-[0_0_12px_rgba(124,58,237,0.1)]'
                  : 'bg-abyss/30 border-neon-violet/[0.06] text-white/30 hover:text-white/50 hover:border-neon-violet/20'
                }
              `}
            >
              {f === 'original' ? 'Same' : f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Preview dimensions if percentage mode */}
      {mode === 'percentage' && referenceImage && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 py-2 rounded-md bg-abyss/40 border border-neon-violet/[0.08] backdrop-blur-sm"
        >
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">
            Preview dimensions
          </p>
          <p className="text-xs font-mono text-neon-cyan/80">
            {Math.round(referenceImage.width * percentage / 100)} × {Math.round(referenceImage.height * percentage / 100)} px
          </p>
        </motion.div>
      )}
    </div>
  )
}
