import { useRef, useEffect } from 'react'
import './HeroText.css'

const ITEM_COUNT = 10
const ANIMATION_DURATION = 12
const REPULSION_RADIUS = 160
const REPULSION_STRENGTH = 280

const base = Array(8).fill('Bags Bags Bags').join('   ')

const FONT_STYLES: React.CSSProperties[] = [
  { fontFamily: "'NeueMachina', sans-serif",           fontWeight: 800, letterSpacing: '0.06em' },
  { fontFamily: "'NeueMachina', sans-serif",           fontWeight: 400, letterSpacing: '0.1em' },
  { fontFamily: "'NeueMachina', sans-serif",           fontWeight: 300, letterSpacing: '0.14em' },
  { fontFamily: "'Cinzel', serif",                     fontWeight: 900, letterSpacing: '0.08em', fontVariant: 'small-caps' },
  { fontFamily: "'Cinzel', serif",                     fontWeight: 400, letterSpacing: '0.18em', fontVariant: 'small-caps' },
  { fontFamily: "'NeueMachina', sans-serif",           fontWeight: 700, letterSpacing: '0.04em' },
  { fontFamily: "'Ronda', sans-serif",                 fontWeight: 400, letterSpacing: '0.2em' },
  { fontFamily: "'Bebas Neue', sans-serif",            fontWeight: 400, letterSpacing: '0.12em' },
  { fontFamily: "'Space Mono', monospace",             fontWeight: 700, letterSpacing: '0.05em' },
  { fontFamily: "'Space Mono', monospace",             fontWeight: 400, letterSpacing: '0.08em' },
  { fontFamily: "'Playfair Display', serif",           fontWeight: 900, letterSpacing: '0.03em', fontStyle: 'italic' },
  { fontFamily: "'Playfair Display', serif",           fontWeight: 400, letterSpacing: '0.06em' },
  { fontFamily: "'Anton', sans-serif",                 fontWeight: 400, letterSpacing: '0.08em' },
  { fontFamily: "'Orbitron', sans-serif",              fontWeight: 900, letterSpacing: '0.1em' },
  { fontFamily: "'Orbitron', sans-serif",              fontWeight: 400, letterSpacing: '0.14em' },
  { fontFamily: "'Oswald', sans-serif",                fontWeight: 700, letterSpacing: '0.1em' },
  { fontFamily: "'Oswald', sans-serif",                fontWeight: 300, letterSpacing: '0.18em' },
  { fontFamily: "'Abril Fatface', serif",              fontWeight: 400, letterSpacing: '0.04em' },
  { fontFamily: "'Rajdhani', sans-serif",              fontWeight: 700, letterSpacing: '0.12em' },
  { fontFamily: "'Rajdhani', sans-serif",              fontWeight: 300, letterSpacing: '0.22em' },
  { fontFamily: "'Monoton', cursive",                  fontWeight: 400, letterSpacing: '0.1em' },
]

const itemStyles = Array.from({ length: ITEM_COUNT }, () =>
  FONT_STYLES[Math.floor(Math.random() * FONT_STYLES.length)]
)

export default function HeroText() {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX
      const mouseY = e.clientY
      const pushDir = (window.innerWidth / 2 - mouseX) / (window.innerWidth / 2)

      itemRefs.current.forEach((el) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const itemCenterY = rect.top + rect.height / 2
        const dist = Math.abs(mouseY - itemCenterY)

        if (dist < REPULSION_RADIUS) {
          const force = (1 - dist / REPULSION_RADIUS) * REPULSION_STRENGTH
          el.style.setProperty('--repulse-x', `${force * pushDir}px`)
        } else {
          el.style.setProperty('--repulse-x', '0px')
        }
      })
    }

    const handleMouseLeave = () => {
      itemRefs.current.forEach((el) => {
        if (el) el.style.setProperty('--repulse-x', '0px')
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div className="cascade-container" ref={containerRef}>
      {Array.from({ length: ITEM_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={el => { itemRefs.current[i] = el }}
          className="cascade-item"
          style={{
            animationDelay: `${-(i / ITEM_COUNT) * ANIMATION_DURATION}s`,
            animationDuration: `${ANIMATION_DURATION}s`,
            ...itemStyles[i],
          }}
        >
          {base}
        </div>
      ))}
    </div>
  )
}
