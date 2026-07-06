import { client } from '../lib/sanity'
import type { TourDate } from '../types'

export async function fetchTourDates(): Promise<TourDate[]> {
  const all = await client.fetch<TourDate[]>(`*[_type == "tourDate"] | order(date asc)`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return all.filter((show) => new Date(show.date) >= today)
}
