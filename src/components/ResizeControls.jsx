import React, { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MOBILE_PRESETS } from '../constants/mobilePresets'

const MODES = ['percentage', 'dimensions', 'presets']
const MODE_LABELS = { percentage: 'Percentage', dimensions: 'Dimensions', presets: 'Presets' }

export default function ResizeControls({ settings, onChange, referenceImage }) {
  const { mode, percentage, width, height, keepAspect, format } = settings
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [presetPlatform, setPresetPlatform] = useState('ios')

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

  const applyPreset = useCallback((preset) => {
    setSelectedPreset(preset.id)
    update({
      mode: 'presets',
      width: preset.width,
      height: preset.height,
      keepAspect: false,
    })
  }, [update])

  const presets = MOBILE_PRESETS[presetPlatform]

  return (
    <div className="flex flex-col gap-4">
      {/* Mode toggle — 3 tabs */}
      <div className="flex items-center gap-1 p-0.5 rounded-md bg-abyss/40 border border-neon-violet/[0.08]">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => {
              update({ mode: m })
              if (m !== 'presets') setSelectedPreset(null)
            }}
            className={`
              flex-1 py-1.5 text-xs font-medium rounded transition-all duration-150
              ${mode === m
                ? 'bg-neon-violet/20 text-neon-violet-light border border-neon-violet/30'
                : 'text-white/40 hover:text-white/60 border border-transparent'
              }
            `}
          >
            {MODE_LABELS[m]}
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

      {/* Mobile Presets mode */}
      {mode === 'presets' && (
        <div className="flex flex-col gap-3">
          {/* Platform toggle */}
          <div className="flex items-center gap-1 p-0.5 rounded-md bg-abyss/40 border border-neon-violet/[0.06]">
            <button
              onClick={() => setPresetPlatform('ios')}
              className={`
                flex-1 py-1.5 text-xs font-medium rounded transition-all duration-150 inline-flex items-center justify-center gap-1.5
                ${presetPlatform === 'ios'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'text-white/40 hover:text-white/60 border border-transparent'
                }
              `}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              iOS
            </button>
            <button
              onClick={() => setPresetPlatform('android')}
              className={`
                flex-1 py-1.5 text-xs font-medium rounded transition-all duration-150 inline-flex items-center justify-center gap-1.5
                ${presetPlatform === 'android'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-white/40 hover:text-white/60 border border-transparent'
                }
              `}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.86-.31-.16-.69-.04-.86.27l-1.87 3.23C14.75 8.34 12.93 8 11 8s-3.75.34-5.44.94L3.69 5.71c-.17-.31-.55-.43-.86-.27-.31.17-.43.55-.27.86L4.4 9.48C1.82 11.11 0 13.85 0 17h22c0-3.15-1.82-5.89-4.4-7.52zM7 15.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm8 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"/></svg>
              Android
            </button>
          </div>

          {/* Presets grid */}
          <div className="grid grid-cols-2 gap-1.5">
            <AnimatePresence mode="wait">
              {presets.map((preset) => {
                const isSelected = selectedPreset === preset.id
                const isSquare = preset.width === preset.height
                const isLandscape = preset.width > preset.height
                return (
                  <motion.button
                    key={preset.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => applyPreset(preset)}
                    className={`
                      relative flex items-center gap-2.5 px-3 py-2.5 rounded-md border text-left transition-all duration-150
                      ${isSelected
                        ? presetPlatform === 'ios'
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]'
                      }
                    `}
                  >
                    {/* Device shape indicator */}
                    <div className={`
                      shrink-0 rounded-[2px] border
                      ${isSelected
                        ? presetPlatform === 'ios' ? 'border-blue-500/40 bg-blue-500/10' : 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-white/[0.08] bg-white/[0.03]'
                      }
                      ${isSquare ? 'w-5 h-5' : isLandscape ? 'w-6 h-4' : 'w-4 h-6'}
                    `} />

                    <div className="flex-1 min-w-0">
                      <div className={`text-[11px] font-medium truncate ${
                        isSelected ? 'text-white/80' : 'text-white/50'
                      }`}>
                        {preset.name}
                      </div>
                      <div className={`text-[10px] font-mono ${
                        isSelected
                          ? presetPlatform === 'ios' ? 'text-blue-400/60' : 'text-emerald-400/60'
                          : 'text-white/25'
                      }`}>
                        {preset.width} x {preset.height}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Selected preset feedback */}
          {selectedPreset && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-2 rounded-md bg-abyss/40 border border-neon-violet/[0.08]"
            >
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">
                Target dimensions
              </p>
              <p className="text-xs font-mono text-neon-cyan/80">
                {width} x {height} px
              </p>
            </motion.div>
          )}
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
            {Math.round(referenceImage.width * percentage / 100)} x {Math.round(referenceImage.height * percentage / 100)} px
          </p>
        </motion.div>
      )}
    </div>
  )
}
