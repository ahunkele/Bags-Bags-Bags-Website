import { useState } from 'react'
import NavBar from '../components/NavBar/NavBar'
import '../styles/Newsletter.css'

type Status = 'idle' | 'loading' | 'success' | 'error'

async function subscribeEmail(email: string): Promise<void> {
  const apiKey  = import.meta.env.VITE_BREVO_API_KEY
  const listId  = Number(import.meta.env.VITE_BREVO_LIST_ID)

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      email,
      listIds: [listId],
      updateEnabled: true,
    }),
  })

  if (!res.ok && res.status !== 204) {
    throw new Error('Subscription failed')
  }
}

export default function Newsletter() {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError]   = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setError('')
    try {
      await subscribeEmail(email)
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <section className="newsletter">
      <NavBar />
      <div className="newsletter__content">
        <h1 className="newsletter__header">Stay up to date with us</h1>
        <p className="newsletter__sub">
          Shows, releases, and updates — straight to your inbox.
        </p>

        {status === 'success' ? (
          <p className="newsletter__success">You're in. Thanks for signing up.</p>
        ) : (
          <form className="newsletter__form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="newsletter__input"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              className="newsletter__btn"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
            {error && <p className="newsletter__error">{error}</p>}
          </form>
        )}
      </div>
    </section>
  )
}
