import React from 'react'

const isMac = window.electronAPI?.platform === 'darwin'

/**
 * Custom frameless title bar with window controls (Windows/Linux only).
 * On macOS, native traffic lights are used — we just add a drag region.
 */
export default function TitleBar() {
  return (
    <div className="drag-region flex items-center justify-between h-10 px-4 bg-abyss/40 backdrop-blur-md border-b border-neon-violet/[0.06] select-none shrink-0 relative z-10">
      {/* Left — app title */}
      <div className={`flex items-center gap-2 ${isMac ? 'pl-16' : ''}`}>
        <div className="w-2.5 h-2.5 rounded-full bg-neon-violet shadow-[0_0_8px_rgba(124,58,237,0.6)]" />
        <span className="text-[11px] font-display font-semibold tracking-widest uppercase text-white/50">
          BeruResizer
        </span>
      </div>

      {/* Right — window controls (Windows/Linux) */}
      {!isMac && (
        <div className="no-drag flex items-center gap-1">
          <button
            onClick={() => window.electronAPI?.minimizeWindow()}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/[0.06] transition-colors"
            aria-label="Minimize"
          >
            <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor" className="text-white/40">
              <rect width="10" height="1" />
            </svg>
          </button>
          <button
            onClick={() => window.electronAPI?.maximizeWindow()}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/[0.06] transition-colors"
            aria-label="Maximize"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/40">
              <rect x="0.5" y="0.5" width="9" height="9" />
            </svg>
          </button>
          <button
            onClick={() => window.electronAPI?.closeWindow()}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-500/20 transition-colors group"
            aria-label="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.2" className="text-white/40 group-hover:text-red-400">
              <line x1="1" y1="1" x2="9" y2="9" />
              <line x1="9" y1="1" x2="1" y2="9" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
