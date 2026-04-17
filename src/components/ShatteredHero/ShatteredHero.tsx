import { useState, useEffect, useRef } from 'react'
import { HERO_VIDEOS } from '../../constants/videos'
import './ShatteredHero.css'

interface CellConfig {
  mask: string
  pan: string
}

const CELLS: CellConfig[] = [
  { mask: 'linear-gradient(110deg, black 0%, black 24%, transparent 42%)',                   pan: 'pan-right' },
  { mask: 'linear-gradient(110deg, transparent 22%, black 36%, black 58%, transparent 74%)', pan: 'pan-left'  },
  { mask: 'linear-gradient(110deg, transparent 56%, black 70%, black 100%)',                 pan: 'pan-up'    },
]

// Middle cell (index 1) reveals first; outer cells follow after a delay
const FADE_DELAYS = [500, 0, 500]

const SWAP_INTERVAL = 9000

function pickRandom(exclude: string[]): string {
  const pool = HERO_VIDEOS.filter(v => !exclude.includes(v))
  const source = pool.length > 0 ? pool : HERO_VIDEOS
  return source[Math.floor(Math.random() * source.length)]
}

interface VideoCellProps {
  mask: string
  pan: string
  offset: number
  fadeInDelay: number
}

function VideoCell({ mask, pan, offset, fadeInDelay }: VideoCellProps) {
  const [front, setFront]       = useState<string>(() => pickRandom([]))
  const [back, setBack]         = useState<string>(() => pickRandom([front]))
  const [showBack, setShowBack] = useState<boolean>(false)
  const [ready, setReady]       = useState<boolean>(false)

  const showBackRef = useRef(showBack)
  const frontRef    = useRef(front)
  const backRef     = useRef(back)
  const revealedRef = useRef(false)

  useEffect(() => { showBackRef.current = showBack }, [showBack])
  useEffect(() => { frontRef.current = front }, [front])
  useEffect(() => { backRef.current  = back  }, [back])

  useEffect(() => {
    const init = setTimeout(() => {
      const interval = setInterval(() => {
        const incoming = !showBackRef.current
        if (incoming) setBack(pickRandom([frontRef.current]))
        else setFront(pickRandom([backRef.current]))
        setTimeout(() => setShowBack(incoming), 100)
      }, SWAP_INTERVAL + Math.random() * 3000)
      return () => clearInterval(interval)
    }, offset)
    return () => clearTimeout(init)
  }, [offset])

  function handleCanPlay() {
    if (revealedRef.current) return
    revealedRef.current = true
    setTimeout(() => setReady(true), fadeInDelay)
  }

  return (
    <div
      className="shattered-hero__cell"
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      <video
        src={front} autoPlay loop muted playsInline
        onCanPlay={handleCanPlay}
        className={`shattered-hero__video ${pan} ${ready && !showBack ? 'shattered-hero__video--visible' : ''}`}
      />
      <video
        src={back} autoPlay loop muted playsInline
        className={`shattered-hero__video ${pan} ${ready && showBack ? 'shattered-hero__video--visible' : ''}`}
      />
    </div>
  )
}

export default function ShatteredHero() {
  return (
    <div className="shattered-hero">
      {CELLS.map((cell, i) => (
        <VideoCell key={i} mask={cell.mask} pan={cell.pan} offset={i * 2000} fadeInDelay={FADE_DELAYS[i]} />
      ))}
      <div className="shattered-hero__overlay" />
    </div>
  )
}
