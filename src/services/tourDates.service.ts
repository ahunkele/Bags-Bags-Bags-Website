import { client } from '../lib/sanity'
import type { TourDate } from '../types'

export async function fetchTourDates(): Promise<TourDate[]> {
  return client.fetch<TourDate[]>(`*[_type == "tourDate"] | order(date asc)`)
}
