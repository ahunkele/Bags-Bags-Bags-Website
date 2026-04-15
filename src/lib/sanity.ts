import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: '7l0cqhtv',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
})
