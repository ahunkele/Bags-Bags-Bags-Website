import { useEffect, useState, useRef } from 'react'
import { fetchTracks } from '../../services/tracks.service'
import type { Track } from '../../types'
import './AudioPlayer.css'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const BASE_TRANSFORM = 'translate(-50%, -50%) perspective(900px)'


export default function AudioPlayer() {
  const [tracks, setTracks]             = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [playing, setPlaying]           = useState<boolean>(false)
  const [progress, setProgress]         = useState<number>(0)
  const [duration, setDuration]         = useState<number>(0)
  const [expanded, setExpanded]         = useState<boolean>(true)
  const [closing, setClosing]           = useState<boolean>(false)
  const audioRef     = useRef<HTMLAudioElement>(null)
  const playerRef    = useRef<HTMLDivElement>(null)
  const isHovered    = useRef(false)
  const isVisible    = useRef(true)
  const audioCtxRef    = useRef<AudioContext | null>(null)
  const analyserRef    = useRef<AnalyserNode | null>(null)
  const analysisElRef  = useRef<HTMLAudioElement | null>(null)
  const auraRafRef     = useRef<number>(0)
  const playingRef     = useRef(false)
  const tiltShadowRef  = useRef<string>('')

  // Disable tilt when scrolled off hero
  useEffect(() => {
    const el = playerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting
        if (!entry.isIntersecting) {
          el.style.transform = `${BASE_TRANSFORM} rotateX(0deg) rotateY(0deg)`
          el.style.boxShadow = ''
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Tilt toward cursor from anywhere on screen — desktop only
  useEffect(() => {
    if (window.matchMedia('(max-width: 600px)').matches) return
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isHovered.current || !isVisible.current) return
      const el = playerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const playerCX = rect.left + rect.width  / 2
      const playerCY = rect.top  + rect.height / 2
      const dx = (e.clientX - playerCX) / (window.innerWidth  / 2)
      const dy = (e.clientY - playerCY) / (window.innerHeight / 2)
      const rotY =  dx * 16
      const rotX = -dy * 16

      el.style.transform = `${BASE_TRANSFORM} rotateX(${rotX}deg) rotateY(${rotY}deg)`

      // Shadow shifts opposite to tilt — gives floating depth illusion
      const shadowX =  rotY * 2.5
      const shadowY = -rotX * 2.5
      const tiltShadow = [
        `${shadowX}px ${shadowY}px 60px rgba(0,0,0,0.7)`,
        `${shadowX * 0.5}px ${shadowY * 0.5}px 20px rgba(0,0,0,0.5)`,
      ].join(', ')
      tiltShadowRef.current = tiltShadow
      if (!playingRef.current) {
        el.style.boxShadow = tiltShadow
      }

      // Sheen highlight moves to the side facing the viewer
      el.style.setProperty('--sheen-x', `${(1 - dx) * 50}%`)
      el.style.setProperty('--sheen-y', `${(1 - dy) * 50}%`)
    }
    window.addEventListener('mousemove', handleWindowMouseMove)
    return () => window.removeEventListener('mousemove', handleWindowMouseMove)
  }, [])

  useEffect(() => {
    fetchTracks().then(setTracks)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(auraRafRef.current)
      analysisElRef.current?.pause()
      analysisElRef.current = null
      audioCtxRef.current?.close()
    }
  }, [])

  const setupAudioContext = (src: string) => {
    if (audioCtxRef.current || !src) return
    try {
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8

      // Dedicated analysis element — crossOrigin MUST be set before src
      // so the browser makes a CORS-enabled request from the start
      const el = new Audio()
      el.crossOrigin = 'anonymous'
      el.src = src
      el.preload = 'auto'

      const source = ctx.createMediaElementSource(el)
      // Silencer: audio must flow to destination for the analyser to process it,
      // but we don't want the user to hear this element (main audioRef plays instead)
      const silencer = ctx.createGain()
      silencer.gain.value = 0
      source.connect(analyser)
      analyser.connect(silencer)
      silencer.connect(ctx.destination)

      analysisElRef.current = el
      audioCtxRef.current = ctx
      analyserRef.current = analyser
    } catch (e) {
      console.warn('AudioContext setup failed:', e)
    }
  }

  const startAuraAnimation = () => {
    const el = playerRef.current
    if (!el) return
    el.style.animation = 'none'
    cancelAnimationFrame(auraRafRef.current)

    const analyser = analyserRef.current
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null

    const tick = () => {
      let bass: number, mid: number, treble: number

      if (analyser && data) {
        analyser.getByteFrequencyData(data)
        const binCount = data.length
        const bassEnd = Math.floor(binCount * 0.15)
        const midEnd  = Math.floor(binCount * 0.5)

        let bassSum = 0
        for (let i = 0; i < bassEnd; i++) bassSum += data[i]
        bass = bassSum / bassEnd / 255

        let midSum = 0
        for (let i = bassEnd; i < midEnd; i++) midSum += data[i]
        mid = midSum / (midEnd - bassEnd) / 255

        let trebleSum = 0
        for (let i = midEnd; i < binCount; i++) trebleSum += data[i]
        treble = trebleSum / (binCount - midEnd) / 255
      } else {
        const t = performance.now() / 1000
        bass   = Math.pow((Math.sin(t * 2.1)       + 1) / 2, 0.5) * 0.9
        mid    = Math.pow((Math.sin(t * 3.7 + 1.0) + 1) / 2, 0.5) * 0.5
        treble = Math.pow((Math.sin(t * 6.3 + 2.2) + 1) / 2, 0.5) * 0.6
      }

      const r = Math.round(Math.pow(bass,   0.6) * 255)
      const g = Math.round(Math.pow(mid,    0.6) * 90)
      const b = Math.round(Math.pow(treble, 0.6) * 255)

      const energy = bass * 0.6 + mid * 0.25 + treble * 0.15
      const a1 = Math.min(0.9,  energy * 1.1)
      const a2 = Math.min(0.6,  energy * 0.7)
      const a3 = Math.min(0.35, energy * 0.4)
      const s1 = 24  + bass   * 40
      const s2 = 60  + energy * 70
      const s3 = 110 + energy * 90

      const aura = [
        `0 0 ${s1.toFixed(0)}px rgba(${r},${g},${b},${a1.toFixed(2)})`,
        `0 0 ${s2.toFixed(0)}px rgba(${r},${g},${b},${a2.toFixed(2)})`,
        `0 0 ${s3.toFixed(0)}px rgba(${r},${g},${b},${a3.toFixed(2)})`,
      ].join(', ')

      el.style.boxShadow = tiltShadowRef.current
        ? `${tiltShadowRef.current}, ${aura}`
        : aura

      auraRafRef.current = requestAnimationFrame(tick)
    }

    auraRafRef.current = requestAnimationFrame(tick)
  }

  const stopAuraAnimation = () => {
    cancelAnimationFrame(auraRafRef.current)
    auraRafRef.current = 0
    const el = playerRef.current
    if (!el) return
    el.style.animation = ''       // restore CSS pulse-glow
    el.style.boxShadow = tiltShadowRef.current
  }

  const current = tracks[currentIndex]

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.load()
    const analysisEl = analysisElRef.current
    const src = current?.audio?.asset?.url
    if (analysisEl && src) {
      analysisEl.src = src
      analysisEl.load()
    }
    if (playing) {
      audioRef.current.play()
      analysisEl?.play().catch(() => {})
    }
  }, [currentIndex])

  const togglePlay = async () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      analysisElRef.current?.pause()
      stopAuraAnimation()
      playingRef.current = false
    } else {
      setupAudioContext(current?.audio?.asset?.url ?? '')
      if (audioCtxRef.current?.state === 'suspended') {
        await audioCtxRef.current.resume()
      }
      await audioRef.current.play()
      if (analysisElRef.current) {
        analysisElRef.current.currentTime = audioRef.current.currentTime
        analysisElRef.current.play().catch(() => {})
      }
      startAuraAnimation()
      playingRef.current = true
    }
    setPlaying(prev => !prev)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const time = Number(e.target.value)
    audioRef.current.currentTime = time
    if (analysisElRef.current) analysisElRef.current.currentTime = time
    setProgress(time)
  }

  const handleEnded = () => {
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex(prev => prev + 1)
      // aura keeps running; useEffect syncs analysis element for the new track
    } else {
      analysisElRef.current?.pause()
      stopAuraAnimation()
      playingRef.current = false
      setPlaying(false)
      setProgress(0)
    }
  }

  const handleMouseEnter = () => {
    isHovered.current = true
    const el = playerRef.current
    if (!el) return
    el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease'
    el.style.transform = `${BASE_TRANSFORM} rotateX(0deg) rotateY(0deg)`
    // Only clear shadow when not playing — aura loop owns it while playing
    if (!playingRef.current) el.style.boxShadow = ''
    tiltShadowRef.current = ''
    el.style.setProperty('--sheen-x', '50%')
    el.style.setProperty('--sheen-y', '50%')
  }

  const handleMouseMove = (_e: React.MouseEvent<HTMLDivElement>) => {}

  const handleMouseLeave = () => {
    isHovered.current = false
    const el = playerRef.current
    if (!el) return
    el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 1.2s ease'
  }

  const minimize = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      setExpanded(false)
    }, 380)
  }

  const progressPct = duration ? (progress / duration) * 100 : 0

  if (!current) return null

  return (
    <div
      ref={playerRef}
      className={`audio-player ${expanded ? 'audio-player--expanded' : ''} ${playing ? 'audio-player--playing' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >

      {/* Mini bar — mobile only, shown when collapsed */}
      {!expanded && (
        <div className="audio-player__bar" onClick={() => setExpanded(true)}>
          <div className="audio-player__bar-handle" />
          <div className="audio-player__bar-content">
            <button className="audio-player__btn" onClick={e => { e.stopPropagation(); setCurrentIndex(prev => Math.max(0, prev - 1)) }}>
              &#9664;&#9664;
            </button>
            <button className="audio-player__btn audio-player__btn--play" onClick={e => { e.stopPropagation(); togglePlay() }}>
              {playing ? '❚❚' : '▶'}
            </button>
            <button className="audio-player__btn" onClick={e => { e.stopPropagation(); setCurrentIndex(prev => Math.min(tracks.length - 1, prev + 1)) }}>
              &#9654;&#9654;
            </button>
            <span className="audio-player__bar-title">{current.title}</span>
            {current.coverArt?.asset?.url && (
              <img src={current.coverArt.asset.url} alt={current.title} className="audio-player__bar-cover" />
            )}
          </div>
        </div>
      )}

      {/* Full panel */}
      {expanded && (
        <div className={`audio-player__panel ${closing ? 'audio-player__panel--closing' : ''}`}>

          {/* Light sheen */}
          <div className="audio-player__sheen" />

          {/* Drag handle */}
          <div className="audio-player__handle-wrap" onClick={minimize}>
            <div className="audio-player__handle" />
          </div>

          {/* Header */}
          <div className="audio-player__header">
            Check out some of our songs
          </div>

          {/* Cover art */}
          <div className="audio-player__cover-wrap">
            {current.coverArt?.asset?.url && (
              <img src={current.coverArt.asset.url} alt={current.title} className="audio-player__cover" />
            )}
            <div className="audio-player__cover-overlay" />
          </div>

          {/* Track info */}
          <div className="audio-player__info">
            <span className="audio-player__title">{current.title}</span>
            <span className="audio-player__artist">{current.artist}</span>
          </div>

          {/* Progress */}
          <div className="audio-player__progress">
            <div className="audio-player__seek-track">
              <div className="audio-player__seek-fill" style={{ width: `${progressPct}%` }} />
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={progress}
                onChange={handleSeek}
                className="audio-player__seek"
              />
            </div>
            <div className="audio-player__times">
              <span className="audio-player__time">{formatTime(progress)}</span>
              <span className="audio-player__time">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="audio-player__controls">
            <button className="audio-player__btn audio-player__btn--skip" onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}>
              &#9664;&#9664;
            </button>
            <button className="audio-player__btn audio-player__btn--play" onClick={togglePlay}>
              {playing ? '❚❚' : '▶'}
            </button>
            <button className="audio-player__btn audio-player__btn--skip" onClick={() => setCurrentIndex(prev => Math.min(tracks.length - 1, prev + 1))}>
              &#9654;&#9654;
            </button>
          </div>

          {/* Tracklist */}
          <div className="audio-player__tracklist">
            {tracks.map((track, i) => (
              <div
                key={track._id}
                className={`audio-player__track ${i === currentIndex ? 'audio-player__track--active' : ''}`}
                onClick={async () => {
                  setCurrentIndex(i)
                  if (!playingRef.current) {
                    setupAudioContext(tracks[i]?.audio?.asset?.url ?? '')
                    if (audioCtxRef.current?.state === 'suspended') {
                      await audioCtxRef.current.resume()
                    }
                    startAuraAnimation()
                    playingRef.current = true
                  }
                  setPlaying(true)
                }}
              >
                <span className="audio-player__track-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="audio-player__track-title">{track.title}</span>
                {i === currentIndex && playing && <span className="audio-player__track-playing">▶</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        src={current.audio?.asset?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
    </div>
  )
}
