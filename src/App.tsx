import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import TourDates from './pages/TourDates'
import Videos from './pages/Videos'
import './styles/transitions.css'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/tour" element={<TourDates />} />
        <Route path="/videos" element={<Videos />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
