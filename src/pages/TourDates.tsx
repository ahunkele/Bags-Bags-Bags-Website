import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar/NavBar'
import { fetchTourDates } from '../services/tourDates.service'
import type { TourDate } from '../types'
import '../styles/TourDates.css'

export default function TourDates() {
  const [dates, setDates] = useState<TourDate[]>([])

  useEffect(() => {
    fetchTourDates().then(setDates)
  }, [])

  return (
    <section className="tour-dates" id="tour-dates">
      <NavBar />
      <h2 className="tour-dates__header">Tour</h2>
      <div className="tour-dates__grid">
        <div className="tour-dates__row tour-dates__row--header">
          <span>Date</span>
          <span className="tour-dates__location--mobile">Location</span>
          <span className="tour-dates__location--desktop">State</span>
          <span className="tour-dates__location--desktop">City</span>
          <span>Venue</span>
          <span>Tickets</span>
        </div>
        {dates.map((show) => (
          <div key={show._id} className="tour-dates__row">
            <span>{show.date}</span>
            <span className="tour-dates__location--mobile">
              <span className="tour-dates__city">{show.city}</span>
              <span className="tour-dates__state-sub">{show.state}</span>
            </span>
            <span className="tour-dates__location--desktop">{show.state}</span>
            <span className="tour-dates__location--desktop">{show.city}</span>
            <span>
              <a
                href={show.venueLink}
                className="tour-dates__venue-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {show.venue}
              </a>
            </span>
            <span>{show.tickets}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
