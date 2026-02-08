import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { getTrendingMovies, getTrendingTv, searchMovies, searchTv, hasApiKey } from './api/tmdb'
import WatchScreen from './screens/WatchScreen'
import LiveChannels from './screens/LiveChannels'
import LiveWatch from './screens/LiveWatch'
import HomePage, { SECTION_IDS } from './screens/HomePage'
import styles from './App.module.css'
import logo from '../../src/assets/Klogo.png'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const isBrowse = location.pathname === '/' || location.pathname === ''

  const [trendingMovies, setTrendingMovies] = useState([])
  const [trendingTv, setTrendingTv] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ movies: [], tv: [] })
  const [searching, setSearching] = useState(false)
  const [loadingTrending, setLoadingTrending] = useState(true)

  useEffect(() => {
    if (!hasApiKey()) {
      setLoadingTrending(false)
      return
    }
    let cancelled = false
    setLoadingTrending(true)
    Promise.all([getTrendingMovies(), getTrendingTv()])
      .then(([movies, tv]) => {
        if (!cancelled) {
          setTrendingMovies(movies)
          setTrendingTv(tv)
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingTrending(false) })
    return () => { cancelled = true }
  }, [])

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults({ movies: [], tv: [] })
      return
    }
    if (!hasApiKey()) return
    setSearching(true)
    Promise.all([searchMovies(query), searchTv(query)])
      .then(([movies, tv]) => setSearchResults({ movies, tv }))
      .finally(() => setSearching(false))
  }

  const handlePlayMovie = (item) => {
    navigate(`/watch/movie/${item.id}`)
  }

  const handlePlayTv = (item, opts = {}) => {
    const s = opts.season ?? 1
    const e = opts.episode ?? 1
    navigate(`/watch/tv/${item.id}?season=${s}&episode=${e}`)
  }

  const scrollToSection = (sectionId) => {
    if (isBrowse) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate('/', { state: { scrollTo: sectionId } })
    }
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <button type="button" className={styles.logo} onClick={() => navigate('/')}>
          <img src={logo} alt="KhattarHub" className={styles.logoImg} />
          <span className={styles.logoText}>KhattarHub</span>
        </button>
        <nav className={styles.nav}>
          <button type="button" className={styles.navLink} onClick={() => navigate('/')}>
            Home
          </button>
          <button type="button" className={styles.navLink} onClick={() => scrollToSection(SECTION_IDS.movies)}>
            Movies
          </button>
          <button type="button" className={styles.navLink} onClick={() => scrollToSection(SECTION_IDS.series)}>
            Series
          </button>
          <button type="button" className={styles.navLink} onClick={() => isBrowse ? scrollToSection(SECTION_IDS.liveTv) : navigate('/live')}>
            Live TV & Sports
          </button>
        </nav>
      </header>

      <main className={styles.main}>
        <Routes>
          <Route path="/watch/:type/:id" element={<WatchScreen />} />
          <Route path="/live/watch" element={<LiveWatch />} />
          <Route path="/live" element={<LiveChannels />} />
          <Route path="/" element={
            <HomePage
              trendingMovies={trendingMovies}
              trendingTv={trendingTv}
              loadingTrending={loadingTrending}
              searchQuery={searchQuery}
              searchResults={searchResults}
              searching={searching}
              handleSearch={handleSearch}
              handlePlayMovie={handlePlayMovie}
              handlePlayTv={handlePlayTv}
            />
          } />
        </Routes>
      </main>
    </div>
  )
}
