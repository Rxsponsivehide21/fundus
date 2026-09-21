import { motion } from 'motion/react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />

      {/* Ambient red glow orbs */}
      {[
        { x: '10%', y: '20%', size: 600, delay: 0 },
        { x: '70%', y: '60%', size: 500, delay: 3 },
        { x: '40%', y: '80%', size: 400, delay: 6 },
        { x: '85%', y: '10%', size: 350, delay: 1.5 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(220,38,38,0.18) 0%, rgba(220,38,38,0.04) 50%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{
            duration: 14 + i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}

      {/* SVG wave layers */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: '40vh' }}
      >
        <motion.path
          d="M0,160 C360,260 1080,60 1440,160 L1440,320 L0,320 Z"
          fill="rgba(220,38,38,0.05)"
          animate={{ d: [
            'M0,160 C360,260 1080,60 1440,160 L1440,320 L0,320 Z',
            'M0,200 C400,80 1000,280 1440,120 L1440,320 L0,320 Z',
            'M0,160 C360,260 1080,60 1440,160 L1440,320 L0,320 Z',
          ]}}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M0,200 C400,100 1000,300 1440,180 L1440,320 L0,320 Z"
          fill="rgba(220,38,38,0.07)"
          animate={{ d: [
            'M0,200 C400,100 1000,300 1440,180 L1440,320 L0,320 Z',
            'M0,140 C320,280 1100,80 1440,220 L1440,320 L0,320 Z',
            'M0,200 C400,100 1000,300 1440,180 L1440,320 L0,320 Z',
          ]}}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.path
          d="M0,240 C480,140 960,300 1440,200 L1440,320 L0,320 Z"
          fill="rgba(220,38,38,0.1)"
          animate={{ d: [
            'M0,240 C480,140 960,300 1440,200 L1440,320 L0,320 Z',
            'M0,180 C520,280 900,120 1440,260 L1440,320 L0,320 Z',
            'M0,240 C480,140 960,300 1440,200 L1440,320 L0,320 Z',
          ]}}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
      </svg>

      {/* Top wave */}
      <svg
        className="absolute top-0 left-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: '30vh' }}
      >
        <motion.path
          d="M0,160 C360,60 1080,260 1440,160 L1440,0 L0,0 Z"
          fill="rgba(220,38,38,0.06)"
          animate={{ d: [
            'M0,160 C360,60 1080,260 1440,160 L1440,0 L0,0 Z',
            'M0,100 C440,240 1000,40 1440,200 L1440,0 L0,0 Z',
            'M0,160 C360,60 1080,260 1440,160 L1440,0 L0,0 Z',
          ]}}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </svg>

      {/* Horizontal flowing wave ribbons */}
      <svg
        className="absolute left-0 w-full"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ top: '35%', height: '200px' }}
      >
        <motion.path
          d="M0,100 C240,40 480,160 720,100 C960,40 1200,160 1440,100"
          stroke="rgba(220,38,38,0.12)"
          strokeWidth="2"
          fill="none"
          animate={{
            d: [
              'M0,100 C240,40 480,160 720,100 C960,40 1200,160 1440,100',
              'M0,80 C240,160 480,40 720,120 C960,20 1200,140 1440,80',
              'M0,100 C240,40 480,160 720,100 C960,40 1200,160 1440,100',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M0,130 C240,70 480,190 720,130 C960,70 1200,190 1440,130"
          stroke="rgba(220,38,38,0.08)"
          strokeWidth="1.5"
          fill="none"
          animate={{
            d: [
              'M0,130 C240,70 480,190 720,130 C960,70 1200,190 1440,130',
              'M0,110 C240,190 480,50 720,150 C960,30 1200,170 1440,110',
              'M0,130 C240,70 480,190 720,130 C960,70 1200,190 1440,130',
            ],
          }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </svg>

      {/* Glass shimmer overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.015) 0%, transparent 50%, rgba(255,255,255,0.01) 100%)',
        }}
      />
    </div>
  );
}
