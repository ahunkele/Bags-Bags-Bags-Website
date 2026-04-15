import { useEffect, useState } from 'react'
import { fetchUpdates } from '../../services/updates.service'
import type { Update } from '../../types'
import './LatestUpdates.css'

export default function LatestUpdates() {
  const [updates, setUpdates] = useState<Update[]>([])

  useEffect(() => {
    fetchUpdates().then(setUpdates)
  }, [])

  return (
    <section className="latest-updates">
      <h2 className="latest-updates__header">Latest Updates</h2>
      {updates.map((update) => (
        <article key={update._id} className="update-card">
          {update.image?.asset?.url && (
            <div className="update-card__image-wrap">
              <img
                src={update.image.asset.url}
                alt={update.title}
                className="update-card__image"
              />
            </div>
          )}
          <div className="update-card__body">
            <span className="update-card__date">{update.date}</span>
            <h3 className="update-card__title">{update.title}</h3>
            <p className="update-card__text">{update.body}</p>
          </div>
        </article>
      ))}
    </section>
  )
}
