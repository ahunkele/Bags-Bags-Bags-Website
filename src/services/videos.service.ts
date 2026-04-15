import { client } from '../lib/sanity'
import type { Video } from '../types'

export async function fetchVideos(): Promise<Video[]> {
  return client.fetch<Video[]>(`*[_type == "video"]`)
}
