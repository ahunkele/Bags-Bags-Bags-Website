import { useEffect, useState, useCallback, useRef } from 'react'
import './GlitchText.css'

const TARGET = 'BAGS BAGS BAGS'
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&?[]{}|<>\\'
const FRAME_MS = 45
const SCRAMBLE_FRAMES = 18
const SETTLE_PER_CHAR = 2

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

function scrambledVersion() {
  return TARGET.split('').map(c => c === ' ' ? ' ' : randomChar()).join('')
}

export default function GlitchText() {
  const [displayed, setDisplayed] = useState(scrambledVersion)
  const [breathing, setBreathing]  = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef  = useRef<ReturnType<typeof setTimeout>  | null>(null)

  const runScramble = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setBreathing(false)

    let frame = 0
    const lastChar = TARGET.length - 1
    const doneAt   = SCRAMBLE_FRAMES + lastChar * SETTLE_PER_CHAR

    intervalRef.current = setInterval(() => {
      frame++
      const result = TARGET.split('').map((char, i) => {
        if (char === ' ') return ' '
        const settleAt = SCRAMBLE_FRAMES + i * SETTLE_PER_CHAR
        return frame >= settleAt ? char : randomChar()
      }).join('')

      setDisplayed(result)

      if (frame >= doneAt) {
        clearInterval(intervalRef.current!)
        intervalRef.current = null
        setDisplayed(TARGET)
        setBreathing(true)
        // Re-trigger every 8–18 seconds
        const delay = 8000 + Math.random() * 10000
        timeoutRef.current = setTimeout(runScramble, delay)
      }
    }, FRAME_MS)
  }, [])

  useEffect(() => {
    runScramble()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current)  clearTimeout(timeoutRef.current)
    }
  }, [runScramble])

  return (
    <div className={`glitch-text ${breathing ? 'glitch-text--breathing' : ''}`} aria-label="Bags Bags Bags">
      {displayed}
    </div>
  )
}
