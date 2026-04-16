import NavBar from '../components/NavBar/NavBar'
import { FaSpotify, FaInstagram, FaBandcamp } from 'react-icons/fa'
import HeroText from '../components/HeroText/HeroText'
import GlitchText from '../components/GlitchText/GlitchText'
import TourDates from './TourDates'
import LatestUpdates from '../components/LatestUpdates/LatestUpdates'
import ContactUs from '../components/ContactUs/ContactUs'
import AudioPlayer from '../components/AudioPlayer/AudioPlayer'
import ShatteredHero from '../components/ShatteredHero/ShatteredHero'
import '../styles/App.css'

export default function Home() {
  return (
    <div className="App">
      <NavBar />
      <div className="hero">
        <ShatteredHero />
        <HeroText />
        <div className="hero__socials">
          <a href="https://open.spotify.com/artist/0qlOwnzPBOKKWvUNprgGwl" target="_blank" rel="noopener noreferrer" className="hero__social-link" aria-label="Spotify"><FaSpotify /></a>
          <a href="https://bagsbagsbags.bandcamp.com" target="_blank" rel="noopener noreferrer" className="hero__social-link" aria-label="Bandcamp"><FaBandcamp /></a>
          <a href="https://www.instagram.com/bags.bags.bags.band/" target="_blank" rel="noopener noreferrer" className="hero__social-link" aria-label="Instagram"><FaInstagram /></a>
        </div>
        <div className="hero__player-group">
          <GlitchText />
          <AudioPlayer />
        </div>
      </div>
      <div className="below-hero">
        <LatestUpdates />
        <TourDates />
        <ContactUs />
      </div>
    </div>
  )
}
