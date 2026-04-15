import { client } from '../lib/sanity'
import type { Track } from '../types'

export async function fetchTracks(): Promise<Track[]> {
  return client.fetch<Track[]>(`
    *[_type == "track"] {
      _id, title, artist,
      audio { asset -> { url } },
      coverArt { asset -> { url } }
    }
  `)
}
