export interface TourDate {
  _id: string
  date: string
  state: string
  city: string
  venue: string
  venueLink: string
  tickets: string
}

export interface Video {
  _id: string
  title: string
  youtubeId: string
}

export interface Track {
  _id: string
  title: string
  artist: string
  audio: { asset: { url: string } }
  coverArt?: { asset: { url: string } }
}

export interface Update {
  _id: string
  title: string
  date: string
  body: string
  image?: { asset: { url: string } }
}

export interface NavItem {
  label: string
  href: string
  external?: boolean
  route?: string
}

export type SubmitStatus = 'idle' | 'sending' | 'success' | 'error'
