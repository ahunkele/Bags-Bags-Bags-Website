import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../../constants/emailjs'
import type { SubmitStatus } from '../../types'
import './ContactUs.css'

export default function ContactUs() {
  const [name, setName]       = useState<string>('')
  const [title, setTitle]     = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [status, setStatus]   = useState<SubmitStatus>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { name, title, message, time: new Date().toLocaleString() },
        EMAILJS_PUBLIC_KEY,
      )
      setStatus('success')
      setName('')
      setTitle('')
      setMessage('')
    } catch (err) {
      console.error('EmailJS error:', err)
      setStatus('error')
    }
  }

  return (
    <section className="contact-us">
      <h2 className="contact-us__header">Contact</h2>
      <form className="contact-us__form" onSubmit={handleSubmit}>
        <input
          className="contact-us__input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="contact-us__input"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="contact-us__textarea"
          placeholder="Message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button className="contact-us__button" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : 'Send'}
        </button>
        {status === 'success' && (
          <p className="contact-us__feedback contact-us__feedback--success">Message sent!</p>
        )}
        {status === 'error' && (
          <p className="contact-us__feedback contact-us__feedback--error">
            Something went wrong. Please try again.
          </p>
        )}
      </form>
    </section>
  )
}
