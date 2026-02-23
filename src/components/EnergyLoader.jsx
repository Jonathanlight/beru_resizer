import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * Animated energy loader — Solo Leveling inspired.
 * Rotating ring, pulsing core, floating particles.
 * Pure CSS/Framer Motion — no canvas, 60fps.
 */
export default function EnergyLoader({ progress = 0, label = '' }) {
  // Generate particle positions deterministically
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2
      const radius = 52 + (i % 3) * 8
      return {
        id: i,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: 2 + (i % 3),
        delay: i * 0.15,
        duration: 1.5 + (i % 3) * 0.5,
      }
    })
  }, [])

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Energy circle container */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 30px rgba(124, 58, 237, 0.2), 0 0 60px rgba(124, 58, 237, 0.1)',
              '0 0 50px rgba(124, 58, 237, 0.4), 0 0 100px rgba(34, 211, 238, 0.15)',
              '0 0 30px rgba(124, 58, 237, 0.2), 0 0 60px rgba(124, 58, 237, 0.1)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Rotating energy ring */}
        <motion.div
          className="absolute inset-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="url(#ring-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="180 84"
            />
          </svg>
        </motion.div>

        {/* Counter-rotating inner ring */}
        <motion.div
          className="absolute inset-5"
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="inner-ring" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="url(#inner-ring)"
              strokeWidth="1"
              strokeDasharray="60 200"
            />
          </svg>
        </motion.div>

        {/* Particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: '50%',
              top: '50%',
              background: p.id % 2 === 0
                ? 'rgba(124, 58, 237, 0.8)'
                : 'rgba(34, 211, 238, 0.8)',
              boxShadow: p.id % 2 === 0
                ? '0 0 6px rgba(124, 58, 237, 0.6)'
                : '0 0 6px rgba(34, 211, 238, 0.6)',
            }}
            animate={{
              x: [p.x * 0.8, p.x, p.x * 0.8],
              y: [p.y * 0.8, p.y, p.y * 0.8],
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Core pulse */}
        <motion.div
          className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-neon-violet/40 to-neon-cyan/20"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Percentage text */}
        <span className="relative z-10 text-lg font-display font-bold text-white/90">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Label */}
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-white/40 font-medium"
        >
          {label}
        </motion.p>
      )}
    </div>
  )
}
