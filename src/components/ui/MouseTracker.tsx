import { useEffect, useRef, useState } from 'react'

interface Trail { id: number; x: number; y: number }

export function MouseTracker() {
  const ringRef   = useRef<HTMLDivElement>(null)
  const [trails, setTrails] = useState<Trail[]>([])
  const [clicking, setClicking] = useState(false)
  const [hovering, setHovering] = useState(false)
  const trailId   = useRef(0)

  useEffect(() => {
    // DO NOT touch cursor style — keep native arrow
    const onMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${x}px, ${y}px)`
      }

      const id = ++trailId.current
      setTrails(prev => [...prev.slice(-12), { id, x, y }])
    }

    const onDown = () => setClicking(true)
    const onUp   = () => setClicking(false)

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      setHovering(!!el.closest('button, a, input, select, label, [role="button"]'))
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup',   onUp)
    document.addEventListener('mouseover', onOver)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup',   onUp)
      document.removeEventListener('mouseover', onOver)
    }
  }, [])

  // Expire trail dots
  useEffect(() => {
    if (!trails.length) return
    const t = setTimeout(() => setTrails(p => p.slice(1)), 70)
    return () => clearTimeout(t)
  }, [trails])

  return (
    <>
      <style>{`
        @keyframes trailFade {
          0%   { opacity: 0.5; transform: translate(-50%,-50%) scale(1);   }
          100% { opacity: 0;   transform: translate(-50%,-50%) scale(0.2); }
        }
        @keyframes ringPing {
          0%,100% { opacity: 0.55; }
          50%     { opacity: 0.85; }
        }
      `}</style>

      {/* Trail dots */}
      {trails.map((t, i) => (
        <div key={t.id} style={{
          position: 'fixed', left: t.x, top: t.y, pointerEvents: 'none',
          zIndex: 99995,
          width:  5 + i * 0.6,
          height: 5 + i * 0.6,
          borderRadius: '50%',
          background: `rgba(37,99,235,${0.06 + i * 0.035})`,
          transform: 'translate(-50%,-50%)',
          animation: 'trailFade 0.5s ease forwards',
        }} />
      ))}

      {/* Outer ring — lags behind cursor, no cursor override */}
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0,
        pointerEvents: 'none', zIndex: 99996,
        width:  hovering ? 42 : 32,
        height: hovering ? 42 : 32,
        marginLeft: hovering ? -21 : -16,
        marginTop:  hovering ? -21 : -16,
        borderRadius: '50%',
        border: `1.8px solid ${clicking ? '#1d4ed8' : 'rgba(37,99,235,0.42)'}`,
        background: hovering ? 'rgba(37,99,235,0.07)' : 'transparent',
        transition: 'width .18s ease, height .18s ease, margin .18s ease, border-color .15s ease, background .15s ease',
        animation: 'ringPing 2.6s ease-in-out infinite',
        willChange: 'transform',
        transform: 'translate(-200px,-200px)',
      }} />
    </>
  )
}