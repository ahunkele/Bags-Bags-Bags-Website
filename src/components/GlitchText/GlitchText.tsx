import { useEffect, useState } from 'react'
import './GlitchText.css'

const TARGET = 'BAGS BAGS BAGS'
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&?[]{}|<>\\'
const FRAME_MS = 45          // ms between scramble frames
const SCRAMBLE_FRAMES = 18   // ~800ms of full scramble before settling starts
const SETTLE_PER_CHAR = 2    // frames between each character locking in

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

function scrambledVersion() {
  return TARGET.split('').map(c => c === ' ' ? ' ' : randomChar()).join('')
}

export default function GlitchText() {
  const [displayed, setDisplayed] = useState(scrambledVersion)

  useEffect(() => {
    let frame = 0
    const lastChar = TARGET.length - 1

    const id = setInterval(() => {
      frame++
      const result = TARGET.split('').map((char, i) => {
        if (char === ' ') return ' '
        const settleAt = SCRAMBLE_FRAMES + i * SETTLE_PER_CHAR
        return frame >= settleAt ? char : randomChar()
      }).join('')

      setDisplayed(result)

      const doneAt = SCRAMBLE_FRAMES + lastChar * SETTLE_PER_CHAR
      if (frame >= doneAt) {
        clearInterval(id)
        setDisplayed(TARGET)
      }
    }, FRAME_MS)

    return () => clearInterval(id)
  }, [])

  return (
    <div className="glitch-text" aria-label="Bags Bags Bags">
      {displayed}
    </div>
  )
}
