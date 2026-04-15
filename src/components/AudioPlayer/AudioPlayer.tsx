import { useEffect, useState, useRef } from 'react'
import { fetchTracks } from '../../services/tracks.service'
import type { Track } from '../../types'
import './AudioPlayer.css'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AudioPlayer() {
  const [tracks, setTracks]             = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [playing, setPlaying]           = useState<boolean>(false)
  const [progress, setProgress]         = useState<number>(0)
  const [duration, setDuration]         = useState<number>(0)
  const [expanded, setExpanded]         = useState<boolean>(true)
  const [closing, setClosing]           = useState<boolean>(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    fetchTracks().then(setTracks)
  }, [])

  const current = tracks[currentIndex]

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.load()
    if (playing) audioRef.current.play()
  }, [currentIndex])

  const togglePlay = () => {
    if (!audioRef.current) return
    playing ? audioRef.current.pause() : audioRef.current.play()
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
    setProgress(time)
  }

  const handleEnded = () => {
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setPlaying(false)
      setProgress(0)
    }
  }

  const minimize = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      setExpanded(false)
    }, 380)
  }

  const expand = () => {
    setExpanded(true)
  }

  const progressPct = duration ? (progress / duration) * 100 : 0

  if (!current) return null

  return (
    <div className={`audio-player ${expanded ? 'audio-player--expanded' : ''}`}>

      {/* Mini bar — mobile only, shown when collapsed */}
      {!expanded && (
        <div className="audio-player__bar" onClick={expand}>
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
                onClick={() => { setCurrentIndex(i); setPlaying(true) }}
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
