import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../../constants/nav'
import { useScrollPast } from '../../hooks/useScrollPast'
import greySquare from '../../assets/greysquare.png'
import './NavBar.css'

export default function NavBar() {
  const [open, setOpen] = useState<boolean>(false)
  const location = useLocation()
  const pastHero = useScrollPast(window.innerHeight)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const showLogo = location.pathname !== '/' || pastHero

  return (
    <nav className="navbar">
      <Link
        to="/"
        className={`navbar-home ${!showLogo || open ? 'navbar-home--hidden' : ''}`}
        onClick={handleHomeClick}
      >
        <img src={greySquare} alt="Home" className="navbar-home__logo" />
      </Link>

      <button
        className={`hamburger ${open ? 'hamburger--open' : ''}`}
        onClick={() => setOpen(prev => !prev)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      <ul
        className={`nav-menu ${open ? 'nav-menu--open' : ''}`}
        onClick={() => setOpen(false)}
      >
        {NAV_ITEMS.map((item) => (
          <li key={item.label} className="nav-item">
            {item.route ? (
              <Link to={item.route} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ) : (
              <a
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
