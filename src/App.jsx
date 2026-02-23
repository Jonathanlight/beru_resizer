import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import TitleBar from './components/TitleBar'
import DropZone from './components/DropZone'
import ImageList from './components/ImageList'
import ResizeControls from './components/ResizeControls'
import ProgressOverlay from './components/ProgressOverlay'
import ResultsPanel from './components/ResultsPanel'
import ShadowFlameBackground from './components/ShadowFlameBackground'
import { useLocalStorage } from './hooks/useLocalStorage'
import { playCompleteSound } from './utils/sound'

const DEFAULT_SETTINGS = {
  mode: 'percentage',
  percentage: 50,
  width: 0,
  height: 0,
  keepAspect: true,
  format: 'original',
}

export default function App() {
  // Persisted settings
  const [settings, setSettings] = useLocalStorage('beru:settings', DEFAULT_SETTINGS)
  const [soundEnabled, setSoundEnabled] = useLocalStorage('beru:sound', true)
  const [outputDir, setOutputDir] = useLocalStorage('beru:outputDir', null)

  // Session state
  const [images, setImages] = useState([])
  const [isResizing, setIsResizing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, fileName: '' })
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  // Background animation state
  const [bgPulse, setBgPulse] = useState(false)

  const cleanupRef = useRef(null)

  // Listen for resize progress from main process
  useEffect(() => {
    cleanupRef.current = window.electronAPI?.onResizeProgress((data) => {
      setProgress(data)
    })
    return () => cleanupRef.current?.()
  }, [])

  // Load files from paths — get metadata + thumbnails
  const loadFiles = useCallback(async (paths) => {
    setError(null)
    const newImages = []
    for (const filePath of paths) {
      if (images.some((img) => img.path === filePath)) continue
      const info = await window.electronAPI?.getImageInfo(filePath)
      if (info?.error) {
        setError(`Failed to read: ${info.path}`)
        continue
      }
      const thumbnail = await window.electronAPI?.getImageThumbnail(filePath)
      newImages.push({ ...info, thumbnail })
    }
    setImages((prev) => [...prev, ...newImages])
  }, [images])

  const removeImage = useCallback((path) => {
    setImages((prev) => prev.filter((img) => img.path !== path))
  }, [])

  const clearImages = useCallback(() => {
    setImages([])
    setResults(null)
    setError(null)
  }, [])

  const selectOutputDir = useCallback(async () => {
    const dir = await window.electronAPI?.selectOutputDir()
    if (dir) setOutputDir(dir)
  }, [setOutputDir])

  // Execute resize — triggers pulse on start and completion
  const handleResize = useCallback(async () => {
    if (images.length === 0) return
    setIsResizing(true)
    setResults(null)
    setError(null)
    setProgress({ current: 0, total: images.length, fileName: '' })

    // Pulse on start
    setBgPulse(true)
    setTimeout(() => setBgPulse(false), 100)

    try {
      const res = await window.electronAPI?.resizeImages({
        files: images.map((img) => ({
          path: img.path,
          name: img.name,
          size: img.size,
          width: img.width,
          height: img.height,
        })),
        options: {
          mode: settings.mode,
          percentage: settings.percentage,
          width: settings.width,
          height: settings.height,
          keepAspect: settings.keepAspect,
          format: settings.format,
          outputDir: outputDir,
        },
      })
      setResults(res)

      // Pulse on completion
      setBgPulse(true)
      setTimeout(() => setBgPulse(false), 100)

      if (soundEnabled) playCompleteSound()
    } catch (err) {
      setError(err.message || 'Resize failed')
    } finally {
      setIsResizing(false)
    }
  }, [images, settings, outputDir, soundEnabled])

  const handleReset = useCallback(() => {
    setImages([])
    setResults(null)
    setError(null)
    setProgress({ current: 0, total: 0, fileName: '' })
  }, [])

  const hasImages = images.length > 0
  const referenceImage = images[0] || null

  return (
    <div className="h-screen flex flex-col relative">
      {/* Animated background — behind everything */}
      <ShadowFlameBackground paused={isResizing} pulseActive={bgPulse} />

      <TitleBar />

      {/* Progress overlay */}
      <ProgressOverlay
        isVisible={isResizing}
        progress={progress.total > 0 ? (progress.current / progress.total) * 100 : 0}
        current={progress.current}
        total={progress.total}
        fileName={progress.fileName}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative z-0">
        {/* Left panel — images */}
        <div className="w-[380px] shrink-0 flex flex-col monarch-panel border-r border-neon-violet/[0.06] p-4 gap-4 overflow-y-auto">
          <DropZone onFilesSelected={loadFiles} disabled={isResizing} />
          <ImageList images={images} onRemove={removeImage} onClear={clearImages} />
        </div>

        {/* Right panel — controls & results */}
        <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
          {/* Controls header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-display font-semibold text-white/60 uppercase tracking-wider">
              Resize Settings
            </h2>
            <div className="flex items-center gap-3">
              {/* Sound toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`
                  flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition-all
                  ${soundEnabled
                    ? 'text-neon-cyan/60 hover:text-neon-cyan/80'
                    : 'text-white/20 hover:text-white/40'
                  }
                `}
                title={soundEnabled ? 'Sound enabled' : 'Sound disabled'}
              >
                {soundEnabled ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Resize controls card */}
          <div className="monarch-card rounded-lg p-4">
            <ResizeControls
              settings={settings}
              onChange={setSettings}
              referenceImage={referenceImage}
            />
          </div>

          {/* Output directory */}
          <div className="flex items-center gap-2">
            <button
              onClick={selectOutputDir}
              className="monarch-card flex items-center gap-2 px-3 py-2 rounded-md text-xs text-white/50 hover:text-white/70 transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              Output folder
            </button>
            <span className="text-[11px] font-mono text-white/25 truncate flex-1 min-w-0">
              {outputDir || 'Default: ./output'}
            </span>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-2 rounded-md bg-red-500/[0.06] border border-red-500/10 text-xs text-red-400/80"
            >
              {error}
            </motion.div>
          )}

          {/* Resize button */}
          {!results && (
            <motion.button
              onClick={handleResize}
              disabled={!hasImages || isResizing}
              className={`
                relative w-full py-3 rounded-lg font-display font-semibold text-sm uppercase tracking-wider transition-all overflow-hidden monarch-btn
                ${hasImages
                  ? 'bg-neon-violet text-white shadow-neon-violet hover:shadow-neon-violet-intense'
                  : 'bg-white/[0.04] text-white/20 cursor-not-allowed'
                }
              `}
              whileHover={hasImages ? { scale: 1.01 } : {}}
              whileTap={hasImages ? { scale: 0.98 } : {}}
            >
              {hasImages && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-neon-violet via-neon-cyan/30 to-neon-violet opacity-0"
                  animate={{ opacity: [0, 0.15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <span className="relative z-10">
                {isResizing ? 'Processing...' : `Resize ${images.length || ''} Image${images.length !== 1 ? 's' : ''}`}
              </span>
            </motion.button>
          )}

          {/* Results */}
          <ResultsPanel
            results={results}
            outputDir={outputDir || (results?.[0]?.outputPath ? results[0].outputPath.substring(0, results[0].outputPath.lastIndexOf('/')) : null)}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  )
}
