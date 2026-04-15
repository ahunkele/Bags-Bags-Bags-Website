import { client } from '../lib/sanity'
import type { Update } from '../types'

export async function fetchUpdates(): Promise<Update[]> {
  return client.fetch<Update[]>(`
    *[_type == "latestUpdate"] | order(date desc) {
      _id, title, date, body,
      image { asset -> { url } }
    }
  `)
}
