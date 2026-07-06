import { client } from '../lib/sanity'
import type { TourDate } from '../types'

export async function fetchTourDates(): Promise<TourDate[]> {
  const today = new Date().toISOString().split('T')[0]
  return client.fetch<TourDate[]>(`*[_type == "tourDate" && date >= $today] | order(date asc)`, { today })
}
