import { client } from '../lib/sanity'
import type { TourDate } from '../types'

export async function fetchTourDates(): Promise<TourDate[]> {
  const all = await client.fetch<TourDate[]>(`*[_type == "tourDate"]`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return all
    .filter((show) => new Date(show.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
