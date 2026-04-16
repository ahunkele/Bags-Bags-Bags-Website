import { useEffect, useState } from 'react'
import { fetchUpdates } from '../../services/updates.service'
import type { Update } from '../../types'
import './LatestUpdates.css'

const PAGE_SIZE = 3

export default function LatestUpdates() {
  const [updates, setUpdates]   = useState<Update[]>([])
  const [visible, setVisible]   = useState(PAGE_SIZE)

  useEffect(() => {
    fetchUpdates().then(setUpdates)
  }, [])

  const shown    = updates.slice(0, visible)
  const hasMore  = visible < updates.length

  return (
    <section className="latest-updates">
      <h2 className="latest-updates__header">Latest Updates</h2>
      {shown.map((update) => (
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

      {hasMore && (
        <button
          className="latest-updates__load-more"
          onClick={() => setVisible(v => v + PAGE_SIZE)}
        >
          Load more
          <span className="latest-updates__arrow">↓</span>
        </button>
      )}
    </section>
  )
}
