import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar/NavBar'
import { fetchVideos } from '../services/videos.service'
import type { Video } from '../types'
import '../styles/Videos.css'

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    fetchVideos().then(setVideos)
  }, [])

  return (
    <section className="videos" id="videos">
      <NavBar />
      <h2 className="videos__header">Videos</h2>
      <div className="videos__grid">
        {videos.map((video) => (
          <div key={video._id} className="videos__item">
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}`}
              title={video.title}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
