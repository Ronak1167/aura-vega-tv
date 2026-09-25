import React, { useEffect, useRef } from 'react'

export type AmbientMood = 'aurora' | 'golden_hour' | 'midnight_nebula' | 'dawn'

interface AmbientCanvasProps {
  mood?: AmbientMood
}

export const AmbientCanvas: React.FC<AmbientCanvasProps> = ({ mood = 'aurora' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Particle system configuration tailored for 60fps on TV GPU
    const particleCount = 45
    interface Particle {
      x: number
      y: number
      radius: number
      vx: number
      vy: number
      alpha: number
      baseAlpha: number
      pulseSpeed: number
      color: string
    }

    const particles: Particle[] = []

    const getMoodPalette = (m: AmbientMood) => {
      switch (m) {
        case 'golden_hour':
          return ['#FF9900', '#FF5E36', '#FFB347', '#D48806']
        case 'midnight_nebula':
          return ['#8A2BE2', '#4A00E0', '#00F2FE', '#1E3C72']
        case 'dawn':
          return ['#F43F5E', '#FB7185', '#FDA4AF', '#FDE047']
        case 'aurora':
        default:
          return ['#00F2FE', '#4FACFE', '#10B981', '#00FFCC']
      }
    }

    const palette = getMoodPalette(mood)

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.45 + 0.15
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 120 + 40,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.35,
        alpha: baseAlpha,
        baseAlpha,
        pulseSpeed: Math.random() * 0.015 + 0.005,
        color: palette[Math.floor(Math.random() * palette.length)]
      })
    }

    let time = 0

    const render = () => {
      time += 0.01
      ctx.clearRect(0, 0, width, height)

      // Base atmospheric gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height)
      if (mood === 'golden_hour') {
        bgGrad.addColorStop(0, '#120B06')
        bgGrad.addColorStop(0.5, '#0C0807')
        bgGrad.addColorStop(1, '#07090E')
      } else if (mood === 'midnight_nebula') {
        bgGrad.addColorStop(0, '#0C061A')
        bgGrad.addColorStop(0.6, '#080512')
        bgGrad.addColorStop(1, '#07090E')
      } else if (mood === 'dawn') {
        bgGrad.addColorStop(0, '#150A10')
        bgGrad.addColorStop(0.6, '#0D0811')
        bgGrad.addColorStop(1, '#07090E')
      } else {
        bgGrad.addColorStop(0, '#0A1220')
        bgGrad.addColorStop(0.5, '#080E18')
        bgGrad.addColorStop(1, '#07090E')
      }
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Render floating bioluminescent orbs with soft radial blur
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < -p.radius) p.x = width + p.radius
        if (p.x > width + p.radius) p.x = -p.radius
        if (p.y < -p.radius) p.y = height + p.radius
        if (p.y > height + p.radius) p.y = -p.radius

        p.alpha = p.baseAlpha + Math.sin(time + p.x) * 0.12

        const radial = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius)
        radial.addColorStop(0, p.color)
        radial.addColorStop(0.6, p.color + '44')
        radial.addColorStop(1, 'transparent')

        ctx.save()
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha))
        ctx.fillStyle = radial
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Subtle living room TV scanline / organic noise vignette
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.25,
        width / 2,
        height / 2,
        width * 0.75
      )
      vignette.addColorStop(0, 'transparent')
      vignette.addColorStop(1, 'rgba(4, 6, 10, 0.75)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, width, height)

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [mood])

  return (
    <canvas
      ref={canvasRef}
      className="ambient-canvas-layer"
      style={{ filter: 'blur(30px)' }}
    />
  )
}
